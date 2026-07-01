import { Injectable } from '@nestjs/common';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { UserConfig } from '../../domain/entities/user-config.entity';
import { IUserConfigRepository } from '../../domain/repositories/user-config.repository.interface';

@Injectable()
export class PrismaUserConfigRepository implements IUserConfigRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUserId(userId: string): Promise<UserConfig | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const [genres, providers] = await Promise.all([
      this.prisma.userFavoriteGenre.findMany({ where: { userId } }),
      this.prisma.userStreamingProvider.findMany({ where: { userId } }),
    ]);

    return this.toDomain(
      user,
      genres.map((g) => g.genreId),
      providers.map((p) => p.providerId),
    );
  }

  async update(userId: string, config: UserConfig): Promise<UserConfig> {
    const user = await this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          language: config.language,
          region: config.region,
          includeAdult: config.includeAdult,
          theme: config.theme,
          itemsPerPage: config.itemsPerPage,
          defaultSortBy: config.defaultSortBy,
          newReleasesFromFavoriteGenres:
            config.notifications.newReleasesFromFavoriteGenres,
          watchlistUpcomingReminders:
            config.notifications.watchlistUpcomingReminders,
        },
      });

      await tx.userFavoriteGenre.deleteMany({ where: { userId } });
      await tx.userStreamingProvider.deleteMany({ where: { userId } });

      if (config.favoriteGenres.length > 0) {
        await tx.userFavoriteGenre.createMany({
          data: config.favoriteGenres.map((genreId) => ({ userId, genreId })),
        });
      }

      if (config.streamingProviders.length > 0) {
        await tx.userStreamingProvider.createMany({
          data: config.streamingProviders.map((providerId) => ({
            userId,
            providerId,
          })),
        });
      }

      return updatedUser;
    });

    return this.toDomain(
      user,
      config.favoriteGenres,
      config.streamingProviders,
    );
  }

  private toDomain(
    raw: PrismaUser,
    favoriteGenres: number[],
    streamingProviders: number[],
  ): UserConfig {
    return new UserConfig(
      raw.id,
      raw.language,
      raw.region,
      raw.includeAdult,
      favoriteGenres,
      raw.theme,
      raw.itemsPerPage,
      raw.defaultSortBy,
      streamingProviders,
      {
        newReleasesFromFavoriteGenres: raw.newReleasesFromFavoriteGenres,
        watchlistUpcomingReminders: raw.watchlistUpcomingReminders,
      },
    );
  }
}
