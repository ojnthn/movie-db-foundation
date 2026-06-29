# Documentação

## Objetivo

Documentar o padrão de documentação do projeto — quais arquivos existem, onde ficam e o que cada um deve conter.

---

## Fontes de verdade (em ordem de prioridade)

1. `CONTEXT.md` (raiz do projeto)
2. `.ai/contexts/manifest.md`
3. Demais arquivos de `.ai/contexts/`
4. Código existente

---

## Arquivos de documentação por módulo

Cada módulo em `src/modules/{name}/` deve conter **dois arquivos**:

| Arquivo | Público-alvo | Conteúdo |
|---|---|---|
| `CONTEXT.md` | IA | Contexto técnico estruturado para geração de código |
| `README.md` | Desenvolvedor humano | Explicação do módulo, como usar, como testar |

### CONTEXT.md de módulo — seções obrigatórias

- Responsabilidade
- Casos de Uso (tabela: use case, descrição, rota)
- Entidades de Domínio (campos, invariantes)
- Value Objects (campo, validações)
- Interface do Repositório
- Contrato da API (request/response por endpoint)
- Erros Esperados (exceção, código HTTP, quando ocorre)
- Fluxo de execução (por use case)
- Variáveis de Ambiente
- Decisões Técnicas
- O que NÃO fazer neste módulo

---

## Arquivos de documentação em shared/

Componentes de `src/shared/` que possuem comportamento não óbvio devem ter `CONTEXT.md` próprio:

- `src/shared/interceptors/logging/CONTEXT.md` — documenta o `LoggingInterceptor`
- `src/shared/Claude.md` — documenta todos os componentes de `shared/` em um único arquivo

---

## .ai/contexts/

Cada arquivo documenta **exatamente um** assunto arquitetural. Sem duplicação de conteúdo entre arquivos.

### Estrutura recomendada de cada contexto

- Objetivo
- Responsabilidades
- Regras
- Convenções
- Boas práticas
- O que é proibido
- Exemplos encontrados no projeto
- Observações

### Regra de atualização

Quando uma decisão arquitetural mudar:

1. Atualizar primeiro o arquivo em `.ai/contexts/`
2. Depois atualizar o código
3. Nunca o inverso

---

## Swagger (OpenAPI)

- Configurado em `main.ts` via `DocumentBuilder`
- Disponível em `GET /docs` (desenvolvimento)
- Todo controller usa `@ApiTags`, `@ApiOperation`, `@ApiResponse`
- Bearer auth configurado globalmente via `.addBearerAuth()`

---

## CONTEXT.md da raiz

O `CONTEXT.md` na raiz do projeto é o primeiro documento a ser lido. Contém:

- Visão geral do projeto
- Stack técnica
- Arquitetura (resumo)
- Estrutura de pastas (resumo)
- Regras de desenvolvimento
- Roadmap de funcionalidades
- Convenções de nomenclatura
- Ordem de implementação por módulo
- Critérios de aceite

---

## Regras

- Nunca documentar suposições — apenas padrões confirmados no código
- Nunca propor melhorias ou modernizações na documentação
- Documentação em português (padrão do projeto)
- Preferir listas em vez de longos parágrafos
- Exemplos devem ser extraídos do código real do projeto
