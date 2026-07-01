# CONTEXT — Movies

## Responsabilidade

Expor filmes populares em cartaz, consumindo dados da API TMDB e resolvendo gêneros para nomes legíveis.

> SRP: este módulo tem exatamente uma razão para mudar.

---

## Escopo

### Dentro do escopo

- Listar filmes populares com paginação, filtrados para lançamentos teatrais dos últimos 6 meses
- Obter detalhes de um filme específico por ID

### Fora do escopo

- Busca de filmes por título ou filtros arbitrários
- Favoritos, avaliações ou qualquer dado de usuário
- Armazenar dados de filmes em banco de dados próprio

---

## Casos de Uso

| Use Case | Arquivo | Rota |
|---|---|---|
| `GetPopularMoviesUseCase` | `application/use-cases/get-popular-movies.use-case.ts` | `GET /movies` |
| `GetMovieDetailsUseCase` | `application/use-cases/get-movie-details.use-case.ts` | `GET /movies/:id` |

---

## Entidades de Domínio

### Movie

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `number` | ID do filme na TMDB |
| `backdropPath` | `string \| null` | Caminho relativo da imagem de backdrop na TMDB CDN |
| `name` | `string` | Título do filme |
| `overview` | `string` | Sinopse |
| `genresNames` | `string[]` | Nomes dos gêneros (resolvidos a partir dos IDs TMDB) |

> Entidade anêmica — constructor público, sem factory method nem `Result<T>`. Não há invariantes de negócio a proteger. Gêneros já chegam resolvidos do repositório via `new Movie(...)` no `TmdbMoviesRepository`.

---

## Value Objects

Não se aplica — `Movie` é uma entidade anêmica sem campos com validação própria. Gêneros chegam já resolvidos como `string[]` do repositório.

---

## Interface do Repositório

```typescript
// domain/repositories/movies.repository.interface.ts

export const MOVIES_REPOSITORY = 'MOVIES_REPOSITORY';

export interface GetPopularMoviesOptions {
  page?: number;
}

export interface PopularMoviesResult {
  currentPage: number;
  nextPage: number | null;
  movies: Movie[];
}

export abstract class MoviesRepository {
  abstract getPopular(options: GetPopularMoviesOptions): Promise<PopularMoviesResult>;
  abstract getById(id: number): Promise<Movie | null>;
}
```

> `MoviesRepository` é uma `abstract class` (não `interface`) para permitir uso como token DI no NestJS sem precisar de string token separado. O `movies.module.ts` usa a classe diretamente como token (`provide: MoviesRepository`) — `MOVIES_REPOSITORY` está exportado mas não é utilizado no registro atual.

---

## Contrato da API

### GET /movies

Requer autenticação JWT (`Authorization: Bearer <token>`).

**Query Params:**

| Param | Tipo | Padrão | Descrição |
|---|---|---|---|
| `page` | `number` | `1` | Número da página |

**Response (`200`):**
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

**Erros:**
- `401` — Token ausente ou inválido

### GET /movies/:id

Requer autenticação JWT (`Authorization: Bearer <token>`).

**Path Params:**

| Param | Tipo | Descrição |
|---|---|---|
| `id` | `number` | ID do filme na TMDB |

**Response (`200`):**
```json
{
  "id": 123,
  "backdrop_path": "/path.jpg",
  "name": "Movie Title",
  "overview": "Description...",
  "genres_names": ["Action", "Drama"]
}
```

**Erros:**
- `401` — Token ausente ou inválido
- `404` — Filme não encontrado na TMDB

---

## Erros Esperados

| Exceção | Código HTTP | Quando ocorre |
|---|---|---|
| `UnauthorizedException` (global) | `401` | Token JWT ausente ou inválido — tratado pelo `JwtAuthGuard` global |
| `NotFoundException` | `404` | `GetMovieDetailsUseCase` — TMDB retorna 404 para o ID informado |

> Erros inesperados da TMDB (além do 404 tratado) propagam como `ExternalApiException` via `RestClient`.

---

## Fluxo de Execução

### GetPopularMoviesUseCase

```
1. Controller recebe query param `page` (string | undefined) → converte para number, padrão 1
2. Chama GetPopularMoviesUseCase.execute({ page })
3. UseCase chama moviesRepository.getPopular({ page })
4. TmdbMoviesRepository executa em paralelo (Promise.all):
   a. GET /genre/movie/list
      params: language=en-US
      → mapa de id → nome de gênero
   b. GET /discover/movie
      params: include_adult=false, include_video=false, language=en-US,
              page, sort_by=popularity.desc, with_release_type=2|3,
              release_date.gte=<6 meses atrás>, release_date.lte=<hoje>
5. Resolve genre_ids de cada filme para nomes via genreMap (IDs sem mapeamento filtrados)
6. Mapeia TmdbMovie[] → Movie[] via new Movie(id, backdrop_path, title, overview, genresNames)
7. Calcula nextPage: page < total_pages ? page + 1 : null
8. UseCase mapeia PopularMoviesResult → GetPopularMoviesOutput (camelCase → snake_case para response)
9. Controller retorna HTTP 200
```

### GetMovieDetailsUseCase

