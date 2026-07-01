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
import { GetPopularMoviesUseCase } from '../../application/use-cases/get-popular-movies.use-case';

@ApiTags('movies')
@ApiSecurity('bearer')
@Controller('movies')
export class MoviesController {
  constructor(
    private readonly getPopularMoviesUseCase: GetPopularMoviesUseCase,
    private readonly getMovieDetailsUseCase: GetMovieDetailsUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar filmes populares em cartaz' })
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

  @Get(':id')
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
