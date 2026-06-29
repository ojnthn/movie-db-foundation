import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { RestClient } from '../contracts/rest-client.interface';
import { RequestConfig } from '../dto/request-config.dto';
import { ExternalApiException } from '../exceptions/external-api.exception';

@Injectable()
export class RestClientService implements RestClient {
  private readonly logger = new Logger(RestClientService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly globalTimeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('TMDB_BASE_URL');
    this.apiKey = this.configService.getOrThrow<string>('TMDB_API_KEY');
    this.globalTimeout = this.configService.get<number>('API_TIMEOUT') ?? 5000;
  }

  async get<TResponse>(endpoint: string, config?: RequestConfig): Promise<TResponse> {
    return this.request<undefined, TResponse>('GET', endpoint, undefined, config);
  }

  async post<TRequest, TResponse>(
    endpoint: string,
    body: TRequest,
    config?: RequestConfig,
  ): Promise<TResponse> {
    return this.request<TRequest, TResponse>('POST', endpoint, body, config);
  }

  private async request<TRequest, TResponse>(
    method: string,
    endpoint: string,
    body?: TRequest,
    config?: RequestConfig,
  ): Promise<TResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    const startTime = Date.now();

    const headers: Record<string, string> = {
      ...config?.headers,
      Authorization: `Bearer ${this.apiKey}`,
    };

    this.logger.log(`→ ${method} ${endpoint}`);

    try {
      const response = await firstValueFrom(
        this.httpService.request<TResponse>({
          method,
          url,
          data: body,
          headers,
          params: config?.params,
          timeout: config?.timeout ?? this.globalTimeout,
        }),
      );

      const duration = Date.now() - startTime;
      this.logger.log(`← ${method} ${endpoint} ${response.status} (${duration}ms)`);

      return response.data;
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const axiosError = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const status = axiosError?.response?.status ?? 500;
      const message = axiosError?.response?.data?.message ?? axiosError?.message ?? 'External API error';

      this.logger.error(`← ${method} ${endpoint} ${status} (${duration}ms): ${message}`);

      throw new ExternalApiException(status, endpoint, message);
    }
  }
}
