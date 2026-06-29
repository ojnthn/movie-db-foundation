# Banco de Dados

## Objetivo

Documentar as convenções do banco de dados, schema Prisma e padrões de acesso a dados.

---

## Stack

| Tecnologia | Versão | Papel |
|---|---|---|
| MySQL | 8.0 | Banco de dados principal |
| Prisma | — | ORM e gerenciador de migrations |
| phpMyAdmin | latest | Admin web (porta 8080, dev only) |

---

## Configuração

Namespace: `database` (`src/config/database.config.ts`).

Variável de ambiente: `DATABASE_URL` no formato:

```
mysql://root:root@localhost:3306/moviedb
```

Em Docker Compose, `DATABASE_URL` aponta para o hostname interno `db`:

```
mysql://root:root@db:3306/moviedb
```

---

## Schema Prisma

Localizado em `prisma/schema.prisma`.

### Convenções de modelo

- Nome do modelo em `PascalCase` singular: `model User`
- Tabela mapeada em `snake_case` plural via `@@map`: `@@map("users")`
- Campos `createdAt`/`updatedAt` mapeados via `@map("created_at")` / `@map("updated_at")`
- IDs gerados como UUID: `@id @default(uuid())`
- Campos únicos marcados com `@unique`
- Enums do Prisma em `snake_case` lowercase: `active`, `inactive`, `deleted`

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

---

## Migrations

- Geradas via `prisma migrate dev` (desenvolvimento)
- Aplicadas via `prisma migrate deploy` (produção/Docker)
- A API aplica `prisma migrate deploy` automaticamente na inicialização (via `docker-compose.yml` entrypoint)
- Migrations são versionadas em `prisma/migrations/`

---

## PrismaClient

- Não é global — instanciado como provider dentro de cada módulo que precisa de acesso ao banco
- Registro no módulo:
  ```typescript
  {
    provide: PrismaClient,
    useValue: new PrismaClient(),
  }
  ```
- Injetado via constructor no repositório: `constructor(private readonly prisma: PrismaClient)`

---

## Padrão de repositório

- Repositórios ficam em `infrastructure/repositories/`
- Implementam a interface do domínio
- Contêm mapper privado `toDomain(raw: PrismaModel): DomainEntity`
- O mapper reconstrói a entidade via o factory method estático `Entity.create()`
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

---

## Regras

- Nenhum modelo Prisma (tipo gerado) deve vazar para fora do repositório
- Use cases recebem apenas entidades de domínio — nunca tipos Prisma
- Toda query é feita via `this.prisma.{model}.{method}()` — sem SQL raw
- Campos sensíveis (ex: password) armazenados exatamente como recebidos (hash MD5)

---

## O que é proibido

- Importar tipos Prisma (`PrismaUser`, etc.) fora dos repositórios de infraestrutura
- Acessar `PrismaClient` diretamente em use cases ou controllers
- Criar PrismaClient globalmente (instanciar dentro do módulo)
- SQL raw sem necessidade documentada
