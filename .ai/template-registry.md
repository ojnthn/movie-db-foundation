# Template Registry — Movie DB Foundation

## Objetivo

Índice oficial de todos os templates de documentação do projeto. Consultar este arquivo para identificar qual template utilizar antes de criar qualquer componente.

---

## Regra de uso

```
Antes de criar um componente de módulo:
1. Identificar o tipo na tabela abaixo
2. Localizar o template em .ai/templates/{tipo}/
3. Gerar README.md a partir de README.template.md
4. Gerar CONTEXT.md a partir de CONTEXT.template.md
```

**Proibido criar `README.md` ou `CONTEXT.md` sem utilizar o template oficial.**

---

## Registro de Templates

| Tipo de Componente | Localização no Projeto | Template |
|---|---|---|
| **Module** | `src/modules/{nome}/{nome}.module.ts` | [`.ai/templates/module/`](templates/module/) |
| **Controller** | `src/modules/{nome}/presentation/controllers/` | [`.ai/templates/controller/`](templates/controller/) |
| **Use Case** | `src/modules/{nome}/application/use-cases/` | [`.ai/templates/use-case/`](templates/use-case/) |
| **DTO** | `src/modules/{nome}/application/dtos/` | [`.ai/templates/dto/`](templates/dto/) |
| **Entity** | `src/modules/{nome}/domain/entities/` | [`.ai/templates/entity/`](templates/entity/) |
| **Value Object** | `src/modules/{nome}/domain/value-objects/` | [`.ai/templates/value-object/`](templates/value-object/) |
| **Repository** | `src/modules/{nome}/domain/repositories/` + `src/modules/{nome}/infrastructure/repositories/` | [`.ai/templates/repository/`](templates/repository/) |
| **Service** | `src/modules/{nome}/infrastructure/services/` | [`.ai/templates/service/`](templates/service/) |
| **Guard** | `src/modules/{nome}/infrastructure/guards/` | [`.ai/templates/guard/`](templates/guard/) |
| **Strategy** | `src/modules/{nome}/infrastructure/strategies/` | [`.ai/templates/strategy/`](templates/strategy/) |
| **Provider** | Declarado em `{nome}.module.ts` | [`.ai/templates/provider/`](templates/provider/) |
| **Pipe** | `src/modules/{nome}/application/pipes/` | [`.ai/templates/pipe/`](templates/pipe/) |

---

## Estrutura de cada template

```
.ai/templates/{tipo}/
├── README.template.md    → documentação para desenvolvedores humanos
└── CONTEXT.template.md   → documentação para a IA
```

### README.template.md — seções obrigatórias

- Nome
- Objetivo
- Responsabilidades
- Fluxo
- Dependências
- Estrutura interna
- Como utilizar
- Exemplos
- Observações

### CONTEXT.template.md — seções obrigatórias

- Responsabilidade
- Escopo (dentro / fora)
- Limites
- Regras obrigatórias
- O que é proibido
- Dependências permitidas
- Dependências proibidas
- Convenções
- Relação com outros componentes
- Evolução futura

---

## Onde cada tipo de componente fica

### Dentro de módulos (`src/modules/{nome}/`)

```
domain/
  entities/          → Entity
  repositories/      → Repository (interface + token)
  value-objects/     → Value Object

application/
  use-cases/         → Use Case
  dtos/              → DTO

infrastructure/
  repositories/      → Repository (implementação Prisma)
  guards/            → Guard
  strategies/        → Strategy
  services/          → Service (integrações externas)

presentation/
  controllers/       → Controller
```

### Compartilhados (`src/shared/`)

Componentes de `src/shared/` (decorators, exceptions, filters, interceptors, types) **não têm templates e não recebem CONTEXT.md/README.md**. O código é auto-explicativo.

### Configuração de módulo

```
{nome}.module.ts     → Module + Providers (registros de DI)
```

---

## Regras de evolução dos templates

1. Alterar o template antes de alterar componentes existentes
2. Após alterar um template, revisar todos os componentes do mesmo tipo
3. Nunca criar um padrão diferente em um componente sem atualizar o template
4. Qualquer novo tipo de componente exige a criação de um novo template antes da implementação

---

## Templates ativos

| Template | Versão | Última atualização |
|---|---|---|
| module | 1.0 | {data} |
| controller | 1.0 | {data} |
| use-case | 1.0 | {data} |
| dto | 1.0 | {data} |
| entity | 1.0 | {data} |
| value-object | 1.0 | {data} |
| repository | 1.0 | {data} |
| service | 1.0 | {data} |
| guard | 1.0 | {data} |
| strategy | 1.0 | {data} |
| provider | 1.0 | {data} |
| pipe | 1.0 | {data} |
