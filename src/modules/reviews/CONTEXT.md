# CONTEXT — Reviews

## Responsabilidade

Armazenar a avaliação (nota, "amei", texto opcional e data assistida) que um usuário autenticado registra para um filme.

> SRP: este módulo tem exatamente uma razão para mudar — como avaliações de usuários sobre filmes são persistidas.

---

## Escopo

### Dentro do escopo

- Registrar a avaliação de um usuário autenticado para um filme (`movie_id` da TMDB, sem FK — este módulo não valida se o filme existe na TMDB)

### Fora do escopo

- Listar, editar ou remover avaliações (não solicitado pela spec original)
- Buscar dados de filme na TMDB — `movie_id` é apenas armazenado, não validado contra o módulo `movies`
- Cálculo de nota média ou agregações por filme

---

## Casos de Uso

| Use Case | Arquivo | Rota |
|---|---|---|
| `CreateMovieReviewUseCase` | `application/use-cases/create-movie-review.use-case.ts` | `POST /movie/review` |

---

## Entidades de Domínio

### MovieReview

| Campo | Tipo | Invariante |
|---|---|---|
| `id` | `string (UUID)` | Gerado via `randomUUID()` no use case |
| `userId` | `string (UUID)` | ID do usuário autenticado (JWT `sub`) — FK para `users` |
| `movieId` | `number` | ID do filme na TMDB — **sem FK**, não validado contra a TMDB |
| `rate` | `Rate` (value object) | Entre 0 e 5 (aceita meia estrela, ex: `4.5`) |
| `loved` | `boolean` | — |
| `review` | `string \| null` | Texto livre opcional |
| `logDate` | `Date` | Data em que o usuário assistiu ao filme |

---

## Value Objects

### Rate

| Campo | Validação |
|---|---|
| `value` | `number` entre `0` e `5` (inclusive) — `fail('Nota deve estar entre 0 e 5')` caso contrário |

> Único value object do módulo — demais campos (`loved`, `review`, `logDate`) não têm invariante de negócio própria além do formato, já validado no DTO.

---

## Interface do Repositório

```typescript
// domain/repositories/movie-review.repository.interface.ts

export const MOVIE_REVIEW_REPOSITORY = 'MOVIE_REVIEW_REPOSITORY';

export interface IMovieReviewRepository {
  create(review: MovieReview): Promise<MovieReview>;
}
```

---

## Contrato da API

### POST /movie/review

Requer autenticação JWT (`Authorization: Bearer <token>`).

