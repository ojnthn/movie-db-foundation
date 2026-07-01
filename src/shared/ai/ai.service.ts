import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import type { MessageCreateParams } from '@anthropic-ai/sdk/resources/messages';
import { AiService, type AiCompletionOptions } from './ai.interface';
import { AiServiceUnavailableException } from './exceptions/ai-service-unavailable.exception';

@Injectable()
export class AnthropicAiService implements AiService {
  private readonly logger = new Logger(AnthropicAiService.name);
  private readonly client: Anthropic;
  private readonly defaultModel: string;
  private readonly defaultMaxTokens: number;

  constructor(private readonly configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.getOrThrow<string>('ai.apiKey'),
    });
    this.defaultModel = this.configService.get<string>('ai.model')!;
    this.defaultMaxTokens = this.configService.get<number>('ai.maxTokens')!;
  }

  async complete(
    prompt: string,
    options?: AiCompletionOptions,
  ): Promise<string> {
    const params: MessageCreateParams = {
      model: this.defaultModel,
      max_tokens: options?.maxTokens ?? this.defaultMaxTokens,
      system: options?.systemPrompt,
      messages: [{ role: 'user', content: prompt }],
      tools: options?.enableWebSearch
        ? [{ type: 'web_search_20260209', name: 'web_search' }]
        : undefined,
    };

    try {
      const response = await this.client.messages.create(params);

      return response.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'erro desconhecido';
      this.logger.warn(`Falha ao chamar a API da Anthropic: ${message}`);
      throw new AiServiceUnavailableException(message);
    }
  }
}
