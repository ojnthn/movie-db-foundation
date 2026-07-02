import { Injectable } from '@nestjs/common';
import { MovieReview as PrismaMovieReview, PrismaClient } from '@prisma/client';
import { MovieReview } from '../../domain/entities/movie-review.entity';
import { IMovieReviewRepository } from '../../domain/repositories/movie-review.repository.interface';

@Injectable()
export class PrismaMovieReviewRepository implements IMovieReviewRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(review: MovieReview): Promise<MovieReview> {
    const raw = await this.prisma.movieReview.create({
      data: {
        id: review.id,
        userId: review.userId,
        movieId: review.movieId,
        rate: review.rate.toNumber(),
        loved: review.loved,
        review: review.review,
        logDate: review.logDate,
      },
    });
    return this.toDomain(raw);
  }

  private toDomain(raw: PrismaMovieReview): MovieReview {
    const result = MovieReview.create({
      id: raw.id,
      userId: raw.userId,
      movieId: raw.movieId,
      rate: Number(raw.rate),
      loved: raw.loved,
      review: raw.review,
      logDate: raw.logDate,
    });

    if (!result.ok) {
      throw new Error(
        `Inconsistência no banco: ${result.error} (id=${raw.id})`,
      );
    }

    return result.value;
  }
}
