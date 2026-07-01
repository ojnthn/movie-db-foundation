import { Module } from '@nestjs/common';
import { HttpModule } from '../../shared/http';
import { MoviesRepository } from './domain/repositories/movies.repository.interface';
import { TmdbMoviesRepository } from './infrastructure/repositories/tmdb-movies.repository';
import { GetMovieDetailsUseCase } from './application/use-cases/get-movie-details.use-case';
import { GetPopularMoviesUseCase } from './application/use-cases/get-popular-movies.use-case';
import { MoviesController } from './presentation/controllers/movies.controller';

@Module({
  imports: [HttpModule],
  controllers: [MoviesController],
  providers: [
    GetPopularMoviesUseCase,
    GetMovieDetailsUseCase,
    {
      provide: MoviesRepository,
      useClass: TmdbMoviesRepository,
    },
  ],
})
export class MoviesModule {}
