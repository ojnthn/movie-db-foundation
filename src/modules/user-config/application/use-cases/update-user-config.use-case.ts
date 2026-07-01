import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../../shared/exceptions/domain.exception';
import { UserConfig } from '../../domain/entities/user-config.entity';
import type { IUserConfigRepository } from '../../domain/repositories/user-config.repository.interface';
import { USER_CONFIG_REPOSITORY } from '../../domain/repositories/user-config.repository.interface';

export interface UpdateUserConfigInput {
  userId: string;
  language: string;
  region: string;
  includeAdult: boolean;
  favoriteGenres: number[];
  theme: string;
  itemsPerPage: number;
  defaultSortBy: string;
  streamingProviders: number[];
  notifications: {
    newReleasesFromFavoriteGenres: boolean;
    watchlistUpcomingReminders: boolean;
  };
}

export interface UpdateUserConfigOutput {
  language: string;
  region: string;
  includeAdult: boolean;
  favoriteGenres: number[];
  theme: string;
  itemsPerPage: number;
  defaultSortBy: string;
  streamingProviders: number[];
  notifications: {
    newReleasesFromFavoriteGenres: boolean;
    watchlistUpcomingReminders: boolean;
  };
}

@Injectable()
export class UpdateUserConfigUseCase {
  constructor(
    @Inject(USER_CONFIG_REPOSITORY)
    private readonly userConfigRepository: IUserConfigRepository,
  ) {}

  async execute(input: UpdateUserConfigInput): Promise<UpdateUserConfigOutput> {
    const existing = await this.userConfigRepository.findByUserId(input.userId);

    if (!existing) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const config = new UserConfig(
      input.userId,
      input.language,
      input.region,
      input.includeAdult,
      input.favoriteGenres,
      input.theme,
      input.itemsPerPage,
      input.defaultSortBy,
      input.streamingProviders,
      input.notifications,
    );

    const updated = await this.userConfigRepository.update(
      input.userId,
      config,
    );

    return {
      language: updated.language,
      region: updated.region,
      includeAdult: updated.includeAdult,
      favoriteGenres: updated.favoriteGenres,
      theme: updated.theme,
      itemsPerPage: updated.itemsPerPage,
      defaultSortBy: updated.defaultSortBy,
      streamingProviders: updated.streamingProviders,
      notifications: updated.notifications,
    };
  }
}
