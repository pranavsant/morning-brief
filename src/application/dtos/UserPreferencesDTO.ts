/**
 * UserPreferencesDTO — data transfer object.
 *
 * Layer: application.
 */

export interface UserPreferencesDTO {
  readonly categories: string[];
  readonly maxArticlesPerCategory: number;
}
