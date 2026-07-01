import { RequestConfig } from '../dto/request-config.dto';

export abstract class RestClient {
  abstract get<TResponse>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<TResponse>;

  abstract post<TRequest, TResponse>(
    endpoint: string,
    body: TRequest,
    config?: RequestConfig,
  ): Promise<TResponse>;
}
