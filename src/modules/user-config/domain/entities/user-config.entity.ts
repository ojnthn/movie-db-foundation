export interface UserConfigNotifications {
  newReleasesFromFavoriteGenres: boolean;
  watchlistUpcomingReminders: boolean;
}

export class UserConfig {
  constructor(
    public readonly userId: string,
    public readonly language: string,
    public readonly region: string,
    public readonly includeAdult: boolean,
    public readonly favoriteGenres: number[],
    public readonly theme: string,
    public readonly itemsPerPage: number,
    public readonly defaultSortBy: string,
    public readonly streamingProviders: number[],
    public readonly notifications: UserConfigNotifications,
  ) {}
}
