# CONTEXT — @CurrentUser

## Responsabilidade

`@CurrentUser` extrai `request.user` (preenchido pelo `JwtStrategy`) e o injeta como `JwtPayload` no parâmetro do método do controller. É o único canal autorizado de acesso ao payload JWT nos controllers.

---

## Escopo

### Dentro do escopo

- Extrair `request.user` do contexto HTTP e retornar como `JwtPayload`
- Definir e exportar a interface `JwtPayload` usada em toda a aplicação

### Fora do escopo

- Validação do token — responsabilidade do `JwtAuthGuard` e `JwtStrategy`
- Autorização de acesso — responsabilidade dos guards
- Lógica de negócio de qualquer tipo

---

## Limites

- Sem efeitos colaterais — apenas leitura de `request.user`
- Não lança exceções — se `request.user` for `undefined` (rota pública), retorna `undefined`
- Não acessa banco de dados ou serviços externos

---

## Regras Obrigatórias

- Controllers nunca acessam `request.user` diretamente — sempre via `@CurrentUser()` (ISP)
- Usado apenas em rotas protegidas (sem `@Public()`)
- `JwtPayload` é a única interface que define o contrato do payload JWT — não criar duplicatas em módulos

---

## O que é Proibido

- Acessar `request.user` diretamente em controllers
- Criar interface `JwtPayload` em outros arquivos — usar a exportada daqui
- Usar `@CurrentUser()` em rotas públicas sem verificar `undefined`
- Lógica de negócio dentro do decorator

---

## Dependências Permitidas

| Dependência | Justificativa |
|---|---|
| `createParamDecorator` (NestJS) | Criação de param decorators |
| `ExecutionContext` (NestJS) | Acesso ao contexto HTTP |

---

## Dependências Proibidas

- Repositórios, use cases, services
- `@prisma/client`

---

## Convenções

| Artefato | Localização | Exportação |
|---|---|---|
| Decorator | `shared/decorators/current-user.decorator.ts` | `export const CurrentUser` (camelCase) |
| Interface payload | mesmo arquivo | `export interface JwtPayload` |

> **Inconsistência:** arquivo em `shared/decorators/` — documentação prevê subpasta `current-user.decorator/`.

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `JwtStrategy.validate()` | Preenche `request.user` com `JwtPayload` que este decorator extrai |
| `JwtAuthGuard` | Garante que o token é válido antes que `@CurrentUser()` seja chamado |
| Controllers | Usam `@CurrentUser()` para obter o usuário autenticado |

---

## Evolução Futura

- Se `JwtPayload` precisar de novos campos (ex: `role`), adicionar aqui e em `JwtStrategy.validate()`
- Não criar cópias de `JwtPayload` em módulos específicos
