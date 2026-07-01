# CONTEXT — User Config

## Responsabilidade

Armazenar e expor as preferências de exibição e notificação do usuário autenticado (idioma, região, tema, paginação, gêneros favoritos, provedores de streaming e preferências de notificação).

> SRP: este módulo tem exatamente uma razão para mudar — as preferências do usuário.

---

## Escopo

### Dentro do escopo

- Consultar as preferências do usuário autenticado
- Atualizar (substituição completa) as preferências do usuário autenticado

### Fora do escopo

- Registro e autenticação de usuários (responsabilidade do módulo `auth`)
- Recomendação de filmes com base nas preferências (consumo futuro por outro módulo)
- Envio efetivo de notificações — este módulo apenas armazena a preferência (opt-in/opt-out)

---

## Casos de Uso

| Use Case | Arquivo | Rota |
|---|---|---|
| `GetUserConfigUseCase` | `application/use-cases/get-user-config.use-case.ts` | `GET /user/config` |
| `UpdateUserConfigUseCase` | `application/use-cases/update-user-config.use-case.ts` | `PUT /user/config` |

---

## Entidades de Domínio

### UserConfig

| Campo | Tipo | Invariante |
|---|---|---|
| `userId` | `string (UUID)` | Referencia o `User` do módulo `auth`; imutável |
| `language` | `string` | Formato ISO `xx-XX`, ex: `pt-BR` — validado no DTO |
| `region` | `string` | Código de país ISO de 2 letras, ex: `BR` — validado no DTO |
| `includeAdult` | `boolean` | — |
| `favoriteGenres` | `number[]` | IDs de gênero TMDB — persistidos em tabela própria |
| `theme` | `string` | `'light' \| 'dark'` — validado no DTO |
| `itemsPerPage` | `number` | Entre 1 e 100 — validado no DTO |
| `defaultSortBy` | `string` | Ex: `popularity.desc` |
| `streamingProviders` | `number[]` | IDs de provedor TMDB — persistidos em tabela própria |
| `notifications` | `UserConfigNotifications` | `{ newReleasesFromFavoriteGenres: boolean, watchlistUpcomingReminders: boolean }` |

> `UserConfig` é uma entidade anêmica (constructor público, sem `Result<T>`) — segue o mesmo padrão de `Movie` no módulo `movies`: os campos não carregam invariantes de negócio além de formato/tipo, já garantidos pelo DTO na camada de apresentação.

---

## Value Objects

Não se aplica — validações de formato (`language`, `region`, `theme`, `itemsPerPage`) ficam no DTO (`class-validator`), não há regra de negócio própria de domínio que justifique um value object.

---

## Interface do Repositório

```typescript
// domain/repositories/user-config.repository.interface.ts

export const USER_CONFIG_REPOSITORY = 'USER_CONFIG_REPOSITORY';

export interface IUserConfigRepository {
  findByUserId(userId: string): Promise<UserConfig | null>;
  update(userId: string, config: UserConfig): Promise<UserConfig>;
}
```

---

## Contrato da API

### GET /user/config

Requer autenticação JWT (`Authorization: Bearer <token>`).

**Response (`200`):**
```json
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

**Erros:**
- `401` — Token ausente ou inválido
- `404` — Usuário do token não existe mais

> Usuário recém-registrado que nunca chamou `PUT /user/config` recebe os valores padrão da coluna (`language: "en-US"`, `region: "US"`, `theme: "dark"`, `itemsPerPage: 20`, `defaultSortBy: "popularity.desc"`, `includeAdult: false`, notificações `true`, arrays vazios).

---

### PUT /user/config

Requer autenticação JWT (`Authorization: Bearer <token>`). Substitui **todas** as preferências do usuário — não é um merge parcial.

**Request body:**
```json
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

**Response (`200`):** mesmo formato do `GET /user/config`, refletindo os valores recém-persistidos.

**Erros:**
- `400` — DTO inválido (campo ausente, `theme` fora de `light`/`dark`, `language`/`region` fora do formato ISO, `itemsPerPage` fora de 1–100, array com valor não inteiro)
- `401` — Token ausente ou inválido
- `404` — Usuário do token não existe mais

---

## Erros Esperados

| Exceção | Código HTTP | Quando ocorre |
|---|---|---|
| `UnauthorizedException` (global) | `401` | Token JWT ausente ou inválido — tratado pelo `JwtAuthGuard` global |
| `NotFoundException` | `404` | `GetUserConfigUseCase` / `UpdateUserConfigUseCase` — usuário do token não encontrado na tabela `users` |
| `HttpException` | `400` | DTO inválido (class-validator) |

---

## Fluxo de Execução

### GetUserConfigUseCase

```
1. Controller extrai userId do JWT via @CurrentUser()
2. Chama GetUserConfigUseCase.execute({ userId })
3. UseCase chama IUserConfigRepository.findByUserId(userId)
4. PrismaUserConfigRepository lê a linha de `users` + `user_favorite_genres` + `user_streaming_providers` (Promise.all)
5. [Se usuário não encontrado] → throw NotFoundException
6. Mapeia UserConfig → GetUserConfigOutput
7. Controller retorna HTTP 200
```

### UpdateUserConfigUseCase