```
1. Controller recebe path param `id` (string) → converte para number
2. Chama GetMovieDetailsUseCase.execute({ id })
3. UseCase chama moviesRepository.getById(id)
4. TmdbMoviesRepository executa GET /movie/:id
   params: language=en-US
   - Se TMDB retorna 404 (ExternalApiException com status 404), repositório retorna null
   - Gêneros já vêm embutidos na resposta (`genres: [{id, name}]`) — sem chamada adicional
5. Mapeia TmdbMovieDetails → Movie via new Movie(id, backdrop_path, title, overview, genres.map(name))
6. Se movie for null, UseCase lança NotFoundException
7. UseCase mapeia Movie → GetMovieDetailsOutput (camelCase → snake_case para response)
8. Controller retorna HTTP 200
```

---

## Limites

- Não acessa banco de dados — única fonte de dados é a TMDB via `RestClient`
- Não conhece detalhes do `RestClient` — depende apenas da abstração de `shared/http`
- Domain não importa `@nestjs/*`, Prisma, `class-validator` ou qualquer lib externa

---

## Regras Obrigatórias

- Regra de dependência: `presentation → application → domain ← infrastructure`
- Um use case por operação — nunca múltiplas ações em um único use case (SRP)
- Controllers delegam 100% ao use case — sem lógica de negócio (SRP)
- Resolução de gêneros ocorre exclusivamente no repositório (`TmdbMoviesRepository`) — nunca no use case ou controller
- Chamadas à TMDB sempre em paralelo com `Promise.all` para minimizar latência

---

## O que é Proibido

- Importar `@nestjs/*`, Prisma ou libs externas no domínio
- Chamar TMDB diretamente no use case ou controller — use `MoviesRepository`
- Retornar `genre_ids` numéricos no response — sempre resolver para nomes
- Fazer chamadas sequenciais à TMDB quando podem ser paralelas
- Adicionar lógica de negócio no controller

---

## Dependências Permitidas

| Camada | Pode depender de |
|---|---|
| `domain` | Nenhuma lib externa |
| `application` | `domain/` |
| `infrastructure` | `domain/`, `shared/http`, `@nestjs/common` |
| `presentation` | Use cases via DI, `@nestjs/common`, `@nestjs/swagger` |

---

## Dependências Proibidas

| Camada | Proibido |
|---|---|
| `domain` | `@nestjs/*`, Prisma, `class-validator`, qualquer lib de terceiros |
| `application` | Acesso direto a `RestClient` ou qualquer infraestrutura |
| `presentation` | `MoviesRepository` diretamente; lógica de negócio |

---

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|---|---|---|
| `TMDB_BASE_URL` | Base URL da TMDB: `https://api.themoviedb.org/3` | Sim |
| `TMDB_API_KEY` | Bearer access token da TMDB | Sim |
| `API_TIMEOUT` | Timeout HTTP em ms (padrão: 5000) | Não |

> Variáveis consumidas pelo `HttpModule` de `shared/http`, não diretamente por este módulo.

---

## Convenções

| Artefato | Arquivo | Classe / Constante |
|---|---|---|
| Entidade | `domain/entities/movie.entity.ts` | `Movie` |
| Repositório abstrato | `domain/repositories/movies.repository.interface.ts` | `MoviesRepository` |
| Token DI (exportado, não usado) | `domain/repositories/movies.repository.interface.ts` | `MOVIES_REPOSITORY` |
| Use case | `application/use-cases/get-popular-movies.use-case.ts` | `GetPopularMoviesUseCase` |
| Use case | `application/use-cases/get-movie-details.use-case.ts` | `GetMovieDetailsUseCase` |
| Repositório TMDB | `infrastructure/repositories/tmdb-movies.repository.ts` | `TmdbMoviesRepository` |
| Controller | `presentation/controllers/movies.controller.ts` | `MoviesController` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `shared/http` | `TmdbMoviesRepository` usa `RestClient` para chamadas HTTP à TMDB |
| `AppModule` | `JwtAuthGuard` global protege `GET /movies` — sem `@Public()` necessário |

---

## Decisões Técnicas

- **Chamadas paralelas:** `TmdbMoviesRepository.getPopular` faz `Promise.all` com `/genre/movie/list` e `/discover/movie` para minimizar latência — as duas respostas são independentes.
- **Filtro de data dinâmico:** Data de lançamento calculada em runtime (`monthsAgo(6)` → hoje) — filmes de lançamento teatral (`with_release_type=2|3`) dos últimos 6 meses.
- **Abstract class como token DI:** `MoviesRepository` é `abstract class` em vez de `interface` para ser usável como token no `provide` do NestJS sem custo de injeção extra.
- **Resolução de gêneros no repositório:** IDs TMDB não fazem sentido no domínio — resolvidos para nomes dentro do repositório, que é o único lugar ciente da estrutura da API externa.

---

## Evolução Futura

- Busca de filmes por título (`GET /movies/search?q=`)
- Cache de gêneros (lista raramente muda — candidata a TTL longo)
- Suporte a idioma configurável via query param

---

## O que NÃO Fazer Neste Módulo

- Não acesse TMDB diretamente no use case ou controller — sempre via `MoviesRepository`
- Não retorne `genre_ids` numéricos — sempre resolver para nomes legíveis
- Não faça chamadas TMDB sequenciais quando podem ser paralelas
- Não coloque lógica de mapeamento de resposta fora do repositório ou do use case
- Não armazene dados de filmes em banco — este módulo é puramente proxy da TMDB
