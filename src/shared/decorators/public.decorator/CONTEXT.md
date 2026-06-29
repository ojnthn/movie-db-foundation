# CONTEXT — @Public

## Responsabilidade

`@Public` adiciona o metadado `isPublic: true` ao handler ou classe, sinalizando ao `JwtAuthGuard` que a rota não requer autenticação JWT.

---

## Escopo

### Dentro do escopo

- Adicionar metadado `IS_PUBLIC_KEY = 'isPublic'` com valor `true` via `SetMetadata`
- Exportar `IS_PUBLIC_KEY` para ser lido pelo `JwtAuthGuard`

### Fora do escopo

- Decisão de liberar o acesso — responsabilidade do `JwtAuthGuard`
- Validação de token — responsabilidade do `JwtAuthGuard` e `JwtStrategy`
- Lógica de negócio de qualquer tipo

---

## Limites

- Sem efeitos colaterais além de adicionar metadado
- Não acessa banco de dados ou serviços externos
- Não lança exceções

---

## Regras Obrigatórias

- Usar apenas em rotas que não requerem autenticação (ex: login, registro, health check)
- `IS_PUBLIC_KEY` exportado neste arquivo — não redefinir em outros lugares (ISP)
- O `JwtAuthGuard` usa `Reflector.getAllAndOverride()` com `[handler, class]` — funciona em ambos os níveis

---

## O que é Proibido

- Usar `@Public()` em rotas que retornam dados sensíveis de usuário autenticado
- Redefinir `IS_PUBLIC_KEY` em outros módulos
- Lógica de negócio dentro do decorator

---

## Dependências Permitidas

| Dependência | Justificativa |
|---|---|
| `SetMetadata` (NestJS) | Adição de metadado ao handler/classe |

---

## Dependências Proibidas

- Repositórios, use cases, services
- `@prisma/client`
- Lógica de módulo específico

---

## Convenções

| Artefato | Localização | Exportação |
|---|---|---|
| Decorator | `shared/decorators/public.decorator.ts` | `export const Public` (camelCase) |
| Chave de metadado | mesmo arquivo | `export const IS_PUBLIC_KEY = 'isPublic'` |

> **Inconsistência:** arquivo em `shared/decorators/` — documentação prevê subpasta `public.decorator/`.

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `JwtAuthGuard` | Lê `IS_PUBLIC_KEY` via `Reflector` para decidir se valida o token |
| Controllers | Usam `@Public()` para declarar rotas sem autenticação |
| `AppModule` | `JwtAuthGuard` é registrado globalmente — `@Public()` é a única exceção |

---

## Evolução Futura

- Se necessário metadado adicional (ex: rate limiting, scope público), usar decorators separados — não sobrecarregar `@Public()`
