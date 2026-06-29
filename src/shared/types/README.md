# Result<T>

## Objetivo

Representar o resultado de uma operação que pode falhar, de forma tipada e sem lançar exceções — padrão usado no domínio (entidades e value objects).

---

## Responsabilidades

- Encapsular sucesso (`ok: true, value: T`) ou falha (`ok: false, error: string`) em um tipo discriminado
- Eliminar uso de `throw` no domínio, mantendo-o livre de dependências externas
- Fornecer funções auxiliares `ok()` e `fail()` para construção tipada

---

## Definição

```typescript
export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const fail = <T>(error: string): Result<T> => ({ ok: false, error });
```

---

## Dependências

Nenhuma — TypeScript puro, sem dependências externas.

---

## Como Utilizar

### Em factory methods de entidades e value objects

```typescript
// Value object retornando Result<T>
static create(raw: string): Result<Email> {
  if (!raw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
    return fail('Email inválido');
  }
  return ok(new Email(raw.toLowerCase().trim()));
}
```

### Verificando e propagando o resultado

```typescript
// Em User.create(), propagando falha do value object
const emailResult = Email.create(props.email);
if (!emailResult.ok) return fail(emailResult.error);

// Acessando o valor com sucesso
const email = emailResult.value;
```

### No use case, consumindo resultado da entidade

```typescript
const userResult = User.create({ id, name, email, password });
if (!userResult.ok) {
  throw new DomainException(userResult.error); // use case lança exceção
}
const user = userResult.value;
```

---

## Exemplos

### Sucesso

```typescript
const result = Email.create('usuario@exemplo.com');
// result.ok === true
// result.value → instância de Email
```

### Falha

```typescript
const result = Email.create('email-inválido');
// result.ok === false
// result.error === 'Email inválido'
```

---

## Quando NÃO usar

- **Use cases não retornam `Result<T>`** — lançam `DomainException` diretamente em caso de falha
- **Controllers não usam `Result<T>`** — recebem o output tipado do use case

---

## Observações

- Importar com `import type { Result }` quando usado apenas em posição de tipo
- Importar `ok` e `fail` com `import { ok, fail }` — são funções de runtime
