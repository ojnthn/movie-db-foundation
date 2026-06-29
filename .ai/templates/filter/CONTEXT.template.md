# CONTEXT — {NomeFilter}

## Responsabilidade

`{NomeFilter}` é o único ponto de conversão de exceções em respostas HTTP. Captura {todas as exceções / exceções específicas} e retorna resposta padronizada com `{ statusCode, message }`.

---

## Escopo

### Dentro do escopo

- Mapear tipos de exceção para códigos HTTP corretos
- Formatar a resposta de erro no padrão do projeto
- Logar erros inesperados (500) via `Logger`

### Fora do escopo

- Lançar novas exceções — apenas capturar
- Lógica de negócio — apenas tradução de exceção para HTTP
- Validação de dados — responsabilidade de pipes e DTOs

---

## Limites

- Não lança exceções — é o terminus do fluxo de exceções
- Não acessa banco de dados ou serviços externos
- Não altera o corpo da requisição

---

## Regras Obrigatórias

- Registrado globalmente via `APP_FILTER` em `AppModule` — nunca via `@UseFilters()` local
- Exceções de domínio (`DomainException` e subclasses) não são logadas — são erros esperados
- Apenas erros não mapeados (500) são logados via `Logger`
- Stack trace nunca é exposto na resposta HTTP
- Formato de resposta sempre: `{ statusCode: number, message: string }`
- Adicionar novas exceções ao mapeamento antes de criar novas subclasses de `DomainException`

---

## O que é Proibido

- Expor stack traces na resposta HTTP
- Logar exceções de domínio esperadas (`DomainException`)
- Lançar exceções dentro do filter
- Retornar formato diferente de `{ statusCode, message }`

---

## Dependências Permitidas

| Dependência | Justificativa |
|---|---|
| `ArgumentsHost` | Acesso ao contexto HTTP |
| `Logger` | Log de erros inesperados |
| `shared/exceptions/*` | Reconhecimento das exceções de domínio do projeto |
| `HttpException` (NestJS) | Tratamento de exceções NestJS nativas |

---

## Dependências Proibidas

- Repositórios, use cases, services — filter não acessa lógica de negócio
- `@prisma/client` — filter não acessa banco

---

## Convenções

| Artefato | Localização | Nome |
|---|---|---|
| Filter | `shared/filters/{nome}/{nome}.filter.ts` | `{Nome}Filter` |

---

## Mapeamento de Exceções

| Classe | Código HTTP |
|---|---|
| `UnauthorizedException` | `401` |
| `NotFoundException` | `404` |
| `ConflictException` | `409` |
| `DomainException` | `422` |
| `HttpException` (NestJS) | código original |
| Qualquer outro `Error` | `500` |

> Ao criar nova subclasse de `DomainException`, mapear aqui antes de usar.

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `shared/exceptions/domain.exception` | Reconhece todas as subclasses para mapeamento HTTP |
| `AppModule` | Registra via `APP_FILTER` |
| Use cases | Lançam exceções que este filter captura |

---

## Evolução Futura

- Nova subclasse de `DomainException` → adicionar ao mapeamento no filter
- {Outro ponto de extensão previsto}
