import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheService } from './cache.interface';

@Injectable()
export class RedisCacheService implements CacheService, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('redis.url');

    this.client = url
      ? new Redis(url, { lazyConnect: false, maxRetriesPerRequest: 1 })
      : new Redis({
          host: this.configService.getOrThrow<string>('redis.host'),
          port: this.configService.get<number>('redis.port'),
          password: this.configService.get<string>('redis.password'),
          lazyConnect: false,
          maxRetriesPerRequest: 1,
        });

    this.client.on('error', (error: Error) => {
      this.logger.warn(`Redis indisponível: ${error.message}`);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (error: unknown) {
      this.logger.warn(
        `Falha ao ler cache (${key}): ${this.errorMessage(error)}`,
      );
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const raw = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.set(key, raw, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, raw);
      }
    } catch (error: unknown) {
      this.logger.warn(
        `Falha ao gravar cache (${key}): ${this.errorMessage(error)}`,
      );
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error: unknown) {
      this.logger.warn(
        `Falha ao remover cache (${key}): ${this.errorMessage(error)}`,
      );
    }
  }

  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    fetchFn: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  onModuleDestroy(): void {
    this.client.disconnect();
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'erro desconhecido';
  }
}
