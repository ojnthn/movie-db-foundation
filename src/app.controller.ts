import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './shared/decorators/public.decorator/public.decorator';

@ApiTags('health')
@Controller()
export class AppController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Verificação de saúde da API' })
  @ApiResponse({ status: 200, description: 'API online' })
  health() {
    return { status: 'ok' };
  }
}
