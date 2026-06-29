# CONTEXT — @{NomeDecorator}

## Responsabilidade

`@{NomeDecorator}` {produz metadado `{chave}` / extrai `{dado}` do contexto de execução} para uso por {controllers / guards / interceptors}.

---

## Escopo

### Dentro do escopo

- {O que o decorator faz — ex: extrair `request.user` e injetar no parâmetro}
- {Ou: adicionar metadado ao handler para ser lido por guard/interceptor}

### Fora do escopo

- Lógica de negócio — decorators apenas produzem metadado ou extraem contexto
- Autorização ou autenticação — responsabilidade de guards
- Validação de dados — responsabilidade de pipes ou DTOs

---

## Limites

- Sem efeitos colaterais além de {produzir metadado / extrair dado do contexto}
- Não acessa banco de dados ou serviços externos
- Não lança exceções — não é o local para decisões de autorização

---

## Regras Obrigatórias

- Localizado em `shared/decorators/` — acessível a todos os módulos (ISP)
- Um decorator = uma única responsabilidade (SRP)
- Se for param decorator: usa `createParamDecorator`
- Se for metadata decorator: usa `SetMetadata` com chave exportada como constante

---

## O que é Proibido

- Conter lógica de negócio
- Acessar repositórios, use cases ou serviços externos
- Lançar exceções HTTP
- Guardar estado entre requisições

---

## Dependências Permitidas

| Dependência | Justificativa |
|---|---|
| `ExecutionContext` | Acesso ao contexto HTTP para extração de dados |
| `SetMetadata` | Adição de metadados ao handler |
| `createParamDecorator` | Criação de param decorators |

---

## Dependências Proibidas

- Qualquer repositório, use case ou service
- `@prisma/client` ou qualquer lib de banco

---

## Convenções

| Artefato | Localização | Exportação |
|---|---|---|
| Função decorator | `shared/decorators/{nome}.decorator.ts` | `export const {NomeDecorator}` (camelCase) |
| Chave de metadado | mesmo arquivo | `export const {NOME_METADATA_KEY} = '{chave}'` |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `{NomeGuard}` | Lê metadado via `Reflector` se for metadata decorator |
| `{NomeController}` | Usa `@{NomeDecorator}()` em parâmetros ou métodos |
| `{NomeInterceptor}` | Pode consumir metadado produzido por este decorator |

---

## Evolução Futura

- Se o decorator precisar de parâmetros adicionais, usar o padrão factory: `@{NomeDecorator}(opcoes)`
- {Extensão prevista}
