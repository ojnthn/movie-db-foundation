import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  DomainException,
} from '../../../../shared/exceptions/domain.exception';
import { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { randomUUID } from 'crypto';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterOutput {
  token: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }

    const userResult = User.create({
      id: randomUUID(),
      name: input.name,
      email: input.email,
      password: input.password,
    });

    if (!userResult.ok) {
      throw new DomainException(userResult.error);
    }

    const created = await this.userRepository.create(userResult.value);

    const token = this.jwtService.sign({
      sub: created.id,
      email: created.email.toString(),
    });

    return { token };
  }
}
