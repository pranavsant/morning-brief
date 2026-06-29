/**
 * ApplicationError — base error for the application layer.
 *
 * Sits between domain errors (pure business rule violations) and
 * infrastructure errors (network / API failures). The interfaces layer
 * catches this to decide HTTP status codes or UI error messages.
 *
 * Layer: application.
 */
export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApplicationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
