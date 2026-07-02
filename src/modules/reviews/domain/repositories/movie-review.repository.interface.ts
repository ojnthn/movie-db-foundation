import { MovieReview } from '../entities/movie-review.entity';

export const MOVIE_REVIEW_REPOSITORY = 'MOVIE_REVIEW_REPOSITORY';

export interface IMovieReviewRepository {
  create(review: MovieReview): Promise<MovieReview>;
}
