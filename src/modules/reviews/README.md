# Reviews

## Objetivo

Armazenar a avaliação de um usuário autenticado sobre um filme (nota, "amei", texto opcional e data assistida).

---

## Responsabilidades

- Registrar a avaliação de um usuário autenticado para um filme (`POST /movie/review`)

---

## Casos de Uso

| Use Case | Descrição | Rota HTTP |
|---|---|---|
| `CreateMovieReviewUseCase` | Persiste a avaliação do usuário autenticado para um filme | `POST /movie/review` |

---

## Fluxo

```
POST /movie/review
    → MovieReviewController.create()
    → CreateMovieReviewUseCase.execute({ userId, movieId, rate, loved, review, logDate })
    → MovieReview.create() — valida rate (0 a 5) via Rate.create()
    → IMovieReviewRepository.create()
    → PrismaMovieReviewRepository grava em user_movie_review
    → HTTP 201 (corpo vazio)
```

---

## Estrutura Interna

```
modules/reviews/
├── CONTEXT.md
├── README.md
├── domain/
│   ├── entities/
│   │   └── movie-review.entity.ts                  # MovieReview
│   ├── value-objects/
│   │   └── rate.vo.ts                               # Rate (0 a 5)
│   └── repositories/
│       └── movie-review.repository.interface.ts     # IMovieReviewRepository + MOVIE_REVIEW_REPOSITORY
├── application/
│   ├── dtos/
│   │   └── create-movie-review.dto.ts               # CreateMovieReviewDto
│   └── use-cases/
│       ├── create-movie-review.use-case.ts
│       └── create-movie-review.use-case.spec.ts
├── infrastructure/
│   └── repositories/
│       └── prisma-movie-review.repository.ts        # PrismaMovieReviewRepository
├── presentation/
│   └── controllers/
│       └── movie-review.controller.ts                # POST /movie/review
└── reviews.module.ts
```

---

## Dependências

### Módulos NestJS

Nenhuma dependência de módulo além do `PrismaClient` local (mesmo padrão do `AuthModule` e `UserConfigModule`).

### Variáveis de Ambiente

Nenhuma variável nova — usa a mesma `DATABASE_URL` já configurada globalmente.

---

## Como Utilizar

### Registrar no AppModule

```typescript
import { ReviewsModule } from './modules/reviews/reviews.module';

@Module({
  imports: [ReviewsModule],
})
export class AppModule {}
```

### Registrar uma avaliação

```http
POST /movie/review
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "movie_id": 1,
  "rate": 4.5,
  "loved": true,
  "review": "Ótimo filme, recomendo!",
  "log_date": "2026-06-30T20:00:00.000Z"
}
```

**Response (201):** corpo vazio.

---

## Erros Comuns

| Código | Causa |
|---|---|
| `400` | DTO inválido — campo ausente, `rate`/`movie_id` não numéricos, `log_date` não é data ISO válida |
| `401` | Token JWT ausente ou inválido — tratado pelo `JwtAuthGuard` global |
| `422` | `rate` fora do intervalo 0–5 |

---

## Como Testar

```bash
# Unit tests
npm run test -- --testPathPattern=reviews

# Curl — registrar avaliação (substituir <token> pelo JWT obtido em POST /auth)
curl -X POST "http://localhost:3000/movie/review" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "movie_id": 1,
    "rate": 4.5,
    "loved": true,
    "review": "Ótimo filme, recomendo!",
    "log_date": "2026-06-30T20:00:00.000Z"
  }'
```

---

## Observações

- `movie_id` não é validado contra a TMDB nem contra o módulo `movies` — apenas armazenado.
- Coluna `review` e tipo `Decimal(2,1)` para `rate` divergem da tabela literal descrita na spec original — ver "Decisões Técnicas" em `CONTEXT.md`.
- `JwtAuthGuard` é global — a rota deste módulo não usa `@Public()`.
- Swagger disponível em `GET /docs` (ambiente de desenvolvimento).
