import { fail, ok, Result } from '../../../../shared/types/result';

export class Email {
  private constructor(private readonly value: string) {}

  static create(raw: string): Result<Email> {
    if (!raw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      return fail('Email inválido');
    }
    return ok(new Email(raw.toLowerCase().trim()));
  }

  toString(): string {
    return this.value;
  }
}
