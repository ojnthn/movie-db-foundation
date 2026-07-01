import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../../shared/exceptions/domain.exception';
import type { IUserConfigRepository } from '../../domain/repositories/user-config.repository.interface';
import { USER_CONFIG_REPOSITORY } from '../../domain/repositories/user-config.repository.interface';

export interface GetUserConfigInput {
  userId: string;
}

export interface GetUserConfigOutput {
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
export class GetUserConfigUseCase {
  constructor(
    @Inject(USER_CONFIG_REPOSITORY)
    private readonly userConfigRepository: IUserConfigRepository,
  ) {}

  async execute(input: GetUserConfigInput): Promise<GetUserConfigOutput> {
    const config = await this.userConfigRepository.findByUserId(input.userId);

    if (!config) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      language: config.language,
      region: config.region,
      includeAdult: config.includeAdult,
      favoriteGenres: config.favoriteGenres,
      theme: config.theme,
      itemsPerPage: config.itemsPerPage,
      defaultSortBy: config.defaultSortBy,
      streamingProviders: config.streamingProviders,
      notifications: config.notifications,
    };
  }
}
