import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MOVIE_REVIEW_REPOSITORY } from './domain/repositories/movie-review.repository.interface';
import { CreateMovieReviewUseCase } from './application/use-cases/create-movie-review.use-case';
import { PrismaMovieReviewRepository } from './infrastructure/repositories/prisma-movie-review.repository';
import { MovieReviewController } from './presentation/controllers/movie-review.controller';

@Module({
  controllers: [MovieReviewController],
  providers: [
    CreateMovieReviewUseCase,
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
    {
      provide: MOVIE_REVIEW_REPOSITORY,
      useClass: PrismaMovieReviewRepository,
    },
  ],
})
export class ReviewsModule {}
