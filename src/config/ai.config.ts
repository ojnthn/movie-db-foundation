import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
  maxTokens: process.env.ANTHROPIC_MAX_TOKENS
    ? Number(process.env.ANTHROPIC_MAX_TOKENS)
    : 1500,
}));
