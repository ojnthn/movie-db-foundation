import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DomainException } from '../../../../shared/exceptions/domain.exception';
import { MovieReview } from '../../domain/entities/movie-review.entity';
import type { IMovieReviewRepository } from '../../domain/repositories/movie-review.repository.interface';
import { MOVIE_REVIEW_REPOSITORY } from '../../domain/repositories/movie-review.repository.interface';

export interface CreateMovieReviewInput {
  userId: string;
  movieId: number;
  rate: number;
  loved: boolean;
  review?: string | null;
  logDate: Date;
}

@Injectable()
export class CreateMovieReviewUseCase {
  constructor(
    @Inject(MOVIE_REVIEW_REPOSITORY)
    private readonly movieReviewRepository: IMovieReviewRepository,
  ) {}

  async execute(input: CreateMovieReviewInput): Promise<void> {
    const reviewResult = MovieReview.create({
      id: randomUUID(),
      userId: input.userId,
      movieId: input.movieId,
      rate: input.rate,
      loved: input.loved,
      review: input.review,
      logDate: input.logDate,
    });

    if (!reviewResult.ok) {
      throw new DomainException(reviewResult.error);
    }

    await this.movieReviewRepository.create(reviewResult.value);
  }
}
