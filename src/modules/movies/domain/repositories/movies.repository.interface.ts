import { Movie } from '../entities/movie.entity';

export const MOVIES_REPOSITORY = 'MOVIES_REPOSITORY';

export interface GetPopularMoviesOptions {
  page?: number;
}

export interface PopularMoviesResult {
  currentPage: number;
  nextPage: number | null;
  movies: Movie[];
}

export abstract class MoviesRepository {
  abstract getPopular(
    options: GetPopularMoviesOptions,
  ): Promise<PopularMoviesResult>;
  abstract getById(id: number): Promise<Movie | null>;
}
