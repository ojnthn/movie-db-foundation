import { DomainException } from '../../../../shared/exceptions/domain.exception';
import { MovieReview } from '../../domain/entities/movie-review.entity';
import { IMovieReviewRepository } from '../../domain/repositories/movie-review.repository.interface';
import { CreateMovieReviewUseCase } from './create-movie-review.use-case';

describe('CreateMovieReviewUseCase', () => {
  let useCase: CreateMovieReviewUseCase;
  let repository: jest.Mocked<IMovieReviewRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
    };
    useCase = new CreateMovieReviewUseCase(repository);
  });

  it('deve criar uma avaliação com dados válidos', async () => {
    repository.create.mockImplementation((review: MovieReview) =>
      Promise.resolve(review),
    );

    await useCase.execute({
      userId: 'user-1',
      movieId: 42,
      rate: 4.5,
      loved: true,
      review: 'Ótimo filme',
      logDate: new Date('2026-06-30T20:00:00.000Z'),
    });

    expect(repository.create).toHaveBeenCalledTimes(1);
    const created = repository.create.mock.calls[0][0];
    expect(created.userId).toBe('user-1');
    expect(created.movieId).toBe(42);
    expect(created.rate.toNumber()).toBe(4.5);
    expect(created.loved).toBe(true);
    expect(created.review).toBe('Ótimo filme');
  });

  it('deve criar avaliação sem texto de review (opcional)', async () => {
    repository.create.mockImplementation((review: MovieReview) =>
      Promise.resolve(review),
    );

    await useCase.execute({
      userId: 'user-1',
      movieId: 42,
      rate: 3,
      loved: false,
      logDate: new Date('2026-06-30T20:00:00.000Z'),
    });

    const created = repository.create.mock.calls[0][0];
    expect(created.review).toBeNull();
  });

  it('deve lançar DomainException para rate fora do intervalo 0-5', async () => {
    await expect(
      useCase.execute({
        userId: 'user-1',
        movieId: 42,
        rate: 6,
        loved: true,
        logDate: new Date('2026-06-30T20:00:00.000Z'),
      }),
    ).rejects.toThrow(DomainException);

    expect(repository.create).not.toHaveBeenCalled();
  });
});