**Request body:**
```json
{
  "movie_id": 1,
  "rate": 4.5,
  "loved": true,
  "review": "Ótimo filme, recomendo!",
  "log_date": "2026-06-30T20:00:00.000Z"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `movie_id` | `number` | Sim | ID do filme na TMDB |
| `rate` | `number` | Sim | Nota de 0 a 5 (aceita meia estrela) |
| `loved` | `boolean` | Sim | Se o usuário "amou" o filme |
| `review` | `string` | Não | Texto livre da avaliação |
| `log_date` | `string (ISO 8601)` | Sim | Data em que o usuário assistiu |

**Response (`201`):** corpo vazio.

**Erros:**
- `401` — Token ausente ou inválido
- `422` — `rate` fora do intervalo 0–5 (`DomainException`)
- `400` — DTO inválido (`class-validator`): campo ausente, `rate`/`movie_id` não numéricos, `log_date` não é data ISO válida

---

## Erros Esperados

| Exceção | Código HTTP | Quando ocorre |
|---|---|---|
| `UnauthorizedException` (global) | `401` | Token JWT ausente ou inválido — tratado pelo `JwtAuthGuard` global |
| `DomainException` | `422` | `Rate.create()` falha — nota fora do intervalo 0–5 |
| `HttpException` | `400` | DTO inválido (class-validator) |

---

## Fluxo de Execução

### CreateMovieReviewUseCase

```
1. Controller extrai userId do JWT via @CurrentUser()
2. Controller recebe CreateMovieReviewDto (movie_id, rate, loved, review?, log_date)
3. Chama CreateMovieReviewUseCase.execute({ userId, movieId, rate, loved, review, logDate })
4. UseCase chama MovieReview.create(...) — valida rate via Rate.create()
5. [Se rate inválido] → throw DomainException
6. UseCase chama IMovieReviewRepository.create(movieReview)
7. PrismaMovieReviewRepository persiste na tabela user_movie_review
8. Controller retorna HTTP 201 (corpo vazio)
```

---

## Limites

- Não acessa TMDB — `movieId` é armazenado sem validação de existência
- Não acessa banco diretamente fora do repositório — apenas via `IMovieReviewRepository` (DIP)
- Domain não importa `@nestjs/*`, Prisma, `class-validator` ou qualquer lib externa

---

## Regras Obrigatórias

- Regra de dependência: `presentation → application → domain ← infrastructure`
- Um use case por operação (SRP)
- Controllers delegam 100% ao use case — sem lógica de negócio
- `Rate` sempre validado via `Rate.create()` — nunca aceitar número fora de 0–5 na entidade
- Mapper Prisma ↔ domínio isolado dentro do repositório

---

## O que é Proibido

- Importar `@nestjs/*`, Prisma ou libs externas no domínio
- Acessar `PrismaClient` diretamente em use cases ou controllers
- Vazar tipos Prisma (`PrismaMovieReview`) para fora do repositório
- Validar `movieId` contra a TMDB neste módulo — fora de escopo
- Conter lógica de negócio no controller

---

## Dependências Permitidas

| Camada | Pode depender de |
|---|---|
| `domain` | Nenhuma lib externa |
| `application` | `domain/`, `shared/exceptions`, `shared/types` |
| `infrastructure` | `domain/`, `@nestjs/*`, `@prisma/client` |
| `presentation` | `application/dtos`, use cases via token DI, `@nestjs/*`, `shared/decorators` |

---

## Dependências Proibidas

| Camada | Proibido |
|---|---|
| `domain` | `@nestjs/*`, Prisma, `class-validator`, qualquer lib de terceiros |
| `application` | `@prisma/client`, `PrismaClient` diretamente |
| `presentation` | Repositório diretamente; lógica de negócio |

---

## Variáveis de Ambiente

Não se aplica — este módulo usa a mesma `DATABASE_URL` já configurada globalmente.

---

## Convenções

| Artefato | Arquivo | Classe / Constante |
|---|---|---|
| Entidade | `domain/entities/movie-review.entity.ts` | `MovieReview` |
| Value Object | `domain/value-objects/rate.vo.ts` | `Rate` |
| Interface repositório | `domain/repositories/movie-review.repository.interface.ts` | `IMovieReviewRepository` |
| Token DI | mesmo arquivo da interface | `MOVIE_REVIEW_REPOSITORY` |
| DTO | `application/dtos/create-movie-review.dto.ts` | `CreateMovieReviewDto` |
| Use case | `application/use-cases/create-movie-review.use-case.ts` | `CreateMovieReviewUseCase` |
| Repositório Prisma | `infrastructure/repositories/prisma-movie-review.repository.ts` | `PrismaMovieReviewRepository` |
| Controller | `presentation/controllers/movie-review.controller.ts` | `MovieReviewController` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `modules/auth` (`User`, tabela `users`) | `userId` é FK para `users.id`, extraído do JWT via `@CurrentUser()` |
| `modules/movies` | Nenhuma dependência direta — `movieId` é apenas um número armazenado, sem chamada à TMDB |
| `shared/exceptions/domain.exception` | Use case lança `DomainException` para nota inválida |
| `AppModule` | `JwtAuthGuard` global protege a rota — sem `@Public()` |

---

## Decisões Técnicas

- **Coluna `review` adicionada:** a spec original lista a tabela `user_movie_review` sem a coluna `review`, mas o request body a inclui — coluna `review` (nullable, `TEXT`) adicionada ao schema para não perder o dado, decisão confirmada com o solicitante.
- **`rate` como `Decimal(2,1)`:** a spec descreve a tabela com `rate: int`, mas o exemplo de request (`4.5`, "0 à 5 estrelas") indica suporte a meia estrela — coluna alterada para `Decimal(2,1)` para não truncar a nota, decisão confirmada com o solicitante.
- **Módulo próprio em vez de estender `movies`:** `movies` é documentado como proxy puro da TMDB, sem banco próprio e explicitamente fora de escopo para dados de usuário/avaliações — criar um módulo `reviews` evita reescrever essa decisão de arquitetura já documentada.
- **Sem FK para filme:** `movieId` referencia um ID da TMDB, uma API externa — não há tabela local de filmes para uma FK apontar, conforme a própria spec ("nao precisa ser fk").
- **Response 201 sem corpo:** a spec pede apenas o status `201 Created`, sem schema de resposta — `execute()` retorna `void` e o controller não devolve payload.

---

## Evolução Futura

- `GET /movie/review` — listar avaliações do usuário autenticado
- Validar `movieId` contra o módulo `movies` antes de persistir
- Nota média por filme

---

## O que NÃO Fazer Neste Módulo

- Não valide `movieId` contra a TMDB — fora de escopo
- Não acesse o banco diretamente no use case — use `IMovieReviewRepository`
- Não coloque lógica de negócio no controller
- Não vaze tipos Prisma (`PrismaMovieReview`) para fora do repositório
