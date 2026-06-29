# GlobalExceptionFilter

## Objetivo

Capturar todas as exceções não tratadas e convertê-las em respostas HTTP padronizadas com `{ statusCode, message }`.

---

## Responsabilidades

- Mapear subclasses de `DomainException` para o código HTTP correto
- Repassar `HttpException` do NestJS sem modificação
- Logar erros inesperados (500) via `Logger`
- Garantir que stack traces nunca sejam expostos na resposta

---

## Fluxo

```
Exceção lançada pelo use case
    → GlobalExceptionFilter.catch()
    → [HttpException]        → repassa status + body originais
    → [UnauthorizedException] → HTTP 401 { statusCode, message }
    → [ConflictException]    → HTTP 409 { statusCode, message }
    → [NotFoundException]    → HTTP 404 { statusCode, message }
    → [DomainException]      → HTTP 422 { statusCode, message }
    → [qualquer outro Error] → HTTP 500 + Logger.error()
```

---

## Mapeamento de Exceções

| Exceção | Código HTTP | Mensagem retornada |
|---|---|---|
| `HttpException` (NestJS) | código original | body original |
| `UnauthorizedException` | `401` | `exception.message` |
| `ConflictException` | `409` | `exception.message` |
| `NotFoundException` | `404` | `exception.message` |
| `DomainException` | `422` | `exception.message` |
| Qualquer outro `Error` | `500` | `'Erro interno do servidor'` |

---

## Formato da Resposta

```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas"
}
```

---

## Dependências

| Dependência | Finalidade |
|---|---|
| `ArgumentsHost` | Acesso ao contexto HTTP para escrever a resposta |
| `Logger` (NestJS) | Log de erros inesperados (500) |
| `DomainException` e subclasses | Reconhecimento e mapeamento para HTTP |

---

## Como Utilizar

### Registro global (AppModule)

```typescript
{ provide: APP_FILTER, useClass: GlobalExceptionFilter }
```

> Registrado globalmente via `APP_FILTER` — captura exceções de todos os controllers. Não usar `@UseFilters()` em controllers individuais.

---

## Exemplos

### Exceção de negócio → HTTP esperado

```typescript
// Use case lança:
throw new ConflictException('Email já cadastrado');

// Filter retorna:
// HTTP 409  { "statusCode": 409, "message": "Email já cadastrado" }
```

### Erro inesperado → HTTP 500

```typescript
// Qualquer Error não mapeado:
// HTTP 500  { "statusCode": 500, "message": "Erro interno do servidor" }
// + Logger.error(exception) → stack trace nos logs do servidor
```

---

## Observações

- Exceções de domínio (`DomainException` e subclasses) **não são logadas** — são erros esperados de negócio
- Apenas erros inesperados (não mapeados → 500) são logados com `Logger.error()`
- Stack trace nunca é exposto na resposta HTTP ao cliente
- Ao criar nova subclasse de `DomainException`, adicionar o mapeamento aqui antes de usar
