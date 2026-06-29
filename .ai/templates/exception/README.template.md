# {NomeException}

## Objetivo

Sinalizar que {condição de negócio} foi violada, resultando em resposta HTTP {código}.

---

## Responsabilidades

- Representar a falha de negócio "{descrição do contexto}" de forma tipada
- Permitir que o `GlobalExceptionFilter` mapeie para HTTP {código} de forma previsível

---

## Fluxo

```
UseCase detecta condição de falha → throw new {NomeException}(mensagem)
    → GlobalExceptionFilter.catch() → HTTP {código} { statusCode, message }
```

---

## Quando Utilizar

| Situação | Usar esta exceção |
|---|---|
| {Condição específica 1} | Sim |
| {Condição específica 2} | Sim |
| {Condição que pertence a outra exceção} | Não — usar `{OutraException}` |

---

## Estrutura interna

```typescript
// shared/exceptions/domain.exception.ts

export class {NomeException} extends DomainException {
  constructor(message = '{Mensagem padrão}') {
    super(message);
    this.name = '{NomeException}';
  }
}
```

---

## Como Utilizar

### Lançar no use case

```typescript
throw new {NomeException}('{mensagem contextualizando a falha}');
```

### Mapeamento no GlobalExceptionFilter

```typescript
if (exception instanceof {NomeException}) {
  return { status: {código}, message: exception.message };
}
```

---

## Exemplos

```typescript
// Email duplicado no cadastro
throw new ConflictException('Email já cadastrado');

// Recurso não encontrado
throw new NotFoundException('Usuário não encontrado');

// Credenciais inválidas
throw new UnauthorizedException();
```

---

## Observações

- Exceções de domínio são lançadas apenas em use cases — entidades retornam `Result<T>`
- Esta exceção **não é logada** pelo `GlobalExceptionFilter` — é um erro esperado de negócio
- Nunca usar `throw new Error()` ou `throw new HttpException()` em código de domínio
