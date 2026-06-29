# CONTEXT — {NomeException}

## Responsabilidade

`{NomeException}` representa a falha de negócio "{condição}" e é mapeada para HTTP {código} pelo `GlobalExceptionFilter`.

---

## Escopo

### Dentro do escopo

- Sinalizar que {condição de negócio específica} foi violada

### Fora do escopo

- Erros de formato de dados — responsabilidade do `ValidationPipe` (HTTP 400)
- Erros inesperados de sistema — são `Error` genéricos mapeados para HTTP 500
- {Outras condições que pertencem a outras exceções}

---

## Limites

- Subclasse direta de `DomainException` — nunca estender `HttpException` ou `Error` diretamente
- Localizada exclusivamente em `shared/exceptions/domain.exception.ts`
- Sem lógica adicional — apenas herança + override de `name`

---

## Regras Obrigatórias

- Criada em `shared/exceptions/domain.exception.ts` — nunca em `src/modules/`
- Após criar, registrar o mapeamento HTTP no `GlobalExceptionFilter`
- Lançada apenas em use cases — entidades e value objects retornam `Result<T>`
- Usar subclasse mais específica disponível — nunca lançar `DomainException` genérico quando existir subclasse adequada (LSP)

---

## O que é Proibido

- Criar fora de `shared/exceptions/`
- Lançar em entidades ou value objects
- Usar `throw new Error()` ou `throw new HttpException()` em código de domínio
- Expor stack trace na resposta HTTP

---

## Dependências Permitidas

| Dependência | Justificativa |
|---|---|
| `DomainException` | Superclasse de todas as exceções de domínio do projeto |

---

## Hierarquia de Exceções

```
Error
└── DomainException               → HTTP 422 (genérico)
    ├── UnauthorizedException     → HTTP 401
    ├── ConflictException         → HTTP 409
    ├── NotFoundException         → HTTP 404
    └── {NomeException}           → HTTP {código}
```

---

## Convenções

| Artefato | Localização | Nome |
|---|---|---|
| Classe | `shared/exceptions/domain.exception.ts` | `{Nome}Exception` (PascalCase + `Exception`) |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `DomainException` | Superclasse obrigatória |
| `GlobalExceptionFilter` | Mapeia esta exceção para HTTP {código} |
| Use cases | Único local onde esta exceção é lançada |

---

## Evolução Futura

- Se a mensagem padrão mudar, atualizar o construtor nesta classe
- Não criar subclasse de `{NomeException}` — criar nova subclasse de `DomainException` diretamente
