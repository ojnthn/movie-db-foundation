import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class NotificationsDto {
  @ApiProperty({ example: true })
  @IsBoolean({ message: 'newReleasesFromFavoriteGenres deve ser booleano' })
  newReleasesFromFavoriteGenres!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean({ message: 'watchlistUpcomingReminders deve ser booleano' })
  watchlistUpcomingReminders!: boolean;
}

export class UpdateUserConfigDto {
  @ApiProperty({ example: 'pt-BR' })
  @IsString()
  @Matches(/^[a-z]{2}-[A-Z]{2}$/, {
    message: 'language deve estar no formato ISO, ex: pt-BR',
  })
  language!: string;

  @ApiProperty({ example: 'BR' })
  @IsString()
  @Matches(/^[A-Z]{2}$/, {
    message: 'region deve ser um código de país ISO de 2 letras, ex: BR',
  })
  region!: string;

  @ApiProperty({ example: false })
  @IsBoolean({ message: 'includeAdult deve ser booleano' })
  includeAdult!: boolean;

  @ApiProperty({ example: [28, 12, 878], type: [Number] })
  @IsArray({ message: 'favoriteGenres deve ser um array' })
  @IsInt({
    each: true,
    message: 'favoriteGenres deve conter apenas números inteiros',
  })
  favoriteGenres!: number[];

  @ApiProperty({ example: 'dark', enum: ['light', 'dark'] })
  @IsIn(['light', 'dark'], { message: 'theme deve ser "light" ou "dark"' })
  theme!: string;

  @ApiProperty({ example: 20 })
  @IsInt({ message: 'itemsPerPage deve ser um número inteiro' })
  @Min(1, { message: 'itemsPerPage deve ser no mínimo 1' })
  @Max(100, { message: 'itemsPerPage deve ser no máximo 100' })
  itemsPerPage!: number;

  @ApiProperty({ example: 'popularity.desc' })
  @IsString()
  @IsNotEmpty({ message: 'defaultSortBy é obrigatório' })
  defaultSortBy!: string;

  @ApiProperty({ example: [8, 337, 119], type: [Number] })
  @IsArray({ message: 'streamingProviders deve ser um array' })
  @IsInt({
    each: true,
    message: 'streamingProviders deve conter apenas números inteiros',
  })
  streamingProviders!: number[];

  @ApiProperty({ type: NotificationsDto })
  @ValidateNested()
  @Type(() => NotificationsDto)
  notifications!: NotificationsDto;
}
