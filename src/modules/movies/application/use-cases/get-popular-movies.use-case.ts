import { Injectable } from '@nestjs/common';
import { MoviesRepository } from '../../domain/repositories/movies.repository.interface';

export interface GetPopularMoviesInput {
  page?: number;
}

export interface PopularMovieItem {
  id: number;
  backdrop_path: string | null;
  name: string;
  overview: string;
  genres_names: string[];
}

export interface GetPopularMoviesOutput {
  pagination: {
    current: number;
    next: number | null;
  };
  details: PopularMovieItem[];
}

@Injectable()
export class GetPopularMoviesUseCase {
  constructor(private readonly moviesRepository: MoviesRepository) {}

  async execute(input: GetPopularMoviesInput): Promise<GetPopularMoviesOutput> {
    const result = await this.moviesRepository.getPopular({ page: input.page });

    return {
      pagination: {
        current: result.currentPage,
        next: result.nextPage,
      },
      details: result.movies.map((m) => ({
        id: m.id,
        backdrop_path: m.backdropPath,
        name: m.name,
        overview: m.overview,
        genres_names: m.genresNames,
      })),
    };
  }
}
