# Exceções de Domínio

## Objetivo

Definir a hierarquia de exceções de domínio do projeto, permitindo que use cases sinalizem falhas de negócio de forma tipada e previsível.

---

## Responsabilidades

- Representar falhas de regras de negócio como tipos explícitos
- Permitir que o `GlobalExceptionFilter` mapeie cada tipo para o código HTTP correto
- Garantir mensagens de erro consistentes e seguras

---

## Hierarquia

```
Error
└── DomainException               → HTTP 422 Unprocessable Entity
    ├── UnauthorizedException     → HTTP 401 Unauthorized
    ├── ConflictException         → HTTP 409 Conflict
    └── NotFoundException         → HTTP 404 Not Found
```

---

## Quando Usar Cada Exceção

| Exceção | Código HTTP | Usar quando |
|---|---|---|
| `UnauthorizedException` | `401` | Credenciais inválidas, usuário inativo, ou token ausente |
| `ConflictException` | `409` | Recurso já existe (ex: email duplicado) |
| `NotFoundException` | `404` | Recurso não encontrado pelo ID ou critério |
| `DomainException` | `422` | Violação genérica de regra de negócio sem subclasse adequada |

---

## Dependências

Nenhuma — TypeScript + `Error` nativo.

---

## Como Utilizar

### Importar e lançar no use case

```typescript
import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  DomainException,
} from '../../../../shared/exceptions/domain.exception';

// Credenciais inválidas
throw new UnauthorizedException();
// → HTTP 401 { "statusCode": 401, "message": "Credenciais inválidas" }

// Email duplicado
throw new ConflictException('Email já cadastrado');
// → HTTP 409 { "statusCode": 409, "message": "Email já cadastrado" }

// Usuário não encontrado
throw new NotFoundException('Usuário não encontrado');
// → HTTP 404 { "statusCode": 404, "message": "Usuário não encontrado" }

// Violação genérica de domínio
throw new DomainException(userResult.error);
// → HTTP 422 { "statusCode": 422, "message": "..." }
```

### Adicionar nova exceção

```typescript
// 1. Criar nova subclasse em domain.exception.ts
export class ForbiddenException extends DomainException {
  constructor(message = 'Acesso negado') {
    super(message);
    this.name = 'ForbiddenException';
  }
}

// 2. Adicionar mapeamento no GlobalExceptionFilter
if (exception instanceof ForbiddenException) {
  response.status(HttpStatus.FORBIDDEN).json({
    statusCode: HttpStatus.FORBIDDEN,
    message: exception.message,
  });
  return;
}
```

---

## Formato da Resposta

```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas"
}
```

---

## Observações

- Exceções de domínio são lançadas **apenas em use cases** — entidades e value objects retornam `Result<T>`
- Exceções de domínio **não são logadas** pelo `GlobalExceptionFilter` — são erros esperados de negócio
- Nunca lançar `Error` genérico ou `HttpException` em código de domínio
- Nunca diferenciar na mensagem se o erro foi de email ou senha — usar mensagem genérica para evitar enumeração de usuários
