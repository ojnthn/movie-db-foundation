import { Injectable } from '@nestjs/common';
import { RestClient } from '../../../../shared/http';
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

@Injectable()
export class TmdbMoviesRepository implements MoviesRepository {
  constructor(private readonly restClient: RestClient) {}

  async getPopular({ page = 1 }: GetPopularMoviesOptions): Promise<PopularMoviesResult> {
    const [genreList, discoverResult] = await Promise.all([
      this.restClient.get<TmdbGenreListResponse>('/genre/movie/list', {
        params: { language: 'en-US' },
      }),
      this.restClient.get<TmdbDiscoverResponse>('/discover/movie', {
        params: {
          include_adult: 'false',
          include_video: 'false',
          language: 'en-US',
          page,
          sort_by: 'popularity.desc',
          'with_release_type': '2|3',
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
      nextPage: discoverResult.page < discoverResult.total_pages ? discoverResult.page + 1 : null,
      movies,
    };
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
