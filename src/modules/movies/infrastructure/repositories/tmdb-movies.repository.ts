import { Injectable } from '@nestjs/common';
import { ExternalApiException, RestClient } from '../../../../shared/http';
import { CacheService } from '../../../../shared/cache/cache.interface';
import { Movie } from '../../domain/entities/movie.entity';
import {
  GetPopularMoviesOptions,
  MoviesRepository,
  PopularMoviesResult,
} from '../../domain/repositories/movies.repository.interface';

interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbGenreListResponse {
  genres: TmdbGenre[];
}

interface TmdbMovie {
  id: number;
  backdrop_path: string | null;
  title: string;
  overview: string;
  genre_ids: number[];
}

interface TmdbDiscoverResponse {
  page: number;
  total_pages: number;
  results: TmdbMovie[];
}

interface TmdbMovieDetails {
  id: number;
  backdrop_path: string | null;
  title: string;
  overview: string;
  genres: TmdbGenre[];
}

const GENRES_CACHE_KEY = 'tmdb:movies:genres';
const GENRES_CACHE_TTL_SECONDS = 86400;

@Injectable()
export class TmdbMoviesRepository implements MoviesRepository {
  constructor(
    private readonly restClient: RestClient,
    private readonly cacheService: CacheService,
  ) {}

  async getPopular({
    page = 1,
  }: GetPopularMoviesOptions): Promise<PopularMoviesResult> {
    const [genreList, discoverResult] = await Promise.all([
      this.cacheService.getOrSet<TmdbGenreListResponse>(
        GENRES_CACHE_KEY,
        GENRES_CACHE_TTL_SECONDS,
        () =>
          this.restClient.get<TmdbGenreListResponse>('/genre/movie/list', {
            params: { language: 'pt-BR' },
          }),
      ),
      this.restClient.get<TmdbDiscoverResponse>('/discover/movie', {
        params: {
          include_adult: 'false',
          include_video: 'false',
          language: 'pt-BR',
          page,
          sort_by: 'popularity.desc',
          with_release_type: '2|3',
          'release_date.gte': this.formatDate(this.monthsAgo(6)),
          'release_date.lte': this.formatDate(new Date()),
        },
      }),
    ]);

    const genreMap = new Map<number, string>(
      genreList.genres.map((g) => [g.id, g.name]),
    );

    const movies = discoverResult.results.map(
      (m) =>
        new Movie(
          m.id,
          m.backdrop_path,
          m.title,
          m.overview,
          m.genre_ids.map((id) => genreMap.get(id) ?? '').filter(Boolean),
        ),
    );

    return {
      currentPage: discoverResult.page,
      nextPage:
        discoverResult.page < discoverResult.total_pages
          ? discoverResult.page + 1
          : null,
      movies,
    };
  }

  async getById(id: number): Promise<Movie | null> {
    try {
      const movie = await this.restClient.get<TmdbMovieDetails>(
        `/movie/${id}`,
        {
          params: { language: 'pt-BR' },
        },
      );

      return new Movie(
        movie.id,
        movie.backdrop_path,
        movie.title,
        movie.overview,
        movie.genres.map((g) => g.name),
      );
    } catch (error) {
      if (error instanceof ExternalApiException && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  private monthsAgo(months: number): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
