import { Injectable } from '@nestjs/common';
import { NotFoundException } from '../../../../shared/exceptions/domain.exception';
import { MoviesRepository } from '../../domain/repositories/movies.repository.interface';

export interface GetMovieDetailsInput {
  id: number;
}

export interface GetMovieDetailsOutput {
  id: number;
  backdrop_path: string | null;
  name: string;
  overview: string;
  genres_names: string[];
}

@Injectable()
export class GetMovieDetailsUseCase {
  constructor(private readonly moviesRepository: MoviesRepository) {}

  async execute(input: GetMovieDetailsInput): Promise<GetMovieDetailsOutput> {
    const movie = await this.moviesRepository.getById(input.id);

    if (!movie) {
      throw new NotFoundException('Filme não encontrado');
    }

    return {
      id: movie.id,
      backdrop_path: movie.backdropPath,
      name: movie.name,
      overview: movie.overview,
      genres_names: movie.genresNames,
    };
  }
}
