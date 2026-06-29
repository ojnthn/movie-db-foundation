# CONTEXT — Auth

## Responsabilidade

Registrar novos usuários e autenticar usuários existentes, emitindo tokens JWT em ambos os casos.

> SRP: este módulo tem exatamente uma razão para mudar.

---

## Escopo

### Dentro do escopo

- Criar novos usuários e emitir JWT após registro
- Autenticar usuários existentes por email + password (MD5) e emitir JWT

### Fora do escopo

- Gerenciar permissões ou autorização de rotas (responsabilidade do `JwtAuthGuard` global no `AppModule`)
- Gerenciar sessões ou refresh tokens
- Listar, atualizar ou deletar usuários

---

## Casos de Uso

| Use Case | Arquivo | Rota |
|---|---|---|
| `RegisterUseCase` | `application/use-cases/register.use-case.ts` | `POST /auth/register` |
| `AuthUseCase` | `application/use-cases/auth.use-case.ts` | `POST /auth` |

---

## Entidades de Domínio

### User

| Campo | Tipo | Invariante |
|---|---|---|
| `id` | `string (UUID)` | Gerado automaticamente; imutável após criação |
| `name` | `string` | Não pode ser vazio |
| `email` | `Email` | Value object; único por usuário |
| `password` | `Password` | Value object; hash MD5 (32 hex chars); nunca em texto puro |
| `status` | `UserStatus` | `'active' \| 'inactive' \| 'deleted'`; usuários `deleted` não autenticam |
| `createdAt` | `Date` | Definido na criação; imutável |
| `updatedAt` | `Date` | Atualizado automaticamente pelo Prisma |

> Entidades usam constructor privado + factory method estático `create()` que retorna `Result<T>`.

---

## Value Objects

| Value Object | Campo validado | Validações |
|---|---|---|
| `Email` | `email` | Formato `user@domain.com` |
| `Password` | `password` | String MD5 válida — exatamente 32 caracteres hexadecimais |

---

## Interface do Repositório

```typescript
// domain/repositories/user.repository.interface.ts

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
}
```

---

## Contrato da API

### POST /auth/register

**Request body:**
```json
{
  "name": "João Silva",
  "email": "usuario@exemplo.com",
  "password": "5f4dcc3b5aa765d61d8327deb882cf99"
}
```

