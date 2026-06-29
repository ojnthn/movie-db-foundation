# CONTEXT — Result<T>

## Responsabilidade

`Result<T>` é o tipo discriminado usado pelo domínio para representar operações que podem falhar, sem lançar exceções. Mantém o domínio livre de dependências externas.

---

## Escopo

### Dentro do escopo

- Representar sucesso (`ok: true, value`) ou falha (`ok: false, error`) de operações do domínio
- Fornecer funções auxiliares `ok()` e `fail()` para construção tipada

### Fora do escopo

- Use cases não usam `Result<T>` como retorno — lançam `DomainException`
- Controllers não usam `Result<T>` — recebem output tipado dos use cases
- Nenhuma lógica de negócio dentro de `Result<T>`

---

## Limites

- Sem dependências externas — TypeScript puro
- Sem efeitos colaterais
- Funções `ok()` e `fail()` são puras

---

## Regras Obrigatórias

- Entidades e value objects usam `Result<T>` no factory method `create()` — nunca `throw`
- Use cases consomem `Result<T>` e lançam `DomainException` se `!result.ok`
- Tipo genérico `E` padrão é `string` — manter assim, não complexificar sem necessidade

---

## O que é Proibido

- Usar `Result<T>` em use cases como tipo de retorno
- Usar `Result<T>` em controllers ou camadas de apresentação
- Importar `@nestjs/*`, Prisma ou qualquer lib de terceiros neste arquivo

---

## Dependências Permitidas

Nenhuma.

---

## Convenções

| Artefato | Localização | Exportação |
|---|---|---|
| Tipo `Result<T>` | `shared/types/result.ts` | `export type Result<T, E = string>` |
| Função `ok()` | mesmo arquivo | `export const ok` |
| Função `fail()` | mesmo arquivo | `export const fail` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| Entidades de domínio | Retornam `Result<Entity>` em `create()` |
| Value objects | Retornam `Result<VO>` em `create()` |
| Use cases | Consomem `Result<T>` e convertem falha em `DomainException` |
| `PrismaUserRepository.toDomain()` | Consome `Result<User>` e lança `Error` (não DomainException) se falhar |

---

## Evolução Futura

- Se necessário tipagem do erro (além de `string`), usar segundo parâmetro genérico `E`
- Não adicionar métodos ou lógica dentro de `Result<T>` — manter como union type simples
