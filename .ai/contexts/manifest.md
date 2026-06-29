# Manifesto da IA — Movie DB Foundation

## Objetivo desta pasta

`.ai/contexts` é a **única fonte autorizada** de padrões arquiteturais do projeto. Cada arquivo documenta um único assunto. Nenhuma implementação deve ocorrer sem leitura prévia dos contextos relevantes.

---

## Ordem obrigatória de leitura

Antes de qualquer tarefa, leia nesta ordem:

1. `CONTEXT.md` — raiz do projeto (visão geral, stack, regras gerais)
2. `manifest.md` — este arquivo (governança da documentação)
3. Contextos relacionados à tarefa (lista abaixo)
4. Código existente — apenas para confirmar implementação atual

---

## Índice de contextos

| Arquivo | Assunto |
|---|---|
| `architecture.md` | Clean Architecture, camadas, regra de dependência, SOLID |
| `folder-structure.md` | Estrutura de diretórios do projeto |
| `modules.md` | Estrutura interna de um módulo, ordem de implementação |
| `conventions.md` | Nomenclatura de arquivos, classes, interfaces, tokens |
| `coding-style.md` | Estilo de código TypeScript, boas práticas |
| `validation.md` | DTOs, class-validator, ValidationPipe |
| `security.md` | JWT, guards, estratégias, decorators de autenticação |
| `exceptions.md` | Hierarquia de exceções, GlobalExceptionFilter |
| `logging.md` | LoggingInterceptor, padrão de log |
| `database.md` | Prisma, schema, convenções de modelo |
| `documentation.md` | Padrão de CONTEXT.md e README.md por módulo |

---

## Prioridade entre documentação e código

```
1. CONTEXT.md (raiz)
2. .ai/contexts/manifest.md
3. Demais arquivos de .ai/contexts
4. Código existente
```

O código representa a implementação atual. A documentação representa a decisão arquitetural.

**Em caso de conflito: a documentação prevalece. O código está errado, não a documentação.**

---

## Política de conflitos

Se encontrar código que não segue a documentação:

- Não adapte a documentação ao código
- Não altere automaticamente os documentos
- Informe a inconsistência ao usuário
- Implemente seguindo a documentação

---

## Responsabilidades

| O que define padrões | O que implementa padrões |
|---|---|
| Documentação (`.ai/contexts`) | Código (`src/`) |

O código nunca define novos padrões. Novos padrões exigem atualização da documentação antes da implementação.

---

## Regras gerais para implementação

### Sempre fazer

- Ler os contextos relevantes antes de gerar qualquer código
- Manter consistência com o código existente
- Reutilizar padrões documentados
- Respeitar as responsabilidades de cada camada
- Seguir a ordem de implementação documentada em `modules.md`

### Nunca fazer

- Criar novos padrões sem atualizar a documentação
- Alterar arquitetura sem solicitação explícita
- Ignorar convenções documentadas
- Modificar código por preferência estética
- Usar abordagens diferentes das documentadas
- Criar abstrações para uso hipotético futuro

---

## Atualização da arquitetura

Quando uma decisão arquitetural mudar deliberadamente:

1. Atualize primeiro o arquivo correspondente em `.ai/contexts`
2. Depois atualize o código
3. Nunca faça o caminho inverso

**A documentação sempre antecede a implementação.**
