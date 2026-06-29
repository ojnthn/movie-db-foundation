# Exceções

## Objetivo

Documentar a hierarquia de exceções de domínio e como são tratadas pelo filtro global.

---

## Hierarquia

Todas as exceções de domínio estendem `DomainException`, localizada em `src/shared/exceptions/domain.exception.ts`:

```
Error
└── DomainException
    ├── UnauthorizedException
    ├── ConflictException
    └── NotFoundException
```

---

## Mapeamento para HTTP

O `GlobalExceptionFilter` mapeia cada classe para o status HTTP correto:

| Classe | Status HTTP | Quando usar |
|---|---|---|
| `DomainException` | 422 Unprocessable Entity | Violação genérica de regra de negócio |
| `UnauthorizedException` | 401 Unauthorized | Credenciais inválidas ou usuário inativo |
| `ConflictException` | 409 Conflict | Recurso já existe (ex: email duplicado) |
| `NotFoundException` | 404 Not Found | Recurso não encontrado |
| `HttpException` (NestJS) | original status | Repassado sem alteração |
| Qualquer outra exceção | 500 Internal Server Error | Erro inesperado (logado via `Logger`) |

---

## Formato de resposta de erro

```json
{
  "statusCode": 401,
  "message": "Credenciais inválidas"
}
```

---

## Regras de uso

- Use cases lançam subclasses específicas — nunca `DomainException` diretamente se houver subclasse adequada
- Entidades e value objects **não lançam exceções** — retornam `Result<T>` com `fail()`
- Use cases **lançam exceções** — nunca retornam `null` silenciosamente
- `GlobalExceptionFilter` é o único lugar onde exceções são convertidas em respostas HTTP

---

## GlobalExceptionFilter

- Registrado globalmente via `APP_FILTER` em `AppModule`
- Captura **todas** as exceções não tratadas (anotado com `@Catch()` sem parâmetro)
- Loga apenas exceções inesperadas (500) via `Logger`
- Exceções de domínio não são logadas — são erros esperados

---

## Adicionando novas exceções

1. Criar subclasse de `DomainException` em `shared/exceptions/domain.exception.ts`
2. Mapear para o status HTTP correto em `GlobalExceptionFilter` (`shared/filters/global-exception.filter.ts`)
3. Nunca criar exceções fora de `shared/exceptions/` — exceções são compartilhadas entre módulos

---

## Exemplos encontrados no projeto

```typescript
// Use case lança exceção específica
throw new UnauthorizedException();          // 401
throw new ConflictException('Email já cadastrado'); // 409
throw new DomainException(userResult.error); // 422

// Entidade retorna Result — nunca lança
const emailResult = Email.create(props.email);
if (!emailResult.ok) return fail(emailResult.error);
```

---

## O que é proibido

- Lançar exceções dentro de entidades ou value objects
- Usar `throw new Error()` diretamente — sempre usar subclasse de `DomainException`
- Criar exceções de domínio fora de `shared/exceptions/`
- Expor stack traces na resposta HTTP
- Lançar `DomainException` genérico quando houver subclasse mais adequada
