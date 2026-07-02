import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { GetMovieDetailsUseCase } from '../../application/use-cases/get-movie-details.use-case';
import { GetNowPlayingMoviesUseCase } from '../../application/use-cases/get-now-playing-movies.use-case';
import { GetPopularMoviesUseCase } from '../../application/use-cases/get-popular-movies.use-case';

@ApiTags('movies')
@ApiSecurity('bearer')
@Controller()
export class MoviesController {
  constructor(
    private readonly getPopularMoviesUseCase: GetPopularMoviesUseCase,
    private readonly getNowPlayingMoviesUseCase: GetNowPlayingMoviesUseCase,
    private readonly getMovieDetailsUseCase: GetMovieDetailsUseCase,
  ) {}

  @Get('movies/popular')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar filmes populares' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de filmes populares com paginação',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getPopular(@Query('page') page?: string) {
    return this.getPopularMoviesUseCase.execute({
      page: page ? Number(page) : 1,
    });
  }

  @Get('movies/now-playing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar filmes em cartaz' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de filmes em cartaz com paginação',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getNowPlaying(@Query('page') page?: string) {
    return this.getNowPlayingMoviesUseCase.execute({
      page: page ? Number(page) : 1,
    });
  }

  @Get('movie/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter detalhes de um filme' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do filme na TMDB' })
  @ApiResponse({ status: 200, description: 'Detalhes do filme' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Filme não encontrado' })
  async getById(@Param('id') id: string) {
    return this.getMovieDetailsUseCase.execute({ id: Number(id) });
  }
}
