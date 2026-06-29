# Módulos

## Objetivo

Documentar a estrutura interna de um módulo, a ordem de implementação e os critérios de aceite.

---

## Módulos existentes

| Módulo | Status | Responsabilidade |
|---|---|---|
| `auth` | Implementado | Registro e autenticação de usuários com JWT |
| `movies` | Planejado (v2) | Integração com TMDB API, busca e detalhes de filmes |

---

## Estrutura interna de um módulo

```
modules/{module-name}/
├── CONTEXT.md
├── README.md
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── value-objects/
├── application/
│   ├── use-cases/
│   └── dtos/
├── infrastructure/
│   ├── repositories/
│   ├── guards/            (se necessário)
│   └── strategies/        (se necessário)
├── presentation/
│   └── controllers/
└── {module-name}.module.ts
```

---

## Ordem obrigatória de implementação

Ao criar um novo módulo ou feature:

1. Criar entidade em `domain/entities/`
2. Criar interface de repositório em `domain/repositories/`
3. Criar value objects em `domain/value-objects/` (se houver campos com validação própria)
4. Criar DTOs em `application/dtos/`
5. Implementar use cases em `application/use-cases/`
6. Implementar repositório em `infrastructure/repositories/`
7. Criar controller em `presentation/controllers/`
8. Registrar tudo em `{module-name}.module.ts`

---

## Critérios de aceite por camada

### Domínio

- Entidade criada com regras de negócio encapsuladas (sem lógica no controller ou use case)
- Value objects criados para campos com validação própria
- Interface de repositório definida em `domain/repositories/`
- Nenhuma importação de `@nestjs/*`, Prisma ou lib externa no domínio

### Use Case

- Um use case por operação — nunca múltiplas operações no mesmo use case
- Lança `DomainException` (ou subclasse) em caso de falha — nunca retorna `null` silenciosamente
- Não acessa banco diretamente — usa apenas a interface do repositório
- Testado com unit test (repositório mockado)

### Infraestrutura

- Repositório Prisma implementa a interface do domínio
- Mapper entre modelo Prisma e entidade de domínio isolado dentro do repositório
- Nenhum detalhe de banco vaza para camadas superiores

### Apresentação (HTTP)

- Controller delega 100% ao use case — sem lógica de negócio
- DTOs com validação via `class-validator`
- Rotas documentadas via Swagger (`@ApiOperation`, `@ApiResponse`, `@ApiTags`)

### Testes

- Unit test do use case com repositório mockado
- E2E test cobrindo o happy path e pelo menos dois casos de erro
- Todos os testes passando (`npm run test` e `npm run test:e2e`)

### Qualidade

- Sem erros de TypeScript (`npm run build` sem warnings)
- Lint passando (`npm run lint`)
- Nenhum `any` explícito no código novo
- Variáveis de ambiente novas documentadas no `.env.example`

### Revisão

- PR com descrição do que foi feito e como testar
- Sem arquivos de debug, `console.log` ou código comentado

---

## Registro no módulo

Todo módulo deve:

- Declarar seus controllers em `controllers`
- Declarar seus providers (use cases, repositórios, guards, strategies)
- Registrar o token do repositório via `provide` + `useClass`
- Exportar apenas o que for necessário para outros módulos (ex: `JwtAuthGuard`, `JwtModule`)

Exemplo de padrão de registro do repositório:

```typescript
{
  provide: USER_REPOSITORY,
  useClass: PrismaUserRepository,
}
```

---

## Documentação obrigatória por módulo

Cada módulo deve conter:

- `CONTEXT.md` — para a IA: responsabilidade, use cases, entidades, contratos de API, erros esperados, fluxos, decisões técnicas, o que não fazer
- `README.md` — para o desenvolvedor: como usar o módulo, como testar, variáveis de ambiente

Ver `documentation.md` para o padrão completo de cada documento.
