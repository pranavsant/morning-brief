/**
 * BriefController — interface adapter.
 *
 * Thin orchestration layer between the React UI and the use cases.
 * It validates raw UI input, invokes the appropriate use case, and
 * translates application errors into a UI-friendly result shape.
 *
 * It depends ONLY on the application layer (IUseCaseRegistry + DTOs),
 * never on domain or infrastructure.
 *
 * Layer: interfaces.
 */

import { IUseCaseRegistry } from '@application/ports/IUseCaseRegistry';
import { BriefDTO } from '@application/dtos/BriefDTO';
import { GenerateMorningBriefInput } from '@application/use-cases/GenerateMorningBriefUseCase';
import { ApplicationError } from '@application/errors/ApplicationError';

export type ControllerResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export class BriefController {
  constructor(private readonly useCases: IUseCaseRegistry) {}

  async generate(input: GenerateMorningBriefInput): Promise<ControllerResult<BriefDTO>> {
    // Input validation (schema-level only — no business rules)
    if (!Array.isArray(input.categories) || input.categories.length === 0) {
      return { ok: false, error: 'Please select at least one category.' };
    }

    try {
      const data = await this.useCases.generateMorningBrief.execute(input);
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: this.describeError(err) };
    }
  }

  async latest(): Promise<ControllerResult<BriefDTO | null>> {
    try {
      const data = await this.useCases.getLatestBrief.execute();
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: this.describeError(err) };
    }
  }

  private describeError(err: unknown): string {
    if (err instanceof ApplicationError) return err.message;
    if (err instanceof Error) return err.message;
    return 'An unexpected error occurred.';
  }
}
