/**
 * ClaudeApiError — typed error for all Claude / Anthropic API failures.
 *
 * Mirrors the structure of {@link NewsApiError}: carries a numeric HTTP
 * status code and a string error type so callers can branch on typed
 * conditions without parsing free-form messages.
 *
 * Layer: infrastructure.
 */

export class ClaudeApiError extends Error {
  /**
   * HTTP status code returned by the Anthropic API.
   * 0 indicates a network-level failure (no response received).
   */
  readonly statusCode: number;

  /**
   * Anthropic error type string (e.g. "authentication_error",
   * "rate_limit_error", "invalid_request_error").
   * Undefined when the error did not originate from the API itself
   * (e.g. network timeout, empty response).
   */
  readonly errorType: string | undefined;

  constructor(message: string, statusCode: number, errorType?: string) {
    super(message);
    this.name       = 'ClaudeApiError';
    this.statusCode = statusCode;
    this.errorType  = errorType;
    // Maintain correct prototype chain in transpiled ES5 output.
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** Returns true if the error is due to an invalid or missing API key. */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.errorType === 'authentication_error';
  }

  /** Returns true if the Anthropic rate-limit has been hit. */
  isRateLimited(): boolean {
    return this.statusCode === 429 || this.errorType === 'rate_limit_error';
  }

  /** Returns true if the request was rejected due to content policy. */
  isContentPolicyViolation(): boolean {
    return this.statusCode === 400 && this.errorType === 'invalid_request_error';
  }
}
