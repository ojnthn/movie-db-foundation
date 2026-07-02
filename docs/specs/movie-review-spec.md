# Spec: Review de Filme

## Módulo
Movies

## Objetivo
Armazenar a review do usuário de um filme

## Rota
POST - /movie/review

## Request
- 
body request:
{
    "movie_id": 1,
    "rate": 4.5 /// 0 à 5 estrelas,
    "loved": "bool"
    "review": "long-text?",
    "log_date": Datetime /// Data que o usuário assistiu
}

## Response (sucesso)
201 - Created

## Erros
- Erros padrão

### Estrutura do banco de dados

table name: user_movie_review

id: primary_key
user_id: fk tabela user
movie_id: int /// id do the movie db nao precisa ser fk
rate: int
loved: bool
log_date: datetime
