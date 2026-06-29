/**
 * ClaudeApiClient — low-level wrapper around the Anthropic SDK.
 *
 * Provides two methods:
 *   • complete()  — returns the full assistant message text (single round-trip).
 *   • stream()    — returns an async iterable of text deltas for streaming UIs.
 *
 * This class contains NO business logic or prompt construction — it is a
 * pure infrastructure adapter responsible only for network I/O. Prompts
 * and system instructions are passed in by callers (typically via the
 * helper functions in {@link prompts.ts}).
 *
 * All failures are normalised into {@link ClaudeApiError} so callers
 * receive typed, predictable errors regardless of SDK version changes.
 *
 * NOTE: The Anthropic SDK requires `dangerouslyAllowBrowser: true` when
 * running in a browser context. For production usage, proxy calls through
 * a backend to keep your API key secret.
 *
 * Layer: infrastructure.
 */

import Anthropic from '@anthropic-ai/sdk';

import { ClaudeApiError } from './ClaudeApiError';

// ── Public parameter types ───────────────────────────────────────────────────

export interface ClaudeApiClientConfig {
  /** Anthropic API key (VITE_ANTHROPIC_API_KEY). */
  apiKey: string;
  /**
   * Claude model identifier, e.g. "claude-3-5-haiku-20241022".
   * Loaded from VITE_CLAUDE_MODEL via env.ts → CompositionRoot.
   */
  model: string;
}

export interface CompleteParams {
  /** The system instruction / persona for the assistant. */
  system: string;
  /** The user message (prompt). */
  userPrompt: string;
  /**
   * Maximum number of tokens in the response.
   * Defaults to 2048 when omitted.
   */
  maxTokens?: number;
}

export interface StreamParams extends CompleteParams {
  /** Callback invoked for each streamed text delta. */
  onDelta: (delta: string) => void;
}

// ── Client ───────────────────────────────────────────────────────────────────

export class ClaudeApiClient {
  private readonly anthropic: Anthropic;
  private readonly model: string;

  constructor(config: ClaudeApiClientConfig) {
    if (!config.apiKey || config.apiKey.trim().length === 0) {
      throw new ClaudeApiError('ClaudeApiClient: apiKey is required.', 0, 'missing_api_key');
    }
    if (!config.model || config.model.trim().length === 0) {
      throw new ClaudeApiError('ClaudeApiClient: model is required.', 0, 'missing_model');
    }

    this.anthropic = new Anthropic({
      apiKey: config.apiKey.trim(),
      // Required for browser environments. In production, proxy through a
      // backend to avoid exposing the key to end users.
      dangerouslyAllowBrowser: true,
    });
    this.model = config.model.trim();
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Send a prompt to Claude and await the full response text.
   *
   * @returns The assistant's reply as a plain string.
   * @throws  {@link ClaudeApiError} on any failure.
   */
  async complete(params: CompleteParams): Promise<string> {
    let response: Anthropic.Message;

    try {
      response = await this.anthropic.messages.create({
        model:      this.model,
        max_tokens: params.maxTokens ?? 2048,
        system:     params.system,
        messages:   [{ role: 'user', content: params.userPrompt }],
      });
    } catch (err) {
      throw this.normaliseError(err);
    }

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    if (text.length === 0) {
      throw new ClaudeApiError(
        'Claude returned an empty response.',
        0,
        'empty_response',
      );
    }

    return text;
  }

  /**
   * Send a prompt to Claude and stream the response token by token.
   * Each text delta is forwarded to the `onDelta` callback.
   *
   * @returns The accumulated full response text (same as concatenating
   *          all deltas received via `onDelta`).
   * @throws  {@link ClaudeApiError} on any failure.
   */
  async stream(params: StreamParams): Promise<string> {
    let accumulated = '';

    try {
      const streamResponse = await this.anthropic.messages.create({
        model:      this.model,
        max_tokens: params.maxTokens ?? 2048,
        system:     params.system,
        messages:   [{ role: 'user', content: params.userPrompt }],
        stream:     true,
      });

      for await (const event of streamResponse) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const delta = event.delta.text;
          accumulated += delta;
          params.onDelta(delta);
        }
      }
    } catch (err) {
      throw this.normaliseError(err);
    }

    if (accumulated.trim().length === 0) {
      throw new ClaudeApiError(
        'Claude returned an empty streamed response.',
        0,
        'empty_response',
      );
    }

    return accumulated.trim();
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Translate any SDK / network error into a typed {@link ClaudeApiError}.
   * If the error is already a ClaudeApiError it is re-thrown as-is.
   */
  private normaliseError(err: unknown): ClaudeApiError {
    if (err instanceof ClaudeApiError) return err;

    // Anthropic SDK errors carry a `status` and `error.type` field.
    if (err && typeof err === 'object' && 'status' in err) {
      const sdkErr = err as {
        status: number;
        message?: string;
        error?: { type?: string; message?: string };
      };
      const message   = sdkErr.error?.message ?? sdkErr.message ?? 'Anthropic API error';
      const errorType = sdkErr.error?.type;
      return new ClaudeApiError(
        `Anthropic API error (HTTP ${sdkErr.status}): ${message}`,
        sdkErr.status,
        errorType,
      );
    }

    const message =
      err instanceof Error ? err.message : String(err);
    return new ClaudeApiError(
      `Claude network error: ${message}`,
      0,
    );
  }
}
