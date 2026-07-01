import { NotFoundException } from '../../../../shared/exceptions/domain.exception';
import { UserConfig } from '../../domain/entities/user-config.entity';
import type { IUserConfigRepository } from '../../domain/repositories/user-config.repository.interface';
import { GetUserConfigUseCase } from './get-user-config.use-case';

describe('GetUserConfigUseCase', () => {
  let useCase: GetUserConfigUseCase;
  let repository: jest.Mocked<IUserConfigRepository>;

  beforeEach(() => {
    repository = {
      findByUserId: jest.fn(),
      update: jest.fn(),
    };
    useCase = new GetUserConfigUseCase(repository);
  });

  it('deve retornar as preferências do usuário autenticado', async () => {
    const config = new UserConfig(
      'user-1',
      'pt-BR',
      'BR',
      false,
      [28, 12, 878],
      'dark',
      20,
      'popularity.desc',
      [8, 337, 119],
      {
        newReleasesFromFavoriteGenres: true,
        watchlistUpcomingReminders: true,
      },
    );
    repository.findByUserId.mockResolvedValue(config);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(repository.findByUserId).toHaveBeenCalledWith('user-1');
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

    await expect(useCase.execute({ userId: 'unknown' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
