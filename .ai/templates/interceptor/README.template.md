# {NomeInterceptor}

## Objetivo

{Uma frase: intercepta requisições/respostas para {finalidade — ex: logar, transformar, medir tempo}.}

---

## Responsabilidades

- {Ação executada antes do handler — ex: capturar método e URL}
- {Ação executada após o handler — ex: medir tempo, logar resultado}

---

## Fluxo

```
Request → {NomeInterceptor}.intercept() → [pré-processamento] → Handler
                                        ← [pós-processamento] ← Observable<Response>
```

---

## Dependências

| Dependência | Finalidade |
|---|---|
| `Logger` | Log de informações de execução |
| `Observable` (rxjs) | Observação do fluxo da resposta via `tap` |

---

## Estrutura interna

```typescript
// shared/interceptors/{nome}/{nome}.interceptor.ts

@Injectable()
export class {NomeInterceptor} implements NestInterceptor {
  private readonly logger = new Logger({NomeInterceptor}.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`${method} ${url} — ${Date.now() - start}ms`);
      }),
    );
  }
}
```

---

## Como Utilizar

### Registro global (AppModule)

```typescript
{
  provide: APP_INTERCEPTOR,
  useClass: {NomeInterceptor},
}
```

---

## Efeitos

| Momento | Efeito |
|---|---|
| Antes do handler | {O que é feito/capturado} |
| Após o handler | {O que é feito/logado/transformado} |

---

## Exemplos

### Log de execução

```
GET /health — 3ms
POST /auth — 45ms
```

---

## Observações

- Não altera o corpo da requisição nem da resposta — apenas observa via `tap`
- Nunca loga headers de autenticação, tokens JWT ou dados sensíveis do body
- Não lança exceções — tratamento de erros é responsabilidade do `GlobalExceptionFilter`
