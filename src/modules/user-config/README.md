# User Config

## Objetivo

Armazenar e expor as preferências de exibição e notificação do usuário autenticado.

---

## Responsabilidades

- Consultar as preferências do usuário autenticado (`GET /user/config`)
- Substituir integralmente as preferências do usuário autenticado (`PUT /user/config`)

> Preferências escalares residem na tabela `users`; gêneros favoritos e provedores de streaming residem em tabelas próprias (`user_favorite_genres`, `user_streaming_providers`).

---

## Casos de Uso

| Use Case | Descrição | Rota HTTP |
|---|---|---|
| `GetUserConfigUseCase` | Retorna as preferências do usuário autenticado | `GET /user/config` |
| `UpdateUserConfigUseCase` | Substitui as preferências do usuário autenticado | `PUT /user/config` |

---

## Fluxo

```
PUT /user/config
    → UserConfigController.update()
    → UpdateUserConfigUseCase.execute({ userId, ...dto })
    → IUserConfigRepository.findByUserId() — confirma que o usuário existe
    → IUserConfigRepository.update():
        $transaction:
          user.update()                         → campos escalares
          userFavoriteGenre.deleteMany + createMany
          userStreamingProvider.deleteMany + createMany
    → { preferências atualizadas }  HTTP 200
```

---

## Estrutura Interna

```
modules/user-config/
├── CONTEXT.md
├── README.md
├── domain/
│   ├── entities/
│   │   └── user-config.entity.ts                  # UserConfig — entidade anêmica
│   └── repositories/
│       └── user-config.repository.interface.ts     # IUserConfigRepository + USER_CONFIG_REPOSITORY
├── application/
│   ├── dtos/
│   │   └── update-user-config.dto.ts                # UpdateUserConfigDto + NotificationsDto
│   └── use-cases/
│       ├── get-user-config.use-case.ts
│       ├── get-user-config.use-case.spec.ts
│       ├── update-user-config.use-case.ts
│       └── update-user-config.use-case.spec.ts
├── infrastructure/
│   └── repositories/
│       └── prisma-user-config.repository.ts         # PrismaUserConfigRepository
├── presentation/
│   └── controllers/
│       └── user-config.controller.ts                # GET /user/config, PUT /user/config
└── user-config.module.ts
```

---

## Dependências

### Módulos NestJS

Nenhuma dependência de módulo além do `PrismaClient` local (mesmo padrão do `AuthModule`).

### Variáveis de Ambiente

Nenhuma variável nova — usa a mesma `DATABASE_URL` já configurada globalmente.

---

## Como Utilizar

### Registrar no AppModule

```typescript
import { UserConfigModule } from './modules/user-config/user-config.module';

@Module({
  imports: [UserConfigModule],
})
export class AppModule {}
```

### Consultar preferências

```http
GET /user/config
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Atualizar preferências

```http
PUT /user/config
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "language": "pt-BR",
  "region": "BR",
  "includeAdult": false,
  "favoriteGenres": [28, 12, 878],
  "theme": "dark",
  "itemsPerPage": 20,
  "defaultSortBy": "popularity.desc",
  "streamingProviders": [8, 337, 119],
  "notifications": {
    "newReleasesFromFavoriteGenres": true,
    "watchlistUpcomingReminders": true
  }
}
```

---

## Exemplos

### Consulta com sucesso (usuário sem preferências salvas)

**Response (200):**
```json
{
  "language": "en-US",
  "region": "US",
  "includeAdult": false,
  "favoriteGenres": [],
  "theme": "dark",
  "itemsPerPage": 20,
  "defaultSortBy": "popularity.desc",
  "streamingProviders": [],
  "notifications": {
    "newReleasesFromFavoriteGenres": true,
    "watchlistUpcomingReminders": true
  }
}
```

### DTO inválido

**Response (400):**
```json
{
  "statusCode": 400,
  "message": ["theme deve ser \"light\" ou \"dark\""],
  "error": "Bad Request"
}
```

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
| `400` | DTO inválido — campo ausente, `theme` fora de `light`/`dark`, `language`/`region` fora do formato ISO, `itemsPerPage` fora de 1–100 |
| `401` | Token JWT ausente ou inválido — tratado pelo `JwtAuthGuard` global |
| `404` | Usuário do token não existe mais na tabela `users` |

---

## Como Testar

```bash
# Unit tests
npm run test -- --testPathPattern=user-config

# Curl — consultar preferências (substituir <token> pelo JWT obtido em POST /auth)
curl -X GET "http://localhost:3000/user/config" \
  -H "Authorization: Bearer <token>"

# Curl — atualizar preferências
curl -X PUT "http://localhost:3000/user/config" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "pt-BR",
    "region": "BR",
    "includeAdult": false,
    "favoriteGenres": [28, 12, 878],
    "theme": "dark",
    "itemsPerPage": 20,
    "defaultSortBy": "popularity.desc",
    "streamingProviders": [8, 337, 119],
    "notifications": {
      "newReleasesFromFavoriteGenres": true,
      "watchlistUpcomingReminders": true
    }
  }'
```

---

## Observações

- `PUT /user/config` é substituição completa (não há `PATCH`) — todos os campos do DTO são obrigatórios.
- Atualização dos campos escalares e das tabelas de gêneros/provedores ocorre em uma única transação Prisma — evita estado inconsistente em caso de falha parcial.
- Usuário recém-criado já possui preferências padrão (colunas com `@default` no schema) — `GET /user/config` nunca retorna `404` para um token válido, exceto se o usuário tiver sido removido entre a emissão do token e a requisição.
- `JwtAuthGuard` é global — nenhuma rota deste módulo usa `@Public()`.
- Swagger disponível em `GET /docs` (ambiente de desenvolvimento).
