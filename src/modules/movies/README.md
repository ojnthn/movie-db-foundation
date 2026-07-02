# Movies

## Objetivo

Expor filmes populares, filmes em cartaz e detalhes de filmes via TMDB API, com resolução de gêneros e paginação.

---

## Responsabilidades

- Listar filmes populares com paginação, ordenados por popularidade (sem filtro de data ou tipo de lançamento)
- Listar filmes em cartaz com paginação, filtrados para lançamentos teatrais dos últimos 6 meses
- Detalhar um filme específico por ID
- Resolver IDs de gênero TMDB para nomes legíveis

> Este módulo não armazena dados em banco. Toda a informação vem da TMDB em tempo real.

---

## Casos de Uso

| Use Case | Descrição | Rota HTTP |
|---|---|---|
| `GetPopularMoviesUseCase` | Lista filmes populares com paginação | `GET /movies/popular` |
| `GetNowPlayingMoviesUseCase` | Lista filmes em cartaz com paginação | `GET /movies/now-playing` |
| `GetMovieDetailsUseCase` | Busca os detalhes de um filme | `GET /movie/:id` |

---

## Fluxo

```
GET /movies/popular?page=1
    → MoviesController.getPopular()
    → GetPopularMoviesUseCase.execute({ page })
    → MoviesRepository.getPopular({ page })
    → TmdbMoviesRepository:
        Promise.all([
          /// Caso exista cache ("tmdb:movies:genres") obtem dele, caso não insira
          GET /genre/movie/list          → genreMap (id → nome)
          GET /discover/movie            → TmdbMovie[]  (sort_by=popularity.desc, sem filtro de data/tipo)
        ])
    → Resolve genre_ids → nomes via genreMap
    → Mapeia TmdbMovie[] → Movie[]
    → Calcula nextPage
    → { pagination, details }  HTTP 200

GET /movies/now-playing?page=1
    → MoviesController.getNowPlaying()
    → GetNowPlayingMoviesUseCase.execute({ page })
    → MoviesRepository.getNowPlaying({ page })
    → TmdbMoviesRepository:
        Promise.all([
          /// Caso exista cache ("tmdb:movies:genres") obtem dele, caso não insira
          GET /genre/movie/list          → genreMap (id → nome)
          GET /discover/movie            → TmdbMovie[]  (with_release_type=2|3, release_date.gte/lte)
        ])
    → Resolve genre_ids → nomes via genreMap
    → Mapeia TmdbMovie[] → Movie[]
    → Calcula nextPage
    → { pagination, details }  HTTP 200

GET /movie/:id
    → MoviesController.getById(id)
    → GetMovieDetailsUseCase.execute({ id })
    → MoviesRepository.getById(id)
    → TmdbMoviesRepository:
        GET /movie/:id                  → TmdbMovieDetails (gêneros já embutidos na resposta)
    → Mapeia TmdbMovieDetails → Movie
    → { movie }  HTTP 200 (ou 404 se TMDB não encontrar o ID)
```

---

## Estrutura Interna

```
modules/movies/
├── CONTEXT.md
├── README.md
├── domain/
│   ├── entities/
│   │   └── movie.entity.ts               # Movie — entidade anêmica (constructor público)
│   └── repositories/
│       └── movies.repository.interface.ts # MoviesRepository (abstract class) + interfaces
├── application/
│   └── use-cases/
│       ├── get-popular-movies.use-case.ts      # GetPopularMoviesUseCase + input/output types
│       ├── get-now-playing-movies.use-case.ts  # GetNowPlayingMoviesUseCase + input/output types
│       └── get-movie-details.use-case.ts       # GetMovieDetailsUseCase + input/output types
├── infrastructure/
│   └── repositories/
│       └── tmdb-movies.repository.ts      # TmdbMoviesRepository — consome TMDB via RestClient
├── presentation/
│   └── controllers/
│       └── movies.controller.ts           # MoviesController — GET /movies/popular, /now-playing, /:id
└── movies.module.ts
```

---

## Dependências

### Módulos NestJS

| Módulo | Finalidade |
|---|---|
| `HttpModule` (shared) | Acesso ao `RestClient` para chamadas à TMDB |
| `CacheModule` (shared) | Acesso ao `Redis` para caches de chamadas à TMDB |

### Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `TMDB_BASE_URL` | Sim | Base URL da TMDB: `https://api.themoviedb.org/3` |
| `TMDB_API_KEY` | Sim | Bearer access token da TMDB |
| `API_TIMEOUT` | Não | Timeout HTTP em ms (padrão: 5000) |

> Variáveis consumidas pelo `HttpModule` de `shared/http`, não diretamente por este módulo.

---

## Como Utilizar

### Registrar no AppModule

```typescript
import { MoviesModule } from './modules/movies/movies.module';

@Module({
  imports: [MoviesModule],
})
export class AppModule {}
```

### Listar filmes populares

```http
GET /movies/popular?page=1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Listar filmes em cartaz

```http
GET /movies/now-playing?page=1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obter detalhes de um filme

```http
GET /movie/:id
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Exemplos

### Listagem com sucesso (`/movies/popular` e `/movies/now-playing`)

**Response (200):**
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

> `pagination.next` é `null` na última página.

### Detalhes com sucesso (`/movie/:id`)

**Response (200):**
```json
{
  "id": 123,
  "backdrop_path": "/path.jpg",
  "name": "Movie Title",
  "overview": "Description...",
  "genres_names": ["Action", "Drama"]
}
```

### Filme não encontrado (`/movie/:id`)

**Response (404):**
```json
{
  "statusCode": 404,
  "message": "Filme não encontrado"
}
```

### Token ausente ou inválido (qualquer rota)

**Response (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## Erros Comuns

| Código | Causa |
|---|---|
| `401` | Token JWT ausente ou inválido — tratado pelo `JwtAuthGuard` global |
| `404` | `GET /movie/:id` — TMDB não encontrou o ID informado |

---

## Como Testar

```bash
# Unit tests (não existem ainda — candidatos: GetPopularMoviesUseCase, GetNowPlayingMoviesUseCase
# e GetMovieDetailsUseCase, cada um com MoviesRepository mockado)
npm run test -- --testPathPattern=movies

# E2E tests
npm run test:e2e -- --testPathPattern=movies

# Curl — filmes populares (substituir <token> pelo JWT obtido em POST /auth)
curl -X GET "http://localhost:3000/movies/popular?page=1" \
  -H "Authorization: Bearer <token>"

# Curl — filmes em cartaz
curl -X GET "http://localhost:3000/movies/now-playing?page=1" \
  -H "Authorization: Bearer <token>"

# Curl — detalhes de um filme
curl -X GET "http://localhost:3000/movies/123" \
  -H "Authorization: Bearer <token>"
```

---

## Observações

- Chamadas à TMDB são paralelas (`Promise.all`) — gêneros e filmes buscados simultaneamente para minimizar latência.
- Módulo expõe duas listagens de filmes, ambas via `/discover/movie`, diferenciadas pelos filtros aplicados:

### Populares
- Sem filtro de tipo de lançamento nem de data — retorna o ranking geral de popularidade da TMDB.

### Em Cartaz
- Retorna apenas lançamentos teatrais (`with_release_type=2|3`).
- Filtro de data calculado em runtime: `release_date.gte = 6 meses atrás`, `release_date.lte = hoje`.

### Comuns aos dois endpoints
- Conteúdo adulto é excluído da busca (`include_adult=false`).
- Vídeos (trailers/clipes) não são incluídos nos resultados (`include_video=false`).
- Busca realizada em português (`language=pt-BR`).
- Resultados ordenados por popularidade decrescente (`sort_by=popularity.desc`).
- Paginação repassada da TMDB via query param `page` — sem acumulação ou agregação de páginas nesta versão.
- IDs de gênero sem mapeamento na lista de gêneros são descartados (filtrados com `.filter(Boolean)`).
- `GET /movie/:id` busca gêneros já embutidos na resposta da TMDB (`genres: [{id, name}]`) — sem chamada adicional a `/genre/movie/list`.
- `JwtAuthGuard` é global — nenhuma rota deste módulo usa `@Public()`.
- Swagger disponível em `GET /docs` (ambiente de desenvolvimento).
