# Estrutura de Pastas

## Objetivo

Documentar o layout de diretórios do projeto e a responsabilidade de cada pasta.

---

## Estrutura raiz

```
movie-db-foundation/
├── src/                    # código-fonte da aplicação
├── prisma/                 # schema e migrations do banco de dados
├── docker/                 # Dockerfile e docker-compose.yml
├── test/                   # testes e2e
├── .ai/                    # base de conhecimento da IA
│   ├── ai-rules.md         # regras de comportamento da IA
│   └── contexts/           # contextos temáticos (fonte de verdade)
├── CONTEXT.md              # visão geral do projeto (lida primeiro)
└── .env.example            # variáveis de ambiente necessárias
```

---

## Estrutura de src/

```
src/
├── main.ts                 # bootstrap (ValidationPipe, Swagger, porta)
├── app.module.ts           # módulo raiz (globais: filter, guard, interceptor)
├── app.controller.ts       # GET /health — verificação de saúde da API
├── config/
│   ├── database.config.ts  # config namespace 'database'
│   └── jwt.config.ts       # config namespace 'jwt'
├── modules/
│   └── {module-name}/      # ver modules.md para estrutura interna
└── shared/
    ├── decorators/         # @Public(), @CurrentUser()
    ├── exceptions/         # DomainException e subclasses
    ├── filters/            # GlobalExceptionFilter
    ├── interceptors/       # LoggingInterceptor
    └── types/              # Result<T>
```

---

## Estrutura de um módulo

Cada módulo em `src/modules/` segue esta estrutura:

```
{module-name}/
├── CONTEXT.md              # contexto do módulo para a IA
├── README.md               # documentação para o desenvolvedor humano
├── domain/
│   ├── entities/           # entidades de domínio
│   ├── repositories/       # interfaces de repositório + tokens
│   └── value-objects/      # value objects com validação
├── application/
│   ├── use-cases/          # um arquivo por use case + seus specs
│   └── dtos/               # DTOs de input/output
├── infrastructure/
│   ├── repositories/       # implementações Prisma
│   ├── guards/             # guards de autenticação/autorização
│   └── strategies/         # strategies do Passport
├── presentation/
│   └── controllers/        # controllers HTTP
└── {module-name}.module.ts # registro do módulo NestJS
```

---

## shared/

Infraestrutura transversal usada por todos os módulos. Nada em `shared/` conhece domínio específico de nenhum módulo.

- Nada em `shared/` deve importar de `src/modules/`
- Só adicionar aqui o que for genuinamente reutilizável por dois ou mais módulos

---

## prisma/

```
prisma/
├── schema.prisma           # definição dos modelos e datasource
└── migrations/             # migrations geradas automaticamente pelo Prisma
```

---

## docker/

```
docker/
├── Dockerfile              # multi-stage build (dev → builder → runner)
└── docker-compose.yml      # api, db (MySQL), phpmyadmin, redis
```

---

## test/

```
test/
├── jest-e2e.json           # configuração Jest para testes e2e
├── app.e2e-spec.ts         # testes e2e do módulo raiz
└── auth.e2e-spec.ts        # testes e2e do módulo auth
```

---

## .ai/contexts/

Cada arquivo documenta exatamente um assunto. Sem duplicação de conteúdo entre arquivos. Ver `manifest.md` para índice completo e ordem de leitura.
