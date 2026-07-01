# Spec: config

## Módulo
Modulo novo

## Objetivo
irá armazenar na tabela existente as preferencias do usuário

## Rota E REQUEST

PUT -> user/config
- deverá autenticar o jwt do usuário
{
  "language": "pt-BR",
  "region": "BR",
  "includeAdult": false,
  "favoriteGenres": [28, 12, 878],
  "theme": "dark",
  "itemsPerPage": 20,
  "defaultSortBy": "popularity.desc",
  "streamingProviders": [8, 337, 119],
  "notifications": {
    "newReleasesFromFavoriteGenres": true,
    "watchlistUpcomingReminders": true
  }
}

## Response (sucesso)
utilizando os padrões do REST API deverá retornar o status code de acordo

no caso do get deverá retornar o usuario jwt logado das tabelas respectivas:
{
  "language": "pt-BR",
  "region": "BR",
  "includeAdult": false,
  "favoriteGenres": [28, 12, 878],
  "theme": "dark",
  "itemsPerPage": 20,
  "defaultSortBy": "popularity.desc",
  "streamingProviders": [8, 337, 119],
  "notifications": {
    "newReleasesFromFavoriteGenres": true,
    "watchlistUpcomingReminders": true
  }
}

## Erros
utilizando os padrões do REST API deverá retornar o status code de erro de acordo

## Regras específicas
- deverá atualizar a tabela existente do usuario com os valores de 
"language": "pt-BR",
"region": "BR",
"includeAdult": false,
"theme": "dark",
"itemsPerPage": 20,
"defaultSortBy": "popularity.desc",
"newReleasesFromFavoriteGenres": true,
"watchlistUpcomingReminders": true

e para os valores compostos como:
"favoriteGenres": [28, 12, 878],
"streamingProviders": [8, 337, 119],
deverao ser criatas tabelas especificas com o id o usuario como foreign key (user_favorite_genres, user_streamng_providers)






