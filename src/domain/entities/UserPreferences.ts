/**
 * UserPreferences — entity (session-scoped, no persistence in v1).
 *
 * Captures what the user wants to read about each morning.
 *
 * Layer: domain — no imports from outside domain/.
 */

import { Category } from '../value-objects/Category';
import { DomainError } from '../errors/DomainError';

export const MAX_CATEGORIES = 6;
export const MIN_CATEGORIES = 1;

export class UserPreferences {
  private _categories: Category[];
  private _maxArticlesPerCategory: number;

  constructor(categories: Category[], maxArticlesPerCategory = 5) {
    UserPreferences.guardCategories(categories);
    UserPreferences.guardMaxArticles(maxArticlesPerCategory);

    this._categories              = [...new Set(categories.map((c) => c.value))].map(
      (v) => new Category(v as Category['value']),
    );
    this._maxArticlesPerCategory  = maxArticlesPerCategory;
  }

  get categories(): ReadonlyArray<Category>  { return this._categories; }
  get maxArticlesPerCategory(): number        { return this._maxArticlesPerCategory; }

  updateCategories(categories: Category[]): UserPreferences {
    UserPreferences.guardCategories(categories);
    return new UserPreferences(categories, this._maxArticlesPerCategory);
  }

  updateMaxArticles(max: number): UserPreferences {
    UserPreferences.guardMaxArticles(max);
    return new UserPreferences([...this._categories], max);
  }

  private static guardCategories(categories: Category[]): void {
    if (categories.length < MIN_CATEGORIES) {
      throw new DomainError(`At least ${MIN_CATEGORIES} category must be selected.`);
    }
    if (categories.length > MAX_CATEGORIES) {
      throw new DomainError(`No more than ${MAX_CATEGORIES} categories may be selected.`);
    }
  }

  private static guardMaxArticles(max: number): void {
    if (!Number.isInteger(max) || max < 1 || max > 20) {
      throw new DomainError('maxArticlesPerCategory must be an integer between 1 and 20.');
    }
  }
}
