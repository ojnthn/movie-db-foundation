import { fail, ok, Result } from '../../../../shared/types/result';

const MD5_REGEX = /^[a-f0-9]{32}$/i;

export class Password {
  private constructor(private readonly value: string) {}

  static create(raw: string): Result<Password> {
    if (!raw || !MD5_REGEX.test(raw)) {
      return fail(
        'A senha deve ser um hash MD5 válido (32 caracteres hexadecimais)',
      );
    }
    return ok(new Password(raw.toLowerCase()));
  }

  matches(other: Password): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
