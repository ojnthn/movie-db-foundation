# Auth

## Objetivo

Registrar novos usuários e autenticar usuários existentes, emitindo tokens JWT em ambos os casos.

---

## Responsabilidades

- Registrar novos usuários com validação de email e senha MD5
- Autenticar usuários existentes e emitir JWT
- Garantir que somente usuários ativos possam se autenticar

> Este módulo não gerencia permissões de rotas. Autorização é feita via `JwtAuthGuard` global no `AppModule`.

---

## Casos de Uso

| Use Case | Descrição | Rota HTTP |
|---|---|---|
| `RegisterUseCase` | Cria novo usuário e retorna JWT | `POST /auth/register` |
| `AuthUseCase` | Autentica usuário e retorna JWT | `POST /auth` |

---

## Fluxo

### Registro

```
POST /auth/register
    → AuthController.register()
    → RegisterUseCase.execute()
    → IUserRepository.findByEmail()   [verifica duplicidade]
    → User.create()                   [cria entidade com value objects]
    → IUserRepository.create()        [persiste]
    → JwtService.sign()               [gera token]
    → { token }  HTTP 201
```

### Autenticação

```
POST /auth
    → AuthController.login()
    → AuthUseCase.execute()
    → IUserRepository.findByEmail()   [busca usuário]
    → user.isActive()                 [verifica status]
    → Password.create() + matches()   [compara senha MD5]
    → JwtService.sign()               [gera token]
    → { token }  HTTP 200
```

---

## Estrutura Interna

```
modules/auth/
├── CONTEXT.md
├── README.md
├── domain/
│   ├── entities/
│   │   └── user.entity.ts           # User com invariantes encapsuladas
│   ├── repositories/
│   │   └── user.repository.interface.ts  # IUserRepository + USER_REPOSITORY token
│   └── value-objects/
│       ├── email.vo.ts              # Email — valida formato user@domain.com
│       └── password.vo.ts          # Password — valida MD5 (32 hex chars)
├── application/
│   ├── use-cases/
│   │   ├── auth.use-case.ts         # AuthUseCase + AuthInput/AuthOutput
│   │   ├── auth.use-case.spec.ts
│   │   ├── register.use-case.ts     # RegisterUseCase + RegisterInput/RegisterOutput
│   │   └── register.use-case.spec.ts
│   └── dtos/
│       ├── auth.dto.ts              # AuthDto — email + password MD5
│       └── register.dto.ts         # RegisterDto — name + email + password MD5
├── infrastructure/
│   ├── repositories/
│   │   └── prisma-user.repository.ts  # PrismaUserRepository implements IUserRepository
│   ├── guards/
│   │   └── jwt-auth.guard.ts       # JwtAuthGuard — verifica @Public() + valida JWT
│   └── strategies/
│       └── jwt.strategy.ts         # JwtStrategy — extrai e valida Bearer token
├── presentation/
│   └── controllers/
│       └── auth.controller.ts      # AuthController — POST /auth e POST /auth/register
└── auth.module.ts
```

---

## Dependências

### Módulos NestJS

| Módulo | Finalidade |
|---|---|
| `JwtModule` | Assinatura e verificação de tokens JWT |
| `PassportModule` | Integração com estratégias Passport |
| `ConfigModule` | Acesso a `JWT_SECRET` e `JWT_EXPIRATION` |

### Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `JWT_SECRET` | Sim | Chave para assinar o JWT |
| `JWT_EXPIRATION` | Sim | Expiração do token (ex: `30m`) |

---

## Como Utilizar

### Registrar no AppModule

```typescript
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [AuthModule],
})
export class AppModule {}
```

### Autenticar

```http
POST /auth
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "5f4dcc3b5aa765d61d8327deb882cf99"
}
```

> A senha deve ser enviada pelo cliente já como hash MD5 (32 caracteres hexadecimais).

### Registrar

```http
POST /auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "usuario@exemplo.com",
  "password": "5f4dcc3b5aa765d61d8327deb882cf99"
}
```

### Usar o token em rotas protegidas

```http
GET /qualquer-rota
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Exemplos

### Registro com sucesso

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Email já cadastrado

**Response (409):**
```json
{
  "statusCode": 409,
  "message": "Email já cadastrado"
}
```

### Credenciais inválidas

**Response (401):**
```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas"
}
```

### DTO inválido

**Response (400):**
```json
{
  "statusCode": 400,
  "message": ["Email inválido", "A senha deve ser um hash MD5 válido (32 caracteres hexadecimais)"],
  "error": "Bad Request"
}
```

---

## Erros Comuns

| Código | Causa |
|---|---|
| `400` | Campo obrigatório ausente, email mal formatado, ou senha não é MD5 |
| `401` | Email não encontrado, senha incorreta, ou usuário inativo |
| `409` | Email já cadastrado (no registro) |

---

## Como Testar

```bash
# Unit tests
npm run test -- --testPathPattern=auth

# E2E tests
npm run test:e2e -- --testPathPattern=auth

# Curl — registro
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@ex.com","password":"5f4dcc3b5aa765d61d8327deb882cf99"}'

# Curl — login
curl -X POST http://localhost:3000/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@ex.com","password":"5f4dcc3b5aa765d61d8327deb882cf99"}'
```

---

## Observações

- A senha chega como hash MD5 — o servidor não aplica hash adicional. Nunca alterar esse comportamento sem solicitação explícita.
- Erros de "email não encontrado" e "senha incorreta" retornam o mesmo `401` para prevenir enumeração de usuários.
- O `RegisterUseCase` emite JWT diretamente após o registro, evitando uma segunda requisição de login.
- Swagger disponível em `GET /docs` (ambiente de desenvolvimento).
