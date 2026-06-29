# Banco de Dados

## Stack

| Tecnologia | Papel |
|---|---|
| MySQL 8.0 | Banco de dados principal |
| Prisma | ORM e gerenciador de migrations |
| phpMyAdmin | Admin web (porta 8080, dev only) |

## Configuração

Namespace: `database` (`src/config/database.config.ts`).

`DATABASE_URL` no formato:

```
# local
mysql://root:root@localhost:3306/moviedb

# Docker Compose (hostname interno)
mysql://root:root@db:3306/moviedb
```

## Schema Prisma

Localizado em `prisma/schema.prisma`.

### Convenções de modelo

- Nome do modelo em `PascalCase` singular: `model User`
- Tabela mapeada em `snake_case` plural via `@@map`: `@@map("users")`
- `createdAt`/`updatedAt` mapeados via `@map("created_at")` / `@map("updated_at")`
- IDs como UUID: `@id @default(uuid())`
- Campos únicos marcados com `@unique`
- Enums em `snake_case` lowercase: `active`, `inactive`, `deleted`

### Modelo atual: User

```prisma
model User {
  id        String     @id @default(uuid())
  name      String
  email     String     @unique
  password  String
  status    UserStatus @default(active)
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")

  @@map("users")
}

enum UserStatus {
  active
  inactive
  deleted
}
```

## Migrations

- Geradas via `prisma migrate dev` (desenvolvimento)
- Aplicadas via `prisma migrate deploy` (produção/Docker)
- A API aplica `prisma migrate deploy` automaticamente na inicialização via `docker-compose.yml`
- Migrations versionadas em `prisma/migrations/`

## PrismaClient

- Não é global — instanciado como provider dentro de cada módulo que usa banco:
  ```typescript
  { provide: PrismaClient, useValue: new PrismaClient() }
  ```
- Injetado via constructor: `constructor(private readonly prisma: PrismaClient)`

## Padrão de Repositório

- Repositórios em `infrastructure/repositories/`
- Implementam a interface do domínio
- Contêm mapper privado `toDomain(raw: PrismaModel): DomainEntity`
- Mapper reconstrói a entidade via factory method `Entity.create()`
- Se o mapper falhar (inconsistência no banco), lança `Error` com mensagem descritiva

### Exemplo de mapper

```typescript
private toDomain(raw: PrismaUser): User {
  const result = User.create({
    id: raw.id,
    name: raw.name,
    email: raw.email,
    password: raw.password,
    status: raw.status as 'active' | 'inactive' | 'deleted',
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  });
  if (!result.ok) {
    throw new Error(`Inconsistência no banco: ${result.error} (id=${raw.id})`);
  }
  return result.value;
}
```

## Regras

- Nenhum tipo Prisma gerado (`PrismaUser`, etc.) deve vazar para fora do repositório
- Use cases recebem apenas entidades de domínio — nunca tipos Prisma
- Toda query via `this.prisma.{model}.{method}()` — sem SQL raw
- Campos sensíveis (ex: password) armazenados exatamente como recebidos (hash MD5)

## O que é Proibido

- Importar tipos Prisma fora dos repositórios de infraestrutura
- Acessar `PrismaClient` diretamente em use cases ou controllers
- Instanciar `PrismaClient` globalmente — instanciar dentro do módulo
- SQL raw sem necessidade documentada
