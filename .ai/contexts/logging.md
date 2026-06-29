# Logging

## Objetivo

Documentar o mecanismo de log do projeto e como deve ser usado.

---

## Mecanismo

O projeto usa o `Logger` nativo do NestJS (`@nestjs/common`). Não há biblioteca externa de logging.

---

## LoggingInterceptor

Localizado em `src/shared/interceptors/logging/logging.interceptor.ts`.

Registrado globalmente via `APP_INTERCEPTOR` em `AppModule`:

```typescript
{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }
```

### Comportamento

- Captura `method` e `url` do request antes de delegar ao handler
- Mede o tempo de execução via `Date.now()` (início vs. fim do pipe)
- Loga no formato `METHOD /path — Xms` usando `Logger`
- Não lança exceções — apenas observa via `tap` (rxjs)
- Não altera o corpo da resposta
- Não loga headers nem body (para não expor dados sensíveis)

### Formato de log

```
GET /health — 3ms
POST /auth — 45ms
POST /auth/register — 120ms
```

---

## Logger em outros contextos

Cada classe que faz log instancia seu próprio `Logger` com o nome da classe:

```typescript
private readonly logger = new Logger(GlobalExceptionFilter.name);
```

Usado em `GlobalExceptionFilter` para logar erros inesperados (500).

---

## Regras

- Usar sempre `Logger` do NestJS — nunca `console.log` em código de produção
- Nunca logar dados sensíveis (body de request, tokens, senhas)
- Erros de domínio esperados (`DomainException` e subclasses) **não são logados** — são erros de negócio, não de sistema
- Erros inesperados (não mapeados no `GlobalExceptionFilter`) **são logados** com nível `error`

---

## O que é proibido

- `console.log` em código de produção
- Logar headers de autenticação, tokens JWT ou hashes de senha
- Logar o corpo completo de requests (pode conter dados pessoais)
