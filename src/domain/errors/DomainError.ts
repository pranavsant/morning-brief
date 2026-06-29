/**
 * DomainError — base class for all domain-layer errors.
 *
 * Never contains HTTP status codes or infrastructure concerns.
 *
 * Layer: domain.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
    // Restore prototype chain (required when extending built-ins in TypeScript)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
