/**
 * NewsApiError — typed error for all failures that originate from the
 * NewsAPI.org HTTP client.
 *
 * Carries the raw HTTP status code (when available) and the NewsAPI
 * "code" string (e.g. "apiKeyInvalid", "rateLimited") so callers can
 * distinguish recoverable from unrecoverable conditions without parsing
 * free-form message strings.
 *
 * Layer: infrastructure.
 */
export class NewsApiError extends Error {
  /** HTTP status code returned by NewsAPI, or 0 for network-level failures. */
  readonly statusCode: number;

  /**
   * The NewsAPI machine-readable error code, e.g. "apiKeyInvalid".
   * Undefined when the failure is HTTP-level (non-2xx without a JSON body).
   */
  readonly newsApiCode: string | undefined;

  constructor(message: string, statusCode: number, newsApiCode?: string) {
    super(message);
    this.name = 'NewsApiError';
    this.statusCode = statusCode;
    this.newsApiCode = newsApiCode;
    // Restore prototype chain (required when extending built-ins in TypeScript)
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** Returns true for errors the caller can retry after a delay. */
  isRateLimited(): boolean {
    return this.statusCode === 429 || this.newsApiCode === 'rateLimited';
  }

  /** Returns true when the API key is missing or invalid. */
  isAuthError(): boolean {
    return (
      this.statusCode === 401 ||
      this.newsApiCode === 'apiKeyInvalid' ||
      this.newsApiCode === 'apiKeyDisabled' ||
      this.newsApiCode === 'apiKeyMissing'
    );
  }
}
