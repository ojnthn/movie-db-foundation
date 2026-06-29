# Convenções

## Objetivo

Documentar as convenções de nomenclatura de arquivos, classes, interfaces e tokens do projeto.

---

## Nomenclatura de artefatos

| Artefato | Padrão de arquivo | Padrão de classe | Exemplo |
|---|---|---|---|
| Entidade de domínio | `{name}.entity.ts` | PascalCase | `user.entity.ts` → `User` |
| Interface de repositório | `{name}.repository.interface.ts` | `I` + PascalCase | `user.repository.interface.ts` → `IUserRepository` |
| Token de repositório | — | `SCREAMING_SNAKE_CASE` | `USER_REPOSITORY` |
| Use case | `{action}.use-case.ts` | PascalCase + `UseCase` | `auth.use-case.ts` → `AuthUseCase` |
| Spec de use case | `{action}.use-case.spec.ts` | — | `auth.use-case.spec.ts` |
| Repositório Prisma | `prisma-{name}.repository.ts` | `Prisma` + PascalCase + `Repository` | `prisma-user.repository.ts` → `PrismaUserRepository` |
| Controller | `{name}.controller.ts` | PascalCase + `Controller` | `auth.controller.ts` → `AuthController` |
| DTO | `{name}.dto.ts` | PascalCase + `Dto` | `auth.dto.ts` → `AuthDto` |
| Guard | `{name}.guard.ts` | PascalCase + `Guard` | `jwt-auth.guard.ts` → `JwtAuthGuard` |
| Strategy | `{name}.strategy.ts` | PascalCase + `Strategy` | `jwt.strategy.ts` → `JwtStrategy` |
| Value Object | `{name}.vo.ts` | PascalCase | `email.vo.ts` → `Email` |
| Módulo | `{name}.module.ts` | PascalCase + `Module` | `auth.module.ts` → `AuthModule` |
| Exceção de domínio | `domain.exception.ts` | PascalCase + `Exception` | `UnauthorizedException` |
| Filter | `{name}.filter.ts` | PascalCase + `Filter` | `global-exception.filter.ts` → `GlobalExceptionFilter` |
| Interceptor | `{name}.interceptor.ts` | PascalCase + `Interceptor` | `logging.interceptor.ts` → `LoggingInterceptor` |
| Decorator | `{name}.decorator.ts` | camelCase (função) | `current-user.decorator.ts` → `CurrentUser` |

---

## Convenções de arquivo

- Nomes de arquivo: `kebab-case`
- Nomes de classe: `PascalCase`
- Nomes de interface: prefixo `I` + `PascalCase`
- Tokens de DI (string constants): `SCREAMING_SNAKE_CASE`
- Nomes de método: `camelCase`
- Nomes de propriedade: `camelCase`

---

## Convenções de responsabilidade

- Um arquivo possui apenas uma responsabilidade
- Um Controller representa um recurso HTTP
- Um Use Case representa uma ação
- Um Repository representa acesso a dados
- Um Service externo representa uma integração

---

## Convenções de DI

- Nunca usar métodos estáticos quando injeção de dependência for possível
- Sempre usar Dependency Injection do NestJS
- Sempre preferir composição à herança

---

## Convenções de inputs/outputs de use cases

Cada use case define seus próprios tipos de input e output como interfaces no mesmo arquivo:

```typescript
export interface AuthInput {
  email: string;
  password: string;
}

export interface AuthOutput {
  token: string;
}
```

---

## Convenções de módulos

- O token do repositório é exportado junto com a interface, no mesmo arquivo
- O `PrismaClient` é registrado como provider dentro do módulo que o usa (não globalmente)
- Cada módulo exporta apenas o que for necessário para outros módulos
