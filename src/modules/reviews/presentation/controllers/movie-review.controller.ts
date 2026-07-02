import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator/current-user.decorator';
import type { JwtPayload } from '../../../../shared/decorators/current-user.decorator/current-user.decorator';
import { CreateMovieReviewDto } from '../../application/dtos/create-movie-review.dto';
import { CreateMovieReviewUseCase } from '../../application/use-cases/create-movie-review.use-case';

@ApiTags('reviews')
@ApiSecurity('bearer')
@Controller()
export class MovieReviewController {
  constructor(
    private readonly createMovieReviewUseCase: CreateMovieReviewUseCase,
  ) {}

  @Post('movie/review')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar avaliação de um filme' })
  @ApiResponse({ status: 201, description: 'Avaliação registrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 422, description: 'Dados de avaliação inválidos' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateMovieReviewDto,
  ): Promise<void> {
    await this.createMovieReviewUseCase.execute({
      userId: user.sub,
      movieId: dto.movie_id,
      rate: dto.rate,
      loved: dto.loved,
      review: dto.review,
      logDate: new Date(dto.log_date),
    });
  }
}
