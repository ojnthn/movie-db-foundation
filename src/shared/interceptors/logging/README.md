# LoggingInterceptor

## Objetivo

Registrar método HTTP, URL e tempo de resposta de cada requisição recebida pela API.

---

## Responsabilidades

- Capturar `method` e `url` antes de delegar ao handler
- Medir o tempo de execução (início vs. fim do pipe)
- Logar no formato `METHOD /path — Xms` via `Logger` do NestJS

---

## Fluxo

```
Request → LoggingInterceptor.intercept() → captura method + url + start
                                        → next.handle()
                                        → tap(() => Logger.log(`METHOD /url — Xms`))
                                        → Response (não alterada)
```

---

## Dependências

| Dependência | Finalidade |
|---|---|
| `Logger` (NestJS) | Log estruturado com contexto da classe |
| `tap` (rxjs) | Observação do fluxo sem alterar a resposta |

---

## Estrutura interna

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const { method, url } = context.switchToHttp().getRequest<Request>();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => this.logger.log(`${method} ${url} — ${Date.now() - start}ms`)),
    );
  }
}
```

---

## Como Utilizar

### Registro global (AppModule)

```typescript
{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }
```

> Registrado globalmente — observa todas as requisições automaticamente. Não aplicar via `@UseInterceptors()` em controllers individuais.

---

## Exemplos

### Logs gerados

```
GET /health — 3ms
POST /auth — 45ms
POST /auth/register — 120ms
```

---

## Observações

- Não altera o corpo da requisição nem da resposta
- Não lança exceções — apenas observa via `tap`
- Não loga headers, body ou tokens JWT — apenas method, URL e tempo
- Erros de negócio são capturados pelo `GlobalExceptionFilter`, não pelo interceptor
