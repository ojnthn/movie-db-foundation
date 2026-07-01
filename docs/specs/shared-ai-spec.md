# Spec: Shared AI Module

## Módulo
shared/ai (novo)

## Objetivo
Fornecer um serviço genérico para enviar prompts ao Claude com acesso à internet (web_search), retornando respostas estruturadas em texto — sem qualquer lógica de negócio específica de filmes aqui.

## Estrutura de arquivos
```
src/shared/ai/
├── ai.module.ts
├── ai.service.ts              # implementação concreta (Anthropic SDK)
├── ai.interface.ts            # abstract class = contrato/token DI
└── ai.constants.ts            # (se necessário)
```

## Interface (contrato)

```typescript
// ai.interface.ts
export interface AiCompletionOptions {
  systemPrompt?: string;
  maxTokens?: number;
  enableWebSearch?: boolean;
}

export abstract class AiService {
  abstract complete(prompt: string, options?: AiCompletionOptions): Promise<string>;
}
```

Siga o mesmo padrão já usado em `MoviesRepository` e `CacheService`: abstract class (não interface) para servir como token de DI direto no `provide`.

## Implementação

- Use o SDK oficial `@anthropic-ai/sdk` (adicionar em `package.json` — ainda não instalado)
- Modelo padrão: `claude-sonnet-4-6`, configurável via variável de ambiente
- Chamada via `client.messages.create(...)` — não usar o namespace `client.beta.messages`, não é necessário para este caso
- Quando `enableWebSearch: true`, inclua a tool `{ type: "web_search_20260209", name: "web_search" }` na chamada (versão com dynamic filtering, suportada por `claude-sonnet-4-6`; não usar `web_search_20250305`, que é a variante básica para modelos mais antigos)
- O método `complete` deve extrair e concatenar apenas os blocos de `type: "text"` da resposta (ignorar blocos de `server_tool_use`/`web_search_tool_result`, que são internos ao processo de busca)
- Retorna a resposta como `string` bruta — quem chama (o use case) é responsável por fazer `JSON.parse` e tratar erro de parsing, não este serviço
- Não configurar `thinking` — chamada de completion simples, sem necessidade de raciocínio estendido

## Tratamento de Erro (fail-open)

- Se a API da Anthropic falhar (timeout, rate limit, erro 5xx), capture o erro, logue um warning, e lance uma exceção customizada `AiServiceUnavailableException`
- **Não** faça retry automático aqui — decisão de fallback/retry é responsabilidade de quem consome o serviço (o use case decide se cai para uma recomendação simples ou propaga o erro)

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|---|---|---|
| `ANTHROPIC_API_KEY` | Chave da API Anthropic | Sim |
| `ANTHROPIC_MODEL` | Modelo a usar (padrão: `claude-sonnet-4-6`) | Não |
| `ANTHROPIC_MAX_TOKENS` | Limite padrão de tokens (padrão: 1500) | Não |

## Module

- `AiModule` deve ser `@Global()`, seguindo o mesmo padrão do `CacheModule`
- Exporta `AiService` (a abstract class) como provider

## Regras

- `shared/ai` não pode importar nada de módulos de domínio (movies, users, etc) — é infraestrutura pura
- Nenhum módulo consumidor deve importar `@anthropic-ai/sdk` diretamente — sempre via `AiService`
- Sem prompt de negócio fixo aqui (ex: "sugira filmes de terror") — isso é responsabilidade do use case que consome este serviço
- Sem parsing de JSON aqui — apenas retorna texto bruto

## Fora do Escopo (não implementar agora)

- Lógica de recomendação de filmes (isso é o use case `get-personalized-recommendations`, spec separada)
- Cruzamento com TMDB
- Cache das respostas da IA (pode vir depois, reaproveitando `shared/cache`)
