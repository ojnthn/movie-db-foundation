import { Injectable } from '@nestjs/common';
import { MoviesRepository } from '../../domain/repositories/movies.repository.interface';

export interface GetNowPlayingMoviesInput {
  page?: number;
}

export interface NowPlayingMovieItem {
  id: number;
  backdrop_path: string | null;
  name: string;
  overview: string;
  genres_names: string[];
}

export interface GetNowPlayingMoviesOutput {
  pagination: {
    current: number;
    next: number | null;
  };
  details: NowPlayingMovieItem[];
}

@Injectable()
export class GetNowPlayingMoviesUseCase {
  constructor(private readonly moviesRepository: MoviesRepository) {}

  async execute(
    input: GetNowPlayingMoviesInput,
  ): Promise<GetNowPlayingMoviesOutput> {
    const result = await this.moviesRepository.getNowPlaying({
      page: input.page,
    });

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
