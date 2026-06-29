/**
 * Category — value object.
 *
 * Represents a NewsAPI top-headlines category.
 * Equality is by value.
 *
 * Layer: domain.
 */

import { DomainError } from '../errors/DomainError';

export const VALID_CATEGORIES = [
  'business',
  'entertainment',
  'general',
  'health',
  'science',
  'sports',
  'technology',
] as const;

export type CategoryValue = (typeof VALID_CATEGORIES)[number];

export class Category {
  readonly value: CategoryValue;

  constructor(value: string) {
    if (!VALID_CATEGORIES.includes(value as CategoryValue)) {
      throw new DomainError(
        `"${value}" is not a valid category. Valid values: ${VALID_CATEGORIES.join(', ')}.`,
      );
    }
    this.value = value as CategoryValue;
  }

  equals(other: Category): boolean {
    return this.value === other.value;
  }

  /** Human-readable label with title case. */
  label(): string {
    return this.value.charAt(0).toUpperCase() + this.value.slice(1);
  }

  toString(): string {
    return this.value;
  }
}
