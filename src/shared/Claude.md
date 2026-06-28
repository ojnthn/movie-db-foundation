# Shared — Padrões Compartilhados

Infraestrutura transversal usada por todos os módulos. Nada aqui conhece domínio específico.

---

## types/result.ts — Result<T>

Padrão para operações que podem falhar sem lançar exceção (usado no domínio).

```typescript
type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const fail = <T>(error: string): Result<T> => ({ ok: false, error });
```

**Quando usar:** Em entidades e value objects do domínio, onde lançar exceção quebraria a regra de não depender de libs externas. Use cases lançam `DomainException` diretamente.

---

## exceptions/domain.exception.ts

Hierarquia de exceções de domínio. O `GlobalExceptionFilter` mapeia cada classe para o status HTTP correto.

| Classe | Status HTTP | Uso |
|---|---|---|
| `DomainException` | 422 | Base — violação genérica de regra de negócio |
| `UnauthorizedException` | 401 | Credenciais inválidas ou ausentes |
| `ConflictException` | 409 | Recurso já existe (ex: email duplicado) |
| `NotFoundException` | 404 | Recurso não encontrado |

**Regra:** Use cases lançam subclasses específicas. Nunca lance `DomainException` diretamente se houver uma subclasse mais adequada.

---

## filters/global-exception.filter.ts

Captura todas as exceções não tratadas e retorna respostas HTTP padronizadas.

- `HttpException` (NestJS) → repassa status e body originais
- Subclasses de `DomainException` → mapeia para status HTTP apropriado
- Qualquer outra exceção → `500 Internal Server Error` + log de erro

---

## interceptors/logging.interceptor.ts

Registra método, URL e tempo de resposta de cada requisição via `Logger` do NestJS. Registrado globalmente em `AppModule`.

---

## decorators/public.decorator.ts — @Public()

Marca uma rota como pública, bypassando o `JwtAuthGuard` global.

```typescript
@Public()
@Post('auth')
login(@Body() dto: AuthDto) { ... }
```

---

## decorators/current-user.decorator.ts — @CurrentUser()

Extrai o payload do JWT da requisição atual.

```typescript
@Get('me')
getMe(@CurrentUser() user: JwtPayload) { ... }
```

`JwtPayload` = `{ sub: string; email: string }` — o que a `JwtStrategy` coloca em `request.user`.

---

## Regras para adicionar código a shared/

- Só adicione aqui o que for genuinamente reutilizável por dois ou mais módulos
- Nada em `shared/` deve importar de `src/modules/`
- Exceções novas devem ser adicionadas em `domain.exception.ts` e mapeadas no `GlobalExceptionFilter`
