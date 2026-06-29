<div align="center">

# Movie DB — Foundation

**API de gerenciamento e avaliação de filmes, inspirada no Rotten Tomatoes.**  
Dados de filmes via [TMDB API](https://www.themoviedb.org/) · Usuários se registram, avaliam e comentam filmes.

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)

</div>

---

> **Este projeto foi construído com auxílio de IA (Claude Code).** A base de conhecimento em `.ai/` — arquitetura, convenções, templates de documentação e regras de desenvolvimento — foi usada como contexto para guiar cada decisão de implementação. A IA lê esses arquivos antes de qualquer ação para manter consistência com os padrões definidos.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | NestJS 11 (TypeScript) |
| Banco de dados | MySQL 8.0 |
| ORM | Prisma 5 |
| Autenticação | JWT via `passport-jwt` |
| Cache | Redis 7 |
| API externa | The Movie Database (TMDB) |
| Admin banco | phpMyAdmin |
| Containerização | Docker + Docker Compose |

---

## Arquitetura

O projeto segue **Clean Architecture** com princípios **SOLID**. Cada módulo é dividido em quatro camadas com regra de dependência estrita:

```
presentation  →  application  →  domain
infrastructure               →  domain
```

```
src/modules/{modulo}/
├── domain/           # entidades, value objects, interfaces de repositório
├── application/      # use cases e DTOs
├── infrastructure/   # repositórios Prisma, guards, strategies
└── presentation/     # controllers HTTP
```

**Regras:**
- `domain` nunca importa `@nestjs/*`, Prisma ou libs externas
- Use cases recebem interfaces (`IUserRepository`), não implementações concretas
- Controllers não contêm lógica de negócio — apenas delegam ao use case
- Injeção de dependência via token do NestJS: `@Inject(USER_REPOSITORY)`

**Globais registrados no `AppModule`:**

| Token | Classe | Responsabilidade |
|---|---|---|
| `APP_FILTER` | `GlobalExceptionFilter` | Captura todas as exceções não tratadas |
| `APP_GUARD` | `JwtAuthGuard` | Protege todas as rotas por padrão |
| `APP_INTERCEPTOR` | `LoggingInterceptor` | Loga método, URL e tempo de resposta |

---

## Estrutura de pastas

```
movie-db-foundation/
├── src/
│   ├── main.ts                   # bootstrap (ValidationPipe, Swagger, porta)
│   ├── app.module.ts             # módulo raiz
│   ├── app.controller.ts         # GET /health
│   ├── config/
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   ├── modules/
│   │   └── auth/                 # registro e login com JWT
│   │       ├── domain/
│   │       │   ├── entities/         # user.entity.ts
│   │       │   ├── repositories/     # user.repository.interface.ts
│   │       │   └── value-objects/    # email.vo.ts, password.vo.ts
│   │       ├── application/
│   │       │   ├── use-cases/        # auth.use-case.ts, register.use-case.ts
│   │       │   └── dtos/
│   │       ├── infrastructure/
│   │       │   ├── repositories/     # prisma-user.repository.ts
│   │       │   ├── guards/           # jwt-auth.guard.ts
│   │       │   └── strategies/       # jwt.strategy.ts
│   │       └── presentation/
│   │           └── controllers/      # auth.controller.ts
│   └── shared/
│       ├── decorators/           # @Public(), @CurrentUser()
│       ├── exceptions/           # DomainException e subclasses
│       ├── filters/              # GlobalExceptionFilter
│       ├── interceptors/         # LoggingInterceptor
│       └── types/                # Result<T>
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docker/
│   ├── Dockerfile                # multi-stage build (dev → builder → runner)
│   └── docker-compose.yml        # api, db (MySQL), phpmyadmin, redis
├── test/
│   ├── app.e2e-spec.ts
│   └── auth.e2e-spec.ts
└── .ai/                          # base de conhecimento da IA
    ├── manifest.md               # governança: lido pela IA antes de qualquer ação
    ├── contexts/                 # arquitetura, convenções, segurança, banco, etc.
    └── templates/                # templates oficiais de README.md e CONTEXT.md
```

