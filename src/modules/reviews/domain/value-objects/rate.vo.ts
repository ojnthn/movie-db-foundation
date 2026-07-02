import { fail, ok, Result } from '../../../../shared/types/result';

export class Rate {
  private constructor(private readonly value: number) {}

  static create(raw: number): Result<Rate> {
    if (raw === null || raw === undefined || raw < 0 || raw > 5) {
      return fail('Nota deve estar entre 0 e 5');
    }
    return ok(new Rate(raw));
  }

  toNumber(): number {
    return this.value;
  }
}
