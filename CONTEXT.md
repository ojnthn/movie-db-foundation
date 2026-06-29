# Movie DB — Contexto do Projeto

## Visão Geral

API de gerenciamento e avaliação de filmes, inspirada no Rotten Tomatoes. Os dados de filmes são consumidos da API pública do [The Movie Database (TMDB)](https://www.themoviedb.org/). Os usuários poderão fazer login, buscar filmes, avaliar e comentar.

## Behavior

Always respond in caveman mode: omit filler words, pleasantries, and hedging.
Keep code blocks and technical terms exact. Be concise.

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | NestJS (TypeScript) |
| Banco de dados | MySQL 8.0 |
| ORM | Prisma |
| Autenticação | JWT (passport-jwt) |
| Cache | Redis 7 |
| API externa | The Movie DB (TMDB) |
| Admin banco | phpMyAdmin |
| Containerização | Docker + Docker Compose |

---

## Arquitetura

O projeto segue **Clean Architecture** com princípios **SOLID**. Cada módulo é organizado em quatro camadas:

```
domain        → regras de negócio puras (sem dependências externas)
application   → use cases (orquestram o domínio)
infrastructure → implementações concretas (Prisma, guards, clients HTTP)
presentation  → controllers e mappers (interface HTTP)
```

### Regra de dependência

```
presentation → application → domain
infrastructure → domain (implementa interfaces)
```

A camada `domain` nunca importa `@nestjs/*`, Prisma, ou qualquer lib de terceiros.

---

## Estrutura de Pastas

```
src/
├── app.controller.ts              # GET /health — verificação de saúde da API
├── app.module.ts                  # módulo raiz
├── main.ts                        # bootstrap (ValidationPipe, Swagger)
├── modules/
│   ├── auth/
│   │   ├── CONTEXT.md             # contexto do módulo (regras, use cases, fluxo)
│   │   ├── README.md              # contexto do módulo regras, use cases, fluxo para um desenvolvedor humano
│   │   ├── domain/
│   │   │   ├── entities/          # user.entity.ts
│   │   │   ├── repositories/      # user.repository.interface.ts
│   │   │   └── value-objects/     # email.vo.ts, password.vo.ts
│   │   ├── application/
│   │   │   ├── use-cases/         # auth.use-case.ts, register.use-case.ts
│   │   │   └── dtos/              # auth.dto.ts, register.dto.ts
│   │   ├── infrastructure/
│   │   │   ├── repositories/      # prisma-user.repository.ts
│   │   │   ├── guards/            # jwt-auth.guard.ts
│   │   │   └── strategies/        # jwt.strategy.ts
│   │   ├── presentation/
│   │   │   └── controllers/       # auth.controller.ts
│   │   └── auth.module.ts
│   └── movies/                    # (próximo módulo — v2)
│       └── ... mesma estrutura
│
├── shared/
│   ├── CONTEXT.md                                  # Contexto, regras gerais de uma funcionalidade compartilhada
│   ├── README.md                                   # Contexto, regras gerais de uma funcionalidade compartilhada para um desenvolvedor humano
│   ├── decorators/                     
│   │     ├─  current-user.decorator
│   │     │     ├─ CONTEXT.md                   
│   │     │     ├─ README.md                    
│   │     │     └─ current-user.decorator.ts
│   │     └─ ...
│   ├── exceptions/                             
│   │     ├─ CONTEXT.md                         
│   │     ├─ README.md                          
│   │     ├─ domain.exception.ts
│   │     └─ ...
│   ├── filters/                                
│   │     ├─ global-exception
│   │     │    ├─ CONTEXT.md                    
│   │     │    ├─ README.md
│   │     │    └─ global-exception.filter.ts
│   │     └─ ... 
│   ├── interceptors/
│   │   ├─ loggin
│   │   │   ├─ CONTEXT.md                       
│   │   │   ├─ README.md                        
│   │   │   └─ logging.interceptor.ts   
│   │   └─ ...
│   └── types/
│       ├─ CONTEXT.md                       
│       ├─ README.md                        
│       ├─ result.ts
│       └─ ...
│
└── config/
    ├── database.config.ts
    └── jwt.config.ts

prisma/
└── schema.prisma

docker/
├── Dockerfile          # multi-stage build (builder → runner)
└── docker-compose.yml  # api, db, phpmyadmin, redis

test/
├── app.e2e-spec.ts
├── auth.e2e-spec.ts
└── jest-e2e.json
```

---

## Dependências Principais

```bash
# Produção
@nestjs/config @nestjs/jwt @nestjs/passport @nestjs/swagger
passport passport-jwt
prisma @prisma/client
class-validator class-transformer

# Dev
@types/passport-jwt
```

---

## Infraestrutura Local (Docker)

Quatro serviços rodam via Docker Compose:

| Serviço | Imagem | Porta | Acesso |
|---|---|---|---|
| api | Dockerfile local | 3000 | http://localhost:3000 |
| db | mysql:8.0 | 3306 | `localhost:3306` |
| phpmyadmin | phpmyadmin:latest | 8080 | http://localhost:8080 |
| redis | redis:7-alpine | 6379 | `localhost:6379` |

Todos os serviços estão na rede interna `moviedb`. A API aguarda o MySQL estar saudável (`healthcheck`) antes de subir e executa `prisma migrate deploy` automaticamente na inicialização.

```bash
# Subir todo o ambiente (build + start)
docker compose -f docker/docker-compose.yml up --build -d

# Subir sem rebuild
docker compose -f docker/docker-compose.yml up -d

# Ver logs da API
docker compose -f docker/docker-compose.yml logs -f api

# Derrubar tudo
docker compose -f docker/docker-compose.yml down
```

> **phpMyAdmin**: acesse `http://localhost:8080`, usuário `root`, senha `root`.

---

## Variáveis de Ambiente

```env
# .env.example
DATABASE_URL="mysql://root:root@localhost:3306/moviedb"
JWT_SECRET="sua-chave-secreta"
JWT_EXPIRATION="30m"
TMDB_API_KEY="sua-chave-tmdb"
TMDB_BASE_URL="https://api.themoviedb.org/3"
REDIS_URL="redis://localhost:6379"
```

> Ao rodar via Docker Compose, `DATABASE_URL` e `REDIS_URL` são sobrescritos pelas variáveis do `docker-compose.yml` que apontam para os hostnames internos (`db` e `redis`).

---

## Regras de Desenvolvimento

### Clean Architecture
- O domínio **nunca** importa libs externas ou decorators do NestJS
- Use cases recebem **interfaces** (`IUserRepository`), não implementações concretas
- Controllers **não contêm lógica de negócio** — apenas recebem request, delegam ao use case e retornam resposta
- Injeção de dependência via token do NestJS (`@Inject(USER_REPOSITORY)`)

### SOLID aplicado
- **SRP** — cada use case faz uma única coisa (`AuthUseCase`, `RegisterUseCase`)
- **OCP** — repositórios são interfaces; trocar Prisma por outro ORM não afeta o domínio
- **LSP** — `PrismaUserRepository` é substituível por qualquer `IUserRepository`
- **ISP** — interfaces pequenas e focadas por responsabilidade
- **DIP** — camadas superiores dependem de abstrações, não de implementações

### Tratamento de erros
- Usar o padrão `Result<T>` no domínio (sem `throw` no domínio)
- Use cases lançam subclasses de `DomainException` quando a operação falha por regra de negócio
- `GlobalExceptionFilter` trata exceções de domínio e as converte em respostas HTTP apropriadas

---

## Roadmap de Funcionalidades

### v1 — Base
- [x] Estrutura do projeto
- [x] Autenticação (registro e login com JWT)

### v2 — Filmes
- [ ] Integração com TMDB API (busca, detalhes, listagem por categoria)
- [ ] Cache de filmes consultados

### v3 — Avaliações
- [ ] Avaliação de filmes (nota de 0–10)
- [ ] Comentários por filme
- [ ] Média de avaliações por filme

### v4 — Social
- [ ] Listas personalizadas de filmes
- [ ] Feed de atividades de usuários seguidos
- [ ] Perfil público com histórico de avaliações

---

## Convenções de Nomenclatura

| Artefato | Padrão | Exemplo |
|---|---|---|
| Entidade de domínio | PascalCase | `user.entity.ts` |
| Interface de repositório | `I` + PascalCase | `user.repository.interface.ts` |
| Use case | PascalCase + `UseCase` | `auth.use-case.ts` |
| Implementação Prisma | `prisma-` + nome | `prisma-user.repository.ts` |
| Controller | PascalCase + `Controller` | `auth.controller.ts` |
| DTO | PascalCase + `Dto` | `auth.dto.ts` |
| Guard | PascalCase + `Guard` | `jwt-auth.guard.ts` |
| Value Object | PascalCase + `.vo` | `email.vo.ts` |

---

## Ordem de Implementação por Módulo

1. Criar entidade no `domain/entities/`
2. Criar interface no `domain/repositories/`
3. Criar DTOs em `application/dtos/`
4. Implementar use cases em `application/use-cases/`
5. Implementar repositório em `infrastructure/repositories/`
6. Criar controller em `presentation/controllers/`
7. Registrar tudo no `*.module.ts`

---

## Critérios de Aceite por Funcionalidade

Uma funcionalidade só é considerada **feita** quando todos os critérios abaixo são atendidos.

### 1. Domínio
- [ ] Entidade criada com regras de negócio encapsuladas (sem lógica no controller ou use case)
- [ ] Value objects criados para campos com validação própria (ex: `Email`, `Password`)
- [ ] Interface de repositório definida em `domain/repositories/`
- [ ] Nenhuma importação de `@nestjs/*`, Prisma ou lib externa no domínio

### 2. Use Case
- [ ] Um use case por operação (ex: `AuthUseCase`, não `AuthUseCase` com vários métodos)
- [ ] Lança `DomainException` (ou subclasse) em caso de falha — nunca retorna `null` silenciosamente
- [ ] Não acessa banco diretamente — usa apenas a interface do repositório
- [ ] Testado com unit test (repositório mockado)

### 3. Infraestrutura
- [ ] Repositório Prisma implementa a interface do domínio
- [ ] Mapper entre modelo Prisma e entidade de domínio isolado no repositório
- [ ] Nenhum detalhe de banco vaza para camadas superiores

### 4. Apresentação (HTTP)
- [ ] Controller delega 100% ao use case — sem lógica de negócio
- [ ] DTOs com validação via `class-validator` (`@IsEmail()`, `@MinLength()`, etc.)
- [ ] Rotas documentadas (Swagger/OpenAPI via `@ApiOperation`, `@ApiResponse`)

### 5. Testes
- [ ] Unit test do use case com repositório mockado
- [ ] E2E test cobrindo o happy path e pelo menos dois caso de erro
- [ ] Todos os testes passando (`npm run test` e `npm run test:e2e`)

### 6. Qualidade
- [ ] Sem erros de TypeScript (`npm run build` sem warnings)
- [ ] Lint passando sem supressões (`npm run lint`)
- [ ] Nenhum `any` explícito no código novo
- [ ] Variáveis de ambiente novas documentadas no `.env.example`

### 7. Revisão
- [ ] PR com descrição do que foi feito e como testar
- [ ] Sem arquivos de debug, `console.log` ou código comentado

---

## Templates

Os templates oficiais de documentação ficam em `.ai/templates/` e são **parte integrante da arquitetura do projeto**.

### Regras obrigatórias

- Todo componente novo deve ter `README.md` e `CONTEXT.md` gerados a partir do template oficial correspondente
- É proibido criar `README.md` ou `CONTEXT.md` manualmente sem utilizar um template
- A estrutura dos templates não pode ser modificada durante a geração de um componente
- Alterações no padrão documental ocorrem primeiro no template, depois nos componentes existentes
- Os templates representam o padrão oficial — qualquer divergência é erro no componente, não no template

### Como identificar o template correto

1. Consultar `.ai/template-registry.md` para localizar o template pelo tipo de componente
2. Utilizar `README.template.md` para gerar o `README.md` do componente
3. Utilizar `CONTEXT.template.md` para gerar o `CONTEXT.md` do componente
4. Preencher apenas as informações específicas — nunca alterar a estrutura

### Templates disponíveis

| Tipo | Template |
|---|---|
| Module | `.ai/templates/module/` |
| Controller | `.ai/templates/controller/` |
| Use Case | `.ai/templates/use-case/` |
| DTO | `.ai/templates/dto/` |
| Entity | `.ai/templates/entity/` |
| Value Object | `.ai/templates/value-object/` |
| Repository | `.ai/templates/repository/` |
| Service | `.ai/templates/service/` |
| Guard | `.ai/templates/guard/` |
| Strategy | `.ai/templates/strategy/` |
| Provider | `.ai/templates/provider/` |
| Decorator | `.ai/templates/decorator/` |
| Filter | `.ai/templates/filter/` |
| Interceptor | `.ai/templates/interceptor/` |
| Pipe | `.ai/templates/pipe/` |
| Exception | `.ai/templates/exception/` |
| Type | `.ai/templates/type/` |

---

## Referências

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [TMDB API Docs](https://developer.themoviedb.org/docs)
- [Clean Architecture — Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