---

## Como rodar

### Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose
- Chave de API do [TMDB](https://www.themoviedb.org/settings/api) (opcional para a foundation)

### 1. Clonar e configurar variáveis

```bash
git clone <repo-url>
cd movie-db-foundation
cp .env.example .env
```

Edite `.env` com seus valores:

```env
DATABASE_URL="mysql://root:root@localhost:3306/moviedb"
JWT_SECRET="sua-chave-secreta"
JWT_EXPIRATION="30m"
TMDB_API_KEY="sua-chave-tmdb"
TMDB_BASE_URL="https://api.themoviedb.org/3"
REDIS_URL="redis://localhost:6379"
```

> Ao rodar via Docker, `DATABASE_URL` e `REDIS_URL` são sobrescritos automaticamente pelo `docker-compose.yml` para apontar para os serviços internos.

### 2. Subir com Docker (recomendado)

```bash
# Build + start (primeira vez)
docker compose -f docker/docker-compose.yml up --build -d

# Start sem rebuild
docker compose -f docker/docker-compose.yml up -d

# Logs da API
docker compose -f docker/docker-compose.yml logs -f api

# Derrubar tudo
docker compose -f docker/docker-compose.yml down
```

As migrations do Prisma são executadas automaticamente na inicialização da API.

### 3. Serviços disponíveis

| Serviço | URL |
|---|---|
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/api |
| Health check | http://localhost:3000/health |
| phpMyAdmin | http://localhost:8080 (user: `root`, senha: `root`) |
| MySQL | localhost:3306 |
| Redis | localhost:6379 |

### 4. Rodar localmente (sem Docker)

```bash
# Instalar dependências
npm install

# Rodar migrations
npx prisma migrate deploy

# Dev com hot-reload
npm run start:dev

# Build de produção
npm run build && npm run start:prod
```

---

## Testes

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Cobertura
npm run test:cov
```

---

## Como a IA foi usada

O diretório `.ai/` é a base de conhecimento do projeto. Antes de qualquer implementação, a IA lê esses arquivos para manter consistência com os padrões definidos:

| Arquivo | Conteúdo |
|---|---|
| `.ai/manifest.md` | Governança: ordem de leitura, regras, política de conflitos |
| `.ai/contexts/architecture.md` | Clean Architecture, camadas, SOLID |
| `.ai/contexts/conventions.md` | Nomenclatura de arquivos, classes e interfaces |
| `.ai/contexts/security.md` | JWT, guards, strategies |
| `.ai/contexts/exceptions.md` | Hierarquia de exceções, GlobalExceptionFilter |
| `.ai/contexts/database.md` | Prisma, schema, convenções de modelo |
| `.ai/templates/` | Templates oficiais de `README.md` e `CONTEXT.md` por tipo de componente |

A documentação sempre antecede a implementação. Em caso de conflito entre código e documentação, a documentação prevalece.

---

## Roadmap

### v1 — Base (atual)
- [x] Estrutura do projeto com Clean Architecture
- [x] Autenticação (registro e login com JWT)

### v2 — Filmes
- [ ] Integração com TMDB API (busca, detalhes, listagem por categoria)
- [ ] Cache de filmes com Redis

### v3 — Avaliações
- [ ] Avaliação de filmes (nota 0–10)
- [ ] Comentários por filme
- [ ] Média de avaliações

### v4 — Social
- [ ] Listas personalizadas
- [ ] Feed de atividades de usuários seguidos
- [ ] Perfil público com histórico de avaliações

---

## Referências

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [TMDB API Docs](https://developer.themoviedb.org/docs)
- [Clean Architecture — Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

<div align="center">

*This product uses the TMDB API but is not endorsed or certified by TMDB.*

[![TMDB](https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg)](https://www.themoviedb.org)

</div>
