export class Movie {
  constructor(
    public readonly id: number,
    public readonly backdropPath: string | null,
    public readonly name: string,
    public readonly overview: string,
    public readonly genresNames: string[],
  ) {}
}
