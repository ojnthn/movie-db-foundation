# Arquitetura

## Objetivo

Definir as camadas, responsabilidades e regras de dependência do projeto.

---

## Modelo

O projeto segue **Clean Architecture** com princípios **SOLID**. Cada módulo é organizado em quatro camadas:

```
domain         → regras de negócio puras (sem dependências externas)
application    → use cases (orquestram o domínio)
infrastructure → implementações concretas (Prisma, guards, clients HTTP)
presentation   → controllers e mappers (interface HTTP)
```

---

## Regra de dependência

```
presentation → application → domain
infrastructure → domain (implementa interfaces do domínio)
```

As dependências sempre apontam para dentro. O `domain` nunca depende de nada externo.

---

## Responsabilidades por camada

### domain

- Entidades com regras de negócio encapsuladas
- Value objects com validação própria
- Interfaces de repositório (sem implementação)
- Uso de `Result<T>` para operações que podem falhar (sem `throw`)
- **Proibido:** importar `@nestjs/*`, Prisma, ou qualquer lib de terceiros

### application

- Um use case por operação (ex: `AuthUseCase`, `RegisterUseCase`)
- Recebe interfaces do domínio via injeção de dependência — nunca implementações concretas
- Lança `DomainException` (ou subclasse) em caso de falha de regra de negócio
- **Proibido:** acessar banco diretamente; conter lógica de apresentação

### infrastructure

- Implementações concretas de repositórios (ex: `PrismaUserRepository`)
- Guards, strategies de autenticação
- Mapper entre modelo Prisma e entidade de domínio (isolado no repositório)
- **Proibido:** vazar detalhes de banco para camadas superiores

### presentation

- Controllers que recebem request, delegam ao use case e retornam resposta
- DTOs com validação via `class-validator`
- Documentação Swagger por rota
- **Proibido:** conter lógica de negócio; acessar repositórios diretamente

---

## SOLID aplicado

| Princípio | Aplicação |
|---|---|
| SRP | Cada use case faz uma única coisa |
| OCP | Repositórios são interfaces; trocar Prisma não afeta o domínio |
| LSP | `PrismaUserRepository` é substituível por qualquer `IUserRepository` |
| ISP | Interfaces pequenas e focadas por responsabilidade |
| DIP | Camadas superiores dependem de abstrações, não de implementações |

---

## Injeção de dependência

Repositórios são injetados via token do NestJS:

```typescript
// Definição do token (domain)
export const USER_REPOSITORY = 'USER_REPOSITORY';

// Injeção no use case (application)
@Inject(USER_REPOSITORY)
private readonly userRepository: IUserRepository

// Registro no módulo (infrastructure)
{ provide: USER_REPOSITORY, useClass: PrismaUserRepository }
```

---

## Globais registrados no AppModule

| Token | Classe | Responsabilidade |
|---|---|---|
| `APP_FILTER` | `GlobalExceptionFilter` | Captura todas as exceções não tratadas |
| `APP_GUARD` | `JwtAuthGuard` | Protege todas as rotas por padrão |
| `APP_INTERCEPTOR` | `LoggingInterceptor` | Loga método, URL e tempo de resposta |

---

## O que é proibido

- O `domain` importar `@nestjs/*`, Prisma ou qualquer lib de terceiros
- Use cases acessarem banco diretamente
- Controllers conterem lógica de negócio
- Detalhes de banco (modelos Prisma) vazarem para camadas superiores
- Criar novos padrões arquiteturais sem atualizar a documentação

---

## Documentação como parte da arquitetura

Os templates em `.ai/templates/` fazem parte da arquitetura do projeto. Não são opcionais.

### Regras

- Todo componente criado deve possuir `README.md` e `CONTEXT.md` derivados do template oficial
- Não existem estruturas livres de documentação — todo componente tem template correspondente
- A documentação é gerada antes ou junto ao código — nunca depois
- Consultar `.ai/template-registry.md` para identificar o template correto por tipo de componente

### O que é proibido

- Criar `README.md` ou `CONTEXT.md` manualmente sem utilizar o template oficial
- Omitir documentação de qualquer componente novo
- Criar um novo tipo de componente sem criar o template correspondente em `.ai/templates/`
- Modificar a estrutura de um template durante a geração de um componente
