import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.interface';
import { AnthropicAiService } from './ai.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AiService,
      useClass: AnthropicAiService,
    },
  ],
  exports: [AiService],
})
export class AiModule {}
