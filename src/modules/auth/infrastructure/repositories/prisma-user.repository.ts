import { Injectable } from '@nestjs/common';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    return raw ? this.toDomain(raw) : null;
  }

  async create(user: User): Promise<User> {
    const raw = await this.prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email.toString(),
        password: user.password.toString(),
        status: user.status,
      },
    });
    return this.toDomain(raw);
  }

  private toDomain(raw: PrismaUser): User {
    const result = User.create({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      password: raw.password,
      status: raw.status,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });

    if (!result.ok) {
      throw new Error(
        `Inconsistência no banco: ${result.error} (id=${raw.id})`,
      );
    }

    return result.value;
  }
}
