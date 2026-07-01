import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator/current-user.decorator';
import type { JwtPayload } from '../../../../shared/decorators/current-user.decorator/current-user.decorator';
import { UpdateUserConfigDto } from '../../application/dtos/update-user-config.dto';
import { GetUserConfigUseCase } from '../../application/use-cases/get-user-config.use-case';
import { UpdateUserConfigUseCase } from '../../application/use-cases/update-user-config.use-case';

@ApiTags('user-config')
@ApiSecurity('bearer')
@Controller('user/config')
export class UserConfigController {
  constructor(
    private readonly getUserConfigUseCase: GetUserConfigUseCase,
    private readonly updateUserConfigUseCase: UpdateUserConfigUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter preferências do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Preferências do usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async get(@CurrentUser() user: JwtPayload) {
    return this.getUserConfigUseCase.execute({ userId: user.sub });
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar preferências do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Preferências atualizadas' })
  @ApiResponse({ status: 400, description: 'DTO inválido' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateUserConfigDto,
  ) {
    return this.updateUserConfigUseCase.execute({
      userId: user.sub,
      language: dto.language,
      region: dto.region,
      includeAdult: dto.includeAdult,
      favoriteGenres: dto.favoriteGenres,
      theme: dto.theme,
      itemsPerPage: dto.itemsPerPage,
      defaultSortBy: dto.defaultSortBy,
      streamingProviders: dto.streamingProviders,
      notifications: {
        newReleasesFromFavoriteGenres:
          dto.notifications.newReleasesFromFavoriteGenres,
        watchlistUpcomingReminders:
          dto.notifications.watchlistUpcomingReminders,
      },
    });
  }
}
