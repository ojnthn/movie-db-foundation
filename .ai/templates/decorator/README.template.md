# @{NomeDecorator}

## Objetivo

{Uma frase: o que este decorator faz e qual metadado ou comportamento produz.}

---

## Responsabilidades

- {Produzir metadado via `SetMetadata` ou extrair dado do contexto de execução}
- {Simplificar acesso a {dado} para controllers e handlers}

---

## Fluxo

```
Handler decorado com @{NomeDecorator} → {NestJS processa metadado/dado} → {Guard/Pipe/Interceptor consome ou dado injetado no parâmetro}
```

---

## Dependências

| Dependência | Finalidade |
|---|---|
| `ExecutionContext` | Acesso ao contexto HTTP (se param decorator) |
| `Reflector` | Leitura de metadados (se usado por guard/interceptor) |

---

## Estrutura interna

```typescript
// shared/decorators/{nome}.decorator.ts

// Exemplo: param decorator
export const {NomeDecorator} = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.{propriedade};
  },
);

// OU: metadata decorator
export const {NOME_METADATA_KEY} = '{nome_chave}';
export const {NomeDecorator} = () => SetMetadata({NOME_METADATA_KEY}, true);
```

---

## Como Utilizar

### Locais permitidos

- `@{NomeDecorator}()` em parâmetros de métodos de controller (se param decorator)
- `@{NomeDecorator}()` em métodos ou classes de controller (se metadata decorator)

### Exemplo em controller

```typescript
@Get('perfil')
async perfil(@{NomeDecorator}() {dado}: {Tipo}): Promise<{RetornoDto}> {
  return this.{nomeUseCase}.execute({ {dado} });
}
```

---

## Metadados produzidos

| Chave | Valor | Consumido por |
|---|---|---|
| `{NOME_METADATA_KEY}` | `{valor}` | `{NomeGuard}` ou `{NomeInterceptor}` |

---

## Exemplos

### Extrair dado do contexto

```typescript
// Controller
async meuHandler(@{NomeDecorator}() {dado}: {Tipo}) { ... }
```

### Marcar rota com metadado

```typescript
// Controller
@{NomeDecorator}()
@Get('rota')
async minhaRota() { ... }

// Guard lendo o metadado
const valor = this.reflector.getAllAndOverride<boolean>(
  {NOME_METADATA_KEY},
  [context.getHandler(), context.getClass()],
);
```

---

## Observações

- Decorator fica em `shared/decorators/` — nunca dentro de um módulo específico
- Nunca conter lógica de negócio — apenas extração de metadado ou dado do contexto