**Response (`201`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros:**
- `400` — DTO inválido (nome vazio, email mal formatado, password não é MD5)
- `409` — Email já cadastrado

---

### POST /auth

**Request body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "5f4dcc3b5aa765d61d8327deb882cf99"
}
```

> `password` deve ser enviado já como hash MD5 pelo cliente.

**Response (`200`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros:**
- `400` — DTO inválido (email mal formatado, password não é MD5)
- `401` — Credenciais inválidas

---

## Payload do JWT

```json
{
  "sub": "uuid-do-usuario",
  "email": "usuario@exemplo.com"
}
```

---

## Erros Esperados

| Exceção | Código HTTP | Quando ocorre |
|---|---|---|
| `UnauthorizedException` | `401` | Email não encontrado, senha incorreta ou usuário inativo |
| `ConflictException` | `409` | Email já cadastrado no registro |
| `HttpException` | `400` | DTO inválido (class-validator) |

> Nunca diferenciar na resposta se o erro foi no email ou na senha — sempre retornar a mesma mensagem genérica (`"Credenciais inválidas"`) para evitar enumeração de usuários.

---

## Fluxo de Execução

### RegisterUseCase

```
1. Controller recebe RegisterDto → chama RegisterUseCase.execute(input)
2. UseCase chama IUserRepository.findByEmail()
3. [Se email existe] → throw ConflictException
4. Cria entidade User via User.create() — falhas de domínio lançam DomainException
5. UseCase chama IUserRepository.create(user)
6. Assina JWT com sub e email no payload
7. Controller retorna { token } com HTTP 201
```

### AuthUseCase

```
1. Controller recebe AuthDto → chama AuthUseCase.execute(input)
2. UseCase chama IUserRepository.findByEmail()
3. [Se não encontrado ou status != 'active'] → throw UnauthorizedException
4. Compara password recebido com password armazenado (ambos MD5)
5. [Se inválido] → throw UnauthorizedException
6. Assina JWT com sub e email no payload
7. Controller retorna { token } com HTTP 200
```

---

## Limites

- Não acessa banco diretamente — apenas via interface `IUserRepository` (DIP)
- Não conhece implementações concretas de infraestrutura (OCP)
- Domain não importa `@nestjs/*`, Prisma, `class-validator` ou qualquer lib externa
- Controllers não contêm lógica de negócio

---

## Regras Obrigatórias

- Regra de dependência: `presentation → application → domain ← infrastructure`
- Um use case por operação — nunca múltiplas ações em um único use case (SRP)
- Use cases lançam `DomainException` ou subclasse em falhas — nunca retornam `null` silenciosamente
- Controllers delegam 100% ao use case — sem lógica de negócio (SRP)
- Mapper entre modelo Prisma e entidade de domínio isolado dentro do repositório (ISP)
- Nunca diferenciar a resposta de erro entre "email não encontrado" e "senha incorreta" — sempre `UnauthorizedException` genérica

---

## O que é Proibido

- Importar `@nestjs/*`, Prisma ou libs externas no domínio
- Acessar `PrismaClient` diretamente em use cases ou controllers
- Vazar tipos Prisma (`PrismaUser`, etc.) para fora do repositório
- Retornar `null` silenciosamente em use cases — lançar exceção
- Conter lógica de negócio em controllers
- Aplicar hash adicional sobre a senha — ela chega já como MD5 do cliente
- Retornar dados do usuário além do token no response

---

## Dependências Permitidas

| Camada | Pode depender de |
|---|---|
| `domain` | Apenas `shared/types` (`Result<T>`) — nenhuma lib externa |
| `application` | `domain/`, `shared/exceptions`, `shared/types` |
| `infrastructure` | `domain/`, `@nestjs/*`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `@prisma/client` |
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

| Variável | Namespace de config | Obrigatória |
|---|---|---|
| `JWT_SECRET` | `jwt.secret` | Sim |
| `JWT_EXPIRATION` | `jwt.expiration` | Sim |

---

## Convenções

| Artefato | Arquivo | Classe |
|---|---|---|
| Entidade | `domain/entities/user.entity.ts` | `User` |
| Interface repositório | `domain/repositories/user.repository.interface.ts` | `IUserRepository` |
| Token DI | mesmo arquivo da interface | `USER_REPOSITORY` |
| Use case registro | `application/use-cases/register.use-case.ts` | `RegisterUseCase` |
| Use case autenticação | `application/use-cases/auth.use-case.ts` | `AuthUseCase` |
| DTO registro | `application/dtos/register.dto.ts` | `RegisterDto` |
| DTO autenticação | `application/dtos/auth.dto.ts` | `AuthDto` |
| Repositório Prisma | `infrastructure/repositories/prisma-user.repository.ts` | `PrismaUserRepository` |
| Guard JWT | `infrastructure/guards/jwt-auth.guard.ts` | `JwtAuthGuard` |
| Strategy JWT | `infrastructure/strategies/jwt.strategy.ts` | `JwtStrategy` |
| Controller | `presentation/controllers/auth.controller.ts` | `AuthController` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `shared/exceptions/domain.exception` | Use cases lançam subclasses de `DomainException` |
| `shared/types/result` | Domain usa `Result<T>` em entidades e value objects |
| `shared/decorators/public` | Rotas `POST /auth` e `POST /auth/register` usam `@Public()` |
| `AppModule` | Registra `JwtAuthGuard` globalmente — toda rota sem `@Public()` é protegida |

---

## Decisões Técnicas

- **Hash MD5 pelo cliente:** A senha chega já como MD5 — o servidor não aplica nenhum hash adicional. Requisito do sistema; deve ser mantido mesmo que MD5 não seja recomendado para senhas em novos sistemas.
- **Mensagem de erro genérica:** Email e senha inválidos retornam o mesmo `401` para evitar enumeração de usuários.
- **JWT no registro:** `RegisterUseCase` emite token diretamente após criar o usuário, evitando uma segunda requisição de login.

---

## Evolução Futura

- Suporte a refresh tokens (novo use case + nova rota)
- Logout / invalidação de token (requer blacklist ou token versioning)
- Suporte a OAuth2 (nova strategy + novo use case)

---

## O que NÃO Fazer Neste Módulo

- Não aplique hash adicional sobre a senha recebida — ela já chega como MD5
- Não retorne dados do usuário além do token no response
- Não diferencie o erro de "email não encontrado" do de "senha incorreta" na resposta HTTP
- Não acesse o banco diretamente no use case — use `IUserRepository`
- Não coloque lógica de negócio no controller — toda decisão vai para o use case
