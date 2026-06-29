# {NomeTipo}

## Objetivo

{Uma frase: define o contrato tipado para {finalidade — ex: representar resultado de operação, payload JWT}.}

---

## Responsabilidades

- Fornecer tipagem precisa para {contexto de uso}
- Evitar uso de `any` para {dado específico}

---

## Definição

```typescript
// shared/types/{nome}.ts

export type {NomeTipo}<T{, E = string}> =
  | { {campo1}: true; {campo2}: T }
  | { {campo1}: false; {campo3}: {E} };

// Funções auxiliares (se aplicável)
export const {funcao1} = <T>(value: T): {NomeTipo}<T> => ({ {campo}: true, value });
export const {funcao2} = <T>(error: string): {NomeTipo}<T> => ({ {campo}: false, error });
```

---

## Quando Utilizar

| Situação | Usar |
|---|---|
| {Contexto onde este tipo é adequado} | Sim |
| {Contexto onde não é adequado} | Não — usar `{alternativa}` |

---

## Dependências

Nenhuma — tipos são definições puras TypeScript, sem dependências externas.

---

## Como Utilizar

### Importar e usar

```typescript
import type { {NomeTipo} } from '../../../../shared/types/{nome}';

// Exemplo: retornar resultado de operação
static create(props: Props): {NomeTipo}<{NomeTipo}> {
  if ({condição de falha}) return {funcao2}('{mensagem}');
  return {funcao1}(new {NomeClasse}(props));
}
```

### Verificar resultado

```typescript
const result = {NomeClasse}.create(props);
if (!result.ok) return fail(result.error);
const instancia = result.value;
```

---

## Exemplos

### `Result<T>` — operação que pode falhar

```typescript
// Sucesso
const ok = <T>(value: T): Result<T> => ({ ok: true, value });

// Falha
const fail = <T>(error: string): Result<T> => ({ ok: false, error });

// Uso em value object
const emailResult = Email.create(raw);
if (!emailResult.ok) return fail(emailResult.error);
```

---

## Observações

- Tipos ficam em `shared/types/` — acessíveis a todos os módulos
- Usar `import type` quando o símbolo não tem uso em runtime
- Tipos não possuem lógica — apenas definições de forma
