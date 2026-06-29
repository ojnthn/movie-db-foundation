# CONTEXT — GlobalExceptionFilter

## Responsabilidade

`GlobalExceptionFilter` é o único ponto de conversão de exceções em respostas HTTP. Captura todas as exceções não tratadas e retorna resposta padronizada `{ statusCode, message }`.

---

## Escopo

### Dentro do escopo

- Mapear tipos de exceção para códigos HTTP corretos
- Formatar a resposta de erro no padrão `{ statusCode, message }`
- Logar erros inesperados (500) via `Logger`

### Fora do escopo

- Lançar novas exceções — apenas capturar
- Lógica de negócio de qualquer tipo
- Validação de dados — responsabilidade de pipes e DTOs

---

## Limites

- Não lança exceções — é o terminus do fluxo de exceções da aplicação
- Não acessa banco de dados ou serviços externos
- Não altera o corpo da requisição

---

## Regras Obrigatórias

- Registrado globalmente via `APP_FILTER` em `AppModule` — nunca via `@UseFilters()` local
- `@Catch()` sem parâmetro — captura TODAS as exceções
- Exceções de domínio (`DomainException` e subclasses) não são logadas
- Apenas erros não mapeados (500) são logados via `Logger.error()`
- Stack trace nunca exposto na resposta HTTP
- Formato de resposta sempre: `{ statusCode: number, message: string }`
- Nova subclasse de `DomainException` → adicionar mapeamento aqui ANTES de usar em use case

---

## O que é Proibido

- Expor stack trace na resposta HTTP
- Logar exceções de domínio esperadas
- Lançar exceções dentro do filter
- Retornar formato diferente de `{ statusCode, message }`
- Mapear exceções em outros lugares além deste filter

---

## Dependências Permitidas

| Dependência | Justificativa |
|---|---|
| `ArgumentsHost` | Acesso ao contexto HTTP |
| `Logger` (NestJS) | Log de erros inesperados |
| `HttpException` (NestJS) | Tratamento de exceções NestJS nativas |
| `shared/exceptions/domain.exception` | Reconhecimento das exceções de domínio |

---

## Dependências Proibidas

- Repositórios, use cases, services — filter não acessa lógica de negócio
- `@prisma/client`

---

## Mapeamento Atual

| Classe | Código HTTP |
|---|---|
| `HttpException` (NestJS) | código original |
| `UnauthorizedException` | `401` |
| `ConflictException` | `409` |
| `NotFoundException` | `404` |
| `DomainException` | `422` |
| Qualquer outro `Error` | `500` + log |

---

## Convenções

| Artefato | Localização |
|---|---|
| Filter | `shared/filters/global-exception/global-exception.filter.ts` |

> **Inconsistência atual:** o arquivo `global-exception.filter.ts` está em `shared/filters/` (não na subpasta `global-exception/`). A estrutura documentada requer a subpasta. Mover o arquivo sem alterar imports quando conveniente.

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `DomainException` e subclasses | Captura e mapeia para HTTP |
| `AppModule` | Registra via `APP_FILTER` |
| Use cases | Lançam exceções que este filter captura |
| `Logger` | Instanciado com `GlobalExceptionFilter.name` para rastreabilidade |

---

## Evolução Futura

- Nova subclasse de `DomainException` → adicionar `instanceof` check antes do catch genérico de `DomainException`
- Ordem dos `instanceof` checks é importante: mais específico primeiro, `DomainException` por último
