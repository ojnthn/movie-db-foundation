import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateMovieReviewDto {
  @ApiProperty({ example: 1, description: 'ID do filme na TMDB' })
  @IsInt({ message: 'movie_id deve ser um número inteiro' })
  movie_id!: number;

  @ApiProperty({ example: 4.5, description: 'Nota de 0 a 5 estrelas' })
  @IsNumber({}, { message: 'rate deve ser um número' })
  @Min(0, { message: 'rate deve ser no mínimo 0' })
  @Max(5, { message: 'rate deve ser no máximo 5' })
  rate!: number;

  @ApiProperty({ example: true })
  @IsBoolean({ message: 'loved deve ser booleano' })
  loved!: boolean;

  @ApiProperty({ example: 'Ótimo filme, recomendo!', required: false })
  @IsOptional()
  @IsString({ message: 'review deve ser texto' })
  review?: string;

  @ApiProperty({
    example: '2026-06-30T20:00:00.000Z',
    description: 'Data em que o usuário assistiu',
  })
  @IsDateString({}, { message: 'log_date deve ser uma data válida (ISO 8601)' })
  log_date!: string;
}
