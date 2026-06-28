import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '../../../../shared/exceptions/domain.exception';
import { Password } from '../../domain/value-objects/password.vo';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';

export interface AuthInput {
  email: string;
  password: string;
}

export interface AuthOutput {
  token: string;
}

@Injectable()
export class AuthUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: AuthInput): Promise<AuthOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user || !user.isActive()) {
      throw new UnauthorizedException();
    }

    const inputPasswordResult = Password.create(input.password);
    if (!inputPasswordResult.ok) {
      throw new UnauthorizedException();
    }

    if (!user.password.matches(inputPasswordResult.value)) {
      throw new UnauthorizedException();
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email.toString(),
    });

    return { token };
  }
}
