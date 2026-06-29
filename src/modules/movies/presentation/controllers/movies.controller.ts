import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { GetPopularMoviesUseCase } from '../../application/use-cases/get-popular-movies.use-case';

@ApiTags('movies')
@ApiSecurity('bearer')
@Controller('movies')
export class MoviesController {
  constructor(private readonly getPopularMoviesUseCase: GetPopularMoviesUseCase) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar filmes populares em cartaz' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página (padrão: 1)' })
  @ApiResponse({ status: 200, description: 'Lista de filmes populares com paginação' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getPopular(@Query('page') page?: string) {
    return this.getPopularMoviesUseCase.execute({
      page: page ? Number(page) : 1,
    });
  }
}
