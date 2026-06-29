# Movie DB Foundation

API de gerenciamento e avaliação de filmes inspirada no Rotten Tomatoes. Dados de filmes via TMDB API. Usuários se registram, autenticam com JWT e poderão avaliar e comentar filmes.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | NestJS (TypeScript) |
| Banco de dados | MySQL 8.0 |
| ORM | Prisma |
| Autenticação | JWT (`@nestjs/jwt` + `passport-jwt`) |
| API externa | The Movie Database (TMDB) |
| Containerização | Docker + Docker Compose |
| Cache (planejado) | Redis 7 |

## Regras Globais

- Documentação prevalece sobre código — em conflito, o código está errado, não a documentação
- Nunca criar novos padrões arquiteturais sem atualizar a documentação primeiro
- Nunca alterar arquitetura sem solicitação explícita
- Nunca renomear classes existentes nem quebrar contratos públicos sem solicitação
- Nunca adicionar dependências sem justificativa documentada
- Nunca usar `any` explícito no código novo
- Nunca usar `console.log` em produção — usar `Logger` do NestJS
- Nunca modificar código por preferência estética
- Nunca criar abstrações para uso hipotético futuro

## Infraestrutura Local

```bash
# Subir todo o ambiente
docker compose -f docker/docker-compose.yml up --build -d

# Ver logs da API
docker compose -f docker/docker-compose.yml logs -f api
```

| Serviço | Porta | Acesso |
|---|---|---|
| api | 3000 | http://localhost:3000 |
| db (MySQL) | 3306 | localhost:3306 |
| phpmyadmin | 8080 | http://localhost:8080 (root/root) |
| redis | 6379 | localhost:6379 |

## Variáveis de Ambiente

```env
DATABASE_URL="mysql://root:root@localhost:3306/moviedb"
JWT_SECRET="sua-chave-secreta"
JWT_EXPIRATION="30m"
TMDB_API_KEY="sua-chave-tmdb"
TMDB_BASE_URL="https://api.themoviedb.org/3"
REDIS_URL="redis://localhost:6379"
```

## Documentação de Referência

@docs/ai/architecture.md
@docs/ai/coding-standards.md
@docs/ai/modules.md
@docs/ai/rest-client.md
@docs/ai/exceptions.md
@docs/ai/validation.md
@docs/ai/logging.md
@docs/ai/testing.md
@docs/ai/security.md
@docs/ai/database.md