```
1. Controller recebe UpdateUserConfigDto → chama UpdateUserConfigUseCase.execute({ userId, ...dto })
2. UseCase confirma existência do usuário via IUserConfigRepository.findByUserId(userId)
3. [Se usuário não encontrado] → throw NotFoundException
4. Cria entidade UserConfig com os valores recebidos
5. UseCase chama IUserConfigRepository.update(userId, config)
6. PrismaUserConfigRepository, em uma transação:
   - atualiza os campos escalares diretamente na tabela `users`
   - remove todas as linhas existentes em `user_favorite_genres` e `user_streaming_providers` para o usuário
   - insere as novas linhas (createMany) para cada array recebido
7. Controller retorna HTTP 200 com as preferências atualizadas
```

---

## Limites

- Não acessa banco diretamente — apenas via interface `IUserConfigRepository` (DIP)
- Não conhece implementações concretas de infraestrutura (OCP)
- Domain não importa `@nestjs/*`, Prisma, `class-validator` ou qualquer lib externa
- Controllers não contêm lógica de negócio
- Não possui lógica de recomendação — apenas armazena a preferência

---

## Regras Obrigatórias

- Regra de dependência: `presentation → application → domain ← infrastructure`
- Um use case por operação — nunca múltiplas ações em um único use case (SRP)
- Use cases lançam `DomainException` ou subclasse em falhas — nunca retornam `null` silenciosamente
- Controllers delegam 100% ao use case — sem lógica de negócio (SRP)
- Mapper entre modelo Prisma e entidade de domínio isolado dentro do repositório
- `PUT /user/config` é substituição completa — todos os campos são obrigatórios no DTO
- Atualização dos arrays (`favoriteGenres`, `streamingProviders`) e dos campos escalares do usuário ocorre em uma única transação Prisma (`$transaction`)

---

## O que é Proibido

- Importar `@nestjs/*`, Prisma ou libs externas no domínio
- Acessar `PrismaClient` diretamente em use cases ou controllers
- Vazar tipos Prisma (`PrismaUser`, etc.) para fora do repositório
- Retornar `null` silenciosamente em use cases — lançar exceção
- Conter lógica de negócio em controllers
- Fazer merge parcial no `PUT` — sempre substituição completa dos campos enviados

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
| `presentation` | Repositórios diretamente; lógica de negócio |

---

## Variáveis de Ambiente

Não se aplica — este módulo não introduz novas variáveis de ambiente.

---

## Convenções

| Artefato | Arquivo | Classe |
|---|---|---|
| Entidade | `domain/entities/user-config.entity.ts` | `UserConfig` |
| Interface repositório | `domain/repositories/user-config.repository.interface.ts` | `IUserConfigRepository` |
| Token DI | mesmo arquivo da interface | `USER_CONFIG_REPOSITORY` |
| Use case consulta | `application/use-cases/get-user-config.use-case.ts` | `GetUserConfigUseCase` |
| Use case atualização | `application/use-cases/update-user-config.use-case.ts` | `UpdateUserConfigUseCase` |
| DTO atualização | `application/dtos/update-user-config.dto.ts` | `UpdateUserConfigDto` / `NotificationsDto` |
| Repositório Prisma | `infrastructure/repositories/prisma-user-config.repository.ts` | `PrismaUserConfigRepository` |
| Controller | `presentation/controllers/user-config.controller.ts` | `UserConfigController` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `modules/auth` (`User`, tabela `users`) | Campos escalares de preferência residem na mesma tabela `users`; `userId` é o `id` do `User` do módulo `auth` |
| `shared/exceptions/domain.exception` | Use cases lançam `NotFoundException` |
| `shared/decorators/current-user` | `userId` extraído do JWT via `@CurrentUser()` |
| `AppModule` | `JwtAuthGuard` global protege ambas as rotas — nenhuma usa `@Public()` |

---

## Decisões Técnicas

- **Campos escalares na tabela `users`:** por solicitação explícita da spec, as preferências escalares (`language`, `region`, `includeAdult`, `theme`, `itemsPerPage`, `defaultSortBy`, flags de notificação) foram adicionadas como colunas da tabela `users` existente, com valores padrão, em vez de uma tabela `user_configs` separada.
- **Tabelas dedicadas para arrays:** `favoriteGenres` e `streamingProviders` viram tabelas próprias (`user_favorite_genres`, `user_streaming_providers`) com `user_id` como FK e `@@unique([userId, genreId/providerId])`, por solicitação explícita da spec.
- **PUT como substituição completa:** a cada `PUT /user/config`, as linhas de gêneros/provedores são apagadas e recriadas dentro da mesma transação — evita divergência entre o conjunto enviado e o persistido.
- **Entidade anêmica:** `UserConfig` não usa `Result<T>` porque não há invariante de negócio além de formato, já validado no DTO — mesmo padrão adotado por `Movie` no módulo `movies`.

---

## Evolução Futura

- Migrar preferências escalares para uma tabela `user_configs` dedicada caso o modelo `User` fique sobrecarregado
- Endpoint de `PATCH /user/config` para atualização parcial
- Consumo das preferências (`favoriteGenres`, `streamingProviders`) pelo módulo `movies` para recomendações personalizadas

---

## O que NÃO Fazer Neste Módulo

- Não implemente merge parcial no `PUT` — sempre substituição completa
- Não acesse o banco diretamente no use case — use `IUserConfigRepository`
- Não coloque lógica de negócio no controller — toda decisão vai para o use case
- Não vaze tipos Prisma (`PrismaUser`, join rows) para fora do repositório
