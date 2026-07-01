import { NotFoundException } from '../../../../shared/exceptions/domain.exception';
import { UserConfig } from '../../domain/entities/user-config.entity';
import type { IUserConfigRepository } from '../../domain/repositories/user-config.repository.interface';
import {
  UpdateUserConfigInput,
  UpdateUserConfigUseCase,
} from './update-user-config.use-case';

describe('UpdateUserConfigUseCase', () => {
  let useCase: UpdateUserConfigUseCase;
  let repository: jest.Mocked<IUserConfigRepository>;

  const input: UpdateUserConfigInput = {
    userId: 'user-1',
    language: 'pt-BR',
    region: 'BR',
    includeAdult: false,
    favoriteGenres: [28, 12, 878],
    theme: 'dark',
    itemsPerPage: 20,
    defaultSortBy: 'popularity.desc',
    streamingProviders: [8, 337, 119],
    notifications: {
      newReleasesFromFavoriteGenres: true,
      watchlistUpcomingReminders: true,
    },
  };

  beforeEach(() => {
    repository = {
      findByUserId: jest.fn(),
      update: jest.fn(),
    };
    useCase = new UpdateUserConfigUseCase(repository);
  });

  it('deve atualizar as preferências do usuário autenticado', async () => {
    const existing = new UserConfig(
      'user-1',
      'en-US',
      'US',
      false,
      [],
      'dark',
      20,
      'popularity.desc',
      [],
      {
        newReleasesFromFavoriteGenres: true,
        watchlistUpcomingReminders: true,
      },
    );
    const updated = new UserConfig(
      'user-1',
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
    repository.findByUserId.mockResolvedValue(existing);
    repository.update.mockResolvedValue(updated);

    const result = await useCase.execute(input);

    expect(repository.update).toHaveBeenCalledWith(
      'user-1',
      expect.any(UserConfig),
    );
    expect(result).toEqual({
      language: 'pt-BR',
      region: 'BR',
      includeAdult: false,
      favoriteGenres: [28, 12, 878],
      theme: 'dark',
      itemsPerPage: 20,
      defaultSortBy: 'popularity.desc',
      streamingProviders: [8, 337, 119],
      notifications: {
        newReleasesFromFavoriteGenres: true,
        watchlistUpcomingReminders: true,
      },
    });
  });

  it('deve lançar NotFoundException quando o usuário não existir', async () => {
    repository.findByUserId.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow(NotFoundException);
    expect(repository.update).not.toHaveBeenCalled();
  });
});
