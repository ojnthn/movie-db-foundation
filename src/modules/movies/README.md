# Movies Module

Exposes movie data sourced from the TMDB (The Movie Database) API.

## Endpoint

### `GET /movies`

Lists currently popular movies in theaters. Requires JWT authentication.

**Query Params**

| Param | Type   | Default | Description      |
|-------|--------|---------|------------------|
| page  | number | 1       | Page number      |

**Response**

```json
{
  "pagination": {
    "current": 1,
    "next": 2
  },
  "details": [
    {
      "id": 123,
      "backdrop_path": "/path.jpg",
      "name": "Movie Title",
      "overview": "Description...",
      "genres_names": ["Action", "Drama"]
    }
  ]
}
```

`pagination.next` is `null` on the last page.

## Architecture

```
movies/
├── domain/
│   ├── entities/movie.entity.ts          — Movie domain entity
│   └── repositories/
│       └── movies.repository.interface.ts — Abstract repository contract
├── application/
│   └── use-cases/
│       └── get-popular-movies.use-case.ts — Orchestrates fetch + mapping
├── infrastructure/
│   └── repositories/
│       └── tmdb-movies.repository.ts      — TMDB API implementation
└── presentation/
    └── controllers/
        └── movies.controller.ts           — HTTP layer
```

## Environment Variables

| Variable     | Description                                        |
|--------------|----------------------------------------------------|
| TMDB_BASE_URL | TMDB base URL: `https://api.themoviedb.org/3`      |
| TMDB_API_KEY      | TMDB Bearer access token                           |
| API_TIMEOUT  | HTTP timeout in ms (optional, default 5000)        |

## Notes

- Genre IDs from TMDB are resolved to names via `/genre/movie/list` (fetched in parallel with movie list).
- Date range defaults to 6 months ago → today, filtering to theatrical releases (`with_release_type=2|3`).
- JWT guard is applied globally; no `@Public()` decorator needed here.
