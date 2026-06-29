o modulo `movies` deve disponibilizar 1 endpoints novo

1. Listagem de filmes populares
curl --request GET \
     --url 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_release_type=2|3&release_date.gte={min_date}&release_date.lte={max_date}' \
     --header 'Authorization: Bearer <<access_token>>' \
     --header 'accept: application/json'

quero que utilizando o http disponiviel em src/ crie um novo endpoint chamado
GET /movies e com base no retorno da api do TMDB retorne: 
{
    "pagination": {
        "current": 1,
        "next": 2, // Caso seja null será o fim da paginacao
    }
    "details": [
    {
        "id": 1,
        "backdrop_path": "",
        "name": "Mario Galaxy",
        "overview": "xxx",
        "genres_names": [
            "action", "horror"
        ]
    },
    ...
]
}

o usuario deve ser autenticado pelo jwt

e gere os arquivos de contexto