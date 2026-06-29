# Manifesto da IA — Movie DB Foundation

## Objetivo

Este arquivo define as regras de governança da IA neste repositório. Toda IA que trabalhar neste projeto deve ler este arquivo **antes de qualquer ação**.

---

## Ordem obrigatória de leitura

Antes de qualquer tarefa, leia nesta ordem:

1. `CONTEXT.md` — raiz do projeto (visão geral, stack, regras gerais)
2. `.ai/manifest.md` — este arquivo (governança da IA)
3. `.ai/template-registry.md` — índice oficial de templates
4. Contextos relevantes em `.ai/contexts/`
5. Código existente — apenas para confirmar implementação atual

---

## Fontes de verdade (por prioridade)

```
1. CONTEXT.md (raiz)
2. .ai/manifest.md (este arquivo)
3. .ai/contexts/*.md
4. .ai/template-registry.md
5. Código existente (src/)
```

**Em caso de conflito: a documentação prevalece. O código está errado, não a documentação.**

---

## Regras gerais para implementação

### Sempre fazer

- Ler os contextos relevantes antes de gerar qualquer código
- Manter consistência com o código existente
- Reutilizar padrões documentados
- Respeitar as responsabilidades de cada camada
- Seguir a ordem de implementação documentada em `.ai/contexts/modules.md`

### Nunca fazer

- Criar novos padrões sem atualizar a documentação
- Alterar arquitetura sem solicitação explícita
- Ignorar convenções documentadas
- Modificar código por preferência estética
- Usar abordagens diferentes das documentadas
- Criar abstrações para uso hipotético futuro

---

## Templates Oficiais

### Declaração

Os templates localizados em `.ai/templates/` são o **padrão oficial de documentação** do projeto. Todo componente novo deve ter sua documentação (`README.md` e `CONTEXT.md`) derivada do template oficial correspondente.

### Regras obrigatórias

1. **Proibido criar `README.md` ou `CONTEXT.md` manualmente** — toda documentação deve partir de um template oficial
2. **A estrutura dos templates não pode ser modificada durante a geração** — apenas os campos específicos do componente são preenchidos
3. **Seções obrigatórias do template nunca podem ser removidas** — se uma seção não se aplica, preencher com "N/A" e uma justificativa
4. **Alterações no padrão documental ocorrem primeiro no template, depois nos componentes** — nunca o inverso
5. **Os templates fazem parte da arquitetura oficial do projeto** — alterá-los sem solicitação explícita é proibido

### Fluxo obrigatório ao criar um componente

```
1. Identificar o tipo do componente
2. Consultar .ai/template-registry.md
3. Localizar o template correspondente em .ai/templates/{tipo}/
4. Gerar README.md a partir de README.template.md
5. Gerar CONTEXT.md a partir de CONTEXT.template.md
6. Preencher apenas as informações específicas do componente
7. Manter integralmente a estrutura do template
```

### Fluxo ao atualizar um template

```
1. Atualizar o template em .ai/templates/{tipo}/
2. Identificar todos os componentes do tipo impactado
3. Revisar e atualizar a documentação dos componentes
4. Nunca modificar a documentação de um componente para criar um novo padrão
```

---

## Política de conflitos

Se encontrar código que não segue a documentação:

- Não adapte a documentação ao código
- Não altere automaticamente os documentos
- Informe a inconsistência ao usuário
- Implemente seguindo a documentação

---

## Atualização da arquitetura

Quando uma decisão arquitetural mudar deliberadamente:

1. Atualize primeiro o arquivo correspondente em `.ai/contexts/`
2. Atualize o template correspondente em `.ai/templates/` (se aplicável)
3. Depois atualize o código
4. Nunca faça o caminho inverso

**A documentação sempre antecede a implementação.**

---

## Índice de contextos

| Arquivo | Assunto |
|---|---|
| `.ai/contexts/architecture.md` | Clean Architecture, camadas, regra de dependência, SOLID |
| `.ai/contexts/folder-structure.md` | Estrutura de diretórios do projeto |
| `.ai/contexts/modules.md` | Estrutura interna de um módulo, ordem de implementação |
| `.ai/contexts/conventions.md` | Nomenclatura de arquivos, classes, interfaces, tokens |
| `.ai/contexts/coding-style.md` | Estilo de código TypeScript, boas práticas |
| `.ai/contexts/validation.md` | DTOs, class-validator, ValidationPipe |
| `.ai/contexts/security.md` | JWT, guards, estratégias, decorators de autenticação |
| `.ai/contexts/exceptions.md` | Hierarquia de exceções, GlobalExceptionFilter |
| `.ai/contexts/logging.md` | LoggingInterceptor, padrão de log |
| `.ai/contexts/database.md` | Prisma, schema, convenções de modelo |
| `.ai/contexts/documentation.md` | Padrão de CONTEXT.md e README.md por módulo |
