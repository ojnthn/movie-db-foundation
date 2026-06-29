# Estilo de Código

## Objetivo

Documentar as convenções de estilo TypeScript e boas práticas aplicadas no projeto.

---

## TypeScript

- `strict: true` habilitado no `tsconfig.json`
- Propriedades de classe inicializadas na declaração ou no constructor — nunca usar `!` desnecessariamente (exceto em DTOs com class-validator onde é esperado)
- Nenhum `any` explícito — usar tipos precisos ou genéricos
- Preferir `type` para union types simples; `interface` para contratos extensíveis
- Importar tipos com `import type` quando o símbolo só é usado em posição de tipo

---

## Classes e construtores

- Entidades de domínio usam **constructor privado** + factory method estático `create()` que retorna `Result<T>`
- Value objects seguem o mesmo padrão: constructor privado + `create()` estático
- Expor dados via propriedades `readonly` — nunca setters públicos em entidades

Exemplo (padrão do projeto):

```typescript
export class Email {
  private constructor(private readonly value: string) {}

  static create(raw: string): Result<Email> {
    if (!raw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      return fail('Email inválido');
    }
    return ok(new Email(raw.toLowerCase().trim()));
  }

  toString(): string {
    return this.value;
  }
}
```

---

## Result<T>

Padrão para operações que podem falhar no domínio (sem `throw`):

```typescript
type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const fail = <T>(error: string): Result<T> => ({ ok: false, error });
```

- Usado em entidades e value objects
- Use cases **não** usam `Result<T>` — lançam `DomainException` diretamente

---

## Use cases

- Método único `execute(input: XInput): Promise<XOutput>`
- Recebem dependências via constructor com `@Inject(TOKEN)`
- Nunca retornam `null` silenciosamente — lançam exceção ou retornam valor válido

---

## Decorators e anotações

- Todo controller usa `@ApiTags`, `@ApiOperation`, `@ApiResponse` para documentação Swagger
- Rotas públicas usam `@Public()` (do `shared/decorators`)
- Rotas protegidas não precisam de anotação — `JwtAuthGuard` é global
- Usuário autenticado extraído via `@CurrentUser()` (retorna `JwtPayload: { sub, email }`)

---

## Async/await

- Todo acesso a banco via Prisma é `async/await`
- Use cases são sempre `async` (mesmo que internamente síncronos, por uniformidade com repositórios)

---

## Imports

- Imports relativos (`../../../../shared/...`) — sem path aliases configurados
- Imports de tipos: usar `import type` quando o símbolo não tem uso em runtime

---

## Boas práticas

- Preferir composição à herança
- Nunca criar classes utilitárias gigantes
- Nunca usar métodos estáticos quando injeção de dependência for possível
- Sem `console.log` em código de produção — usar `Logger` do NestJS
- Sem código comentado no PR final

---

## O que é proibido

- `any` explícito no código novo
- Setters públicos em entidades de domínio
- Lógica de negócio em controllers
- Acesso direto ao banco em use cases
- Libs de terceiros no domínio
