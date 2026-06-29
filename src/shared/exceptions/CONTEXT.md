# CONTEXT — Exceções de Domínio

## Responsabilidade

`domain.exception.ts` define a hierarquia de exceções de domínio do projeto. Todas as falhas de regra de negócio são representadas por subclasses de `DomainException`, mapeadas para códigos HTTP pelo `GlobalExceptionFilter`.

---

## Escopo

### Dentro do escopo

- Definir `DomainException` como base de todas as exceções de domínio
- Definir subclasses específicas para cenários de falha previsíveis

### Fora do escopo

- Tratamento HTTP — responsabilidade do `GlobalExceptionFilter`
- Lançamento de exceções — responsabilidade dos use cases
- Exceções de sistema ou infraestrutura — usar `Error` nativo (logado como 500)

---

## Hierarquia Atual

```typescript
DomainException          → HTTP 422
├── UnauthorizedException → HTTP 401 (mensagem padrão: "Credenciais inválidas")
├── ConflictException    → HTTP 409 (mensagem obrigatória)
└── NotFoundException    → HTTP 404 (mensagem obrigatória)
```

---

## Limites

- Subclasses de `DomainException` apenas em `shared/exceptions/domain.exception.ts`
- Exceções não contêm lógica — apenas herança + override de `name`
- Nunca criar exceções específicas de módulo em `src/modules/`

---

## Regras Obrigatórias

- Toda nova exceção de domínio é subclasse de `DomainException` (LSP)
- Ao criar nova subclasse, registrar o mapeamento HTTP no `GlobalExceptionFilter` ANTES de usar
- Use cases lançam subclasse mais específica disponível — nunca `DomainException` diretamente se existir subclasse adequada
- Entidades e value objects NUNCA lançam exceções — retornam `Result<T>` com `fail()`

---

## O que é Proibido

- Criar subclasses de `DomainException` fora de `shared/exceptions/`
- Lançar `DomainException` diretamente quando existir subclasse adequada
- Lançar em entidades ou value objects
- Usar `throw new Error()` em código de domínio
- Expor stack trace na resposta HTTP

---

## Dependências Permitidas

Nenhuma — herança de `Error` nativo do JavaScript.

---

## Convenções

| Exceção | Arquivo | Mensagem padrão |
|---|---|---|
| `DomainException` | `domain.exception.ts` | obrigatória no construtor |
| `UnauthorizedException` | `domain.exception.ts` | `'Credenciais inválidas'` |
| `ConflictException` | `domain.exception.ts` | obrigatória no construtor |
| `NotFoundException` | `domain.exception.ts` | obrigatória no construtor |

---

## Relação com Outros Componentes

| Componente | Relação |
|---|---|
| `GlobalExceptionFilter` | Captura e mapeia cada subclasse para o código HTTP correto |
| Use cases | Único local onde exceções de domínio são lançadas |
| `Result<T>` (`shared/types`) | Alternativa ao throw — usado em entidades e value objects |

---

## Evolução Futura

- Nova exceção: criar subclasse → adicionar mapeamento no `GlobalExceptionFilter` → usar no use case
- Não criar exceções específicas de módulo — exceções são compartilhadas entre todos os módulos
