# CONTEXT — {NomeTipo}

## Responsabilidade

`{NomeTipo}` define o contrato tipado para {finalidade} e elimina o uso de `any` em {contexto específico}.

---

## Escopo

### Dentro do escopo

- Definir a estrutura de {dado/contrato}
- Fornecer funções auxiliares de construção se necessário

### Fora do escopo

- Lógica de negócio — tipos são apenas definições de forma
- Validação de valores — responsabilidade de value objects e pipes
- Persistência — responsabilidade de repositórios

---

## Limites

- Sem dependências externas — TypeScript puro
- Sem efeitos colaterais
- Sem classes — apenas `type`, `interface` ou funções auxiliares puras

---

## Regras Obrigatórias

- Localizado em `shared/types/{nome}.ts` — acessível a todas as camadas
- Preferir `type` para union types; `interface` para contratos extensíveis
- Funções auxiliares são puras — sem efeitos colaterais
- Usar `import type` nos arquivos que importam este tipo apenas em posição de tipo

---

## O que é Proibido

- Conter lógica de negócio dentro do tipo ou funções auxiliares
- Importar de `@nestjs/*`, Prisma ou qualquer lib de terceiros
- Usar classes — manter como definições de forma pura (OCP, ISP)

---

## Dependências Permitidas

Nenhuma — tipos são definições TypeScript puras.

---

## Dependências Proibidas

- Qualquer lib de terceiros
- `@nestjs/*`
- `@prisma/client`

---

## Convenções

| Artefato | Localização | Exportação |
|---|---|---|
| Tipo | `shared/types/{nome}.ts` | `export type {NomeTipo}` |
| Funções auxiliares | mesmo arquivo | `export const {funcao}` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| Entidades de domínio | Usam `Result<T>` como retorno do factory method `create()` |
| Value objects | Usam `Result<T>` como retorno do método `create()` |
| Use cases | Consomem `Result<T>` retornado por entidades; não usam `Result<T>` diretamente como retorno |
| `{OutroComponente}` | {Relação} |

---

## Evolução Futura

- Se o tipo precisar de um segundo parâmetro genérico (ex: tipo de erro), adicionar ao union type
- {Extensão prevista}
