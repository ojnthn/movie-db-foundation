import { fail, ok, Result } from '../../../../shared/types/result';
import { Rate } from '../value-objects/rate.vo';

export interface MovieReviewProps {
  id: string;
  userId: string;
  movieId: number;
  rate: Rate;
  loved: boolean;
  review: string | null;
  logDate: Date;
}

export class MovieReview {
  readonly id: string;
  readonly userId: string;
  readonly movieId: number;
  readonly rate: Rate;
  readonly loved: boolean;
  readonly review: string | null;
  readonly logDate: Date;

  private constructor(props: MovieReviewProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.movieId = props.movieId;
    this.rate = props.rate;
    this.loved = props.loved;
    this.review = props.review;
    this.logDate = props.logDate;
  }

  static create(props: {
    id: string;
    userId: string;
    movieId: number;
    rate: number;
    loved: boolean;
    review?: string | null;
    logDate: Date;
  }): Result<MovieReview> {
    const rateResult = Rate.create(props.rate);
    if (!rateResult.ok) return fail(rateResult.error);

    return ok(
      new MovieReview({
        id: props.id,
        userId: props.userId,
        movieId: props.movieId,
        rate: rateResult.value,
        loved: props.loved,
        review: props.review ?? null,
        logDate: props.logDate,
      }),
    );
  }
}
