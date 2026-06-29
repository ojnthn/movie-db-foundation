# {NomeFilter}

## Objetivo

{Uma frase: intercepta {quais exceções} e as converte em respostas HTTP com {formato}.}

---

## Responsabilidades

- Capturar {exceções específicas ou todas as exceções}
- Converter exceção em resposta HTTP com formato padronizado
- {Logar erros inesperados via `Logger` do NestJS — se aplicável}

---

## Fluxo

```
Exceção lançada → {NomeFilter}.catch() → Resposta HTTP padronizada
                        ↓
              Mapeamento: tipo de exceção → código HTTP
```

---

## Exceções Tratadas

| Exceção | Código HTTP | Mensagem retornada |
|---|---|---|
| `{NomeException}` | `{código}` | {mensagem ou `exception.message`} |
| `HttpException` (NestJS) | código original | mensagem original |
| `Error` genérico | `500` | `'Internal server error'` |

---

## Formato da Resposta

```json
{
  "statusCode": {número},
  "message": "{string}"
}
```

---

## Dependências

| Dependência | Finalidade |
|---|---|
| `ArgumentsHost` | Acesso ao contexto HTTP para escrever resposta |
| `Logger` | Log de erros inesperados (500) |

---

## Estrutura interna

```typescript
// shared/filters/{nome}/{nome}.filter.ts

@Catch()
export class {NomeFilter} implements ExceptionFilter {
  private readonly logger = new Logger({NomeFilter}.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, message } = this.resolve(exception);
    response.status(status).json({ statusCode: status, message });
  }

  private resolve(exception: unknown): { status: number; message: string } {
    if (exception instanceof {NomeException}) return { status: {código}, message: exception.message };
    // ...
    this.logger.error(exception);
    return { status: 500, message: 'Internal server error' };
  }
}
```

---

## Como Utilizar

### Registro global (AppModule)

```typescript
{
  provide: APP_FILTER,
  useClass: {NomeFilter},
}
```

> Registrado globalmente via `APP_FILTER` — não aplicar via `@UseFilters()` em controllers individuais.

---

## Exemplos

### Exceção de domínio → HTTP 409

```typescript
// Use case lança:
throw new ConflictException('Email já cadastrado');

// Filter converte para:
// HTTP 409 { "statusCode": 409, "message": "Email já cadastrado" }
```

### Erro inesperado → HTTP 500

```typescript
// Qualquer Error não mapeado:
// HTTP 500 { "statusCode": 500, "message": "Internal server error" }
// + log via Logger.error()
```

---

## Observações

- Exceções de domínio esperadas (`DomainException` e subclasses) **não são logadas** — são erros de negócio
- Apenas erros inesperados (500) são logados via `Logger`
- Stack trace nunca é exposto na resposta HTTP
