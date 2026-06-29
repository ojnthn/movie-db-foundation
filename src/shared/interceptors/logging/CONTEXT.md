# LoggingInterceptor — Contexto

## Responsabilidade

Registra método HTTP, URL e tempo de resposta de cada requisição recebida pela API. Registrado globalmente via `APP_INTERCEPTOR` no `AppModule`.

## Comportamento

- Captura `method` e `url` do request antes de delegar ao handler
- Mede o tempo de execução via `Date.now()` (início vs. fim do pipe)
- Loga no formato `METHOD /path — Xms` usando o `Logger` do NestJS

## Onde é registrado

`src/app.module.ts` — providers globais:

```typescript
{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }
```

## Regras

- Não lança exceções — só observa o fluxo via `tap`
- Não altera o corpo da resposta
- Não loga headers nem body para não expor dados sensíveis
