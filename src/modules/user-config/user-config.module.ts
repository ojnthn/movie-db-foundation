import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { USER_CONFIG_REPOSITORY } from './domain/repositories/user-config.repository.interface';
import { GetUserConfigUseCase } from './application/use-cases/get-user-config.use-case';
import { UpdateUserConfigUseCase } from './application/use-cases/update-user-config.use-case';
import { PrismaUserConfigRepository } from './infrastructure/repositories/prisma-user-config.repository';
import { UserConfigController } from './presentation/controllers/user-config.controller';

@Module({
  controllers: [UserConfigController],
  providers: [
    GetUserConfigUseCase,
    UpdateUserConfigUseCase,
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
    {
      provide: USER_CONFIG_REPOSITORY,
      useClass: PrismaUserConfigRepository,
    },
  ],
})
export class UserConfigModule {}
