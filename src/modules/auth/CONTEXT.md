# Módulo: Auth

## Responsabilidade

Responsável por registrar novos usuários e autenticar usuários existentes, emitindo tokens JWT em ambos os casos. Não gerencia permissões nem autorização de rotas (isso é feito via `JwtAuthGuard` global no `AppModule`).

---

## Casos de Uso

| Use Case | Descrição | Rota |
|---|---|---|
| `RegisterUseCase` | Cria um novo usuário e retorna um JWT assinado | `POST /auth/register` |
| `AuthUseCase` | Autentica o usuário e retorna um JWT assinado | `POST /auth` |

---

## Entidades de Domínio

### `User`

```typescript
id: string        // UUID gerado na criação
name: string      // Nome do usuário
email: Email      // Value object — único por usuário
password: Password // Value object — hash MD5
status: UserStatus // 'active' | 'inactive' | 'deleted'
createdAt?: Date
updatedAt?: Date
```

**Invariantes:**
- O `email` deve ser único na base de dados
- A `password` nunca é armazenada em texto puro — apenas o hash MD5
- Usuários com `status='deleted'` não podem ser autenticados

---

## Value Objects

| Value Object | Validações |
|---|---|
| `Email` | Deve ser um e-mail válido (formato `user@domain.com`) |
| `Password` | Deve ser uma string MD5 válida (32 caracteres hexadecimais) |

---

## Interface do Repositório

```typescript
interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
}
```

---

## Contrato da API

### POST /auth/register — Registrar novo usuário

**Request:**
```json
{
  "name": "João Silva",
  "email": "usuario@exemplo.com",
  "password": "5f4dcc3b5aa765d61d8327deb882cf99"
}
```

**Response — sucesso `201`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros:**
- `400` — DTO inválido (nome vazio, email mal formatado, password não é MD5)
- `409` — Email já cadastrado

---

### POST /auth — Autenticar usuário

**Request:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "5f4dcc3b5aa765d61d8327deb882cf99"
}
```

> `password` deve ser enviado já como hash MD5 pelo cliente.

**Response — sucesso `200`:**
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
| `UnauthorizedException` | 401 | Email não encontrado, senha incorreta ou usuário inativo |
| `ConflictException` | 409 | Email já cadastrado no registro |
| `HttpException` (400) | 400 | DTO inválido (class-validator) |

> Nunca diferenciar na resposta se o erro foi no email ou na senha — sempre retornar a mesma mensagem genérica (`"Credenciais inválidas"`) para evitar enumeração de usuários.

---

## Dependências

### Internas
- `shared/exceptions` — `UnauthorizedException`, `ConflictException`, `DomainException`
- `shared/decorators` — `@Public()` nas rotas públicas

### Externas
- `@nestjs/jwt` — assinatura e geração do token
- `@nestjs/passport` + `passport-jwt` — validação do token nas rotas protegidas

---

## Fluxo: Registro

1. Controller recebe a request e valida o DTO (`name`, `email`, `password`)
2. `RegisterUseCase` verifica se o email já existe via `IUserRepository.findByEmail`
3. Se existir, lança `ConflictException`
4. Cria a entidade `User` via `User.create()` — falhas de domínio lançam `DomainException`
5. Persiste o usuário via `IUserRepository.create`
6. Assina um JWT com `sub` e `email` no payload
7. Controller retorna o token com status 201

## Fluxo: Autenticação

1. Controller recebe a request e valida o DTO (`email`, `password`)
2. `AuthUseCase` busca o usuário pelo email via `IUserRepository.findByEmail`
3. Se não encontrado ou inativo, lança `UnauthorizedException`
4. Compara o `password` recebido com o `password` armazenado (ambos MD5)
5. Se inválido, lança `UnauthorizedException`
6. Assina um JWT com `sub` e `email` no payload
7. Controller retorna o token com status 200

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `JWT_SECRET` | Sim | Chave usada para assinar o token |
| `JWT_EXPIRATION` | Sim | Tempo de expiração do token (ex: `30m`) |

---

## Decisões Técnicas

- **Hash MD5 pelo cliente:** A senha chega já como MD5 — o servidor não aplica nenhum hash adicional. Requisito do sistema; deve ser mantido mesmo que MD5 não seja recomendado para senhas em novos sistemas.
- **Mensagem de erro genérica:** Email e senha inválidos retornam o mesmo erro `401` para evitar enumeração de usuários.
- **JWT no registro:** O `RegisterUseCase` emite token diretamente após criar o usuário, evitando uma segunda requisição de login.

---

## O que NÃO fazer neste módulo

- Não aplique hash adicional sobre a senha recebida — ela já chega como MD5
- Não retorne dados do usuário além do token no response
- Não diferencie o erro de "email não encontrado" do de "senha incorreta" na resposta HTTP
- Não acesse o banco diretamente no use case — use `IUserRepository`
