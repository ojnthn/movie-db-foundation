# Movies

## Objetivo

Expor filmes populares em cartaz via TMDB API, com resolução de gêneros e paginação.

---

## Responsabilidades

- Listar filmes populares com paginação, filtrados para lançamentos teatrais dos últimos 6 meses
- Resolver IDs de gênero TMDB para nomes legíveis

> Este módulo não armazena dados em banco. Toda a informação vem da TMDB em tempo real.

---

## Casos de Uso

| Use Case | Descrição | Rota HTTP |
|---|---|---|
| `GetPopularMoviesUseCase` | Lista filmes populares com paginação | `GET /movies` |

---

## Fluxo

```
GET /movies?page=1
    → MoviesController.getPopular()
    → GetPopularMoviesUseCase.execute({ page })
    → MoviesRepository.getPopular({ page })
    → TmdbMoviesRepository:
        Promise.all([
          /// Caso exista cache ("tmdb:movies:genres") obtem dele, caso não insere
          GET /genre/movie/list          → genreMap (id → nome) 
          GET /discover/movie            → TmdbMovie[]
        ])
    → Resolve genre_ids → nomes via genreMap
    → Mapeia TmdbMovie[] → Movie[]
    → Calcula nextPage
    → { pagination, details }  HTTP 200
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
│       └── get-popular-movies.use-case.ts # GetPopularMoviesUseCase + input/output types
├── infrastructure/
│   └── repositories/
│       └── tmdb-movies.repository.ts      # TmdbMoviesRepository — consome TMDB via RestClient
├── presentation/
│   └── controllers/
│       └── movies.controller.ts           # MoviesController — GET /movies
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
GET /movies?page=1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Exemplos

### Listagem com sucesso

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

### Token ausente ou inválido

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

---

## Como Testar

```bash
# Unit tests (não existem ainda — candidatos: GetPopularMoviesUseCase com MoviesRepository mockado)
npm run test -- --testPathPattern=movies

# E2E tests
npm run test:e2e -- --testPathPattern=movies

# Curl — listar filmes (substituir <token> pelo JWT obtido em POST /auth)
curl -X GET "http://localhost:3000/movies?page=1" \
  -H "Authorization: Bearer <token>"
```

---

## Observações

- Chamadas à TMDB são paralelas (`Promise.all`) — gêneros e filmes buscados simultaneamente para minimizar latência.
- Filtro de data calculado em runtime: `release_date.gte = 6 meses atrás`, `release_date.lte = hoje`.
- Somente lançamentos teatrais (`with_release_type=2|3`) são retornados.
- IDs de gênero sem mapeamento na lista de gêneros são descartados (filtrados com `.filter(Boolean)`).
- `JwtAuthGuard` é global — nenhuma rota deste módulo usa `@Public()`.
- Swagger disponível em `GET /docs` (ambiente de desenvolvimento).
