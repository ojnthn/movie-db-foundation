export interface AiCompletionOptions {
  systemPrompt?: string;
  maxTokens?: number;
  enableWebSearch?: boolean;
}

export abstract class AiService {
  abstract complete(
    prompt: string,
    options?: AiCompletionOptions,
  ): Promise<string>;
}
