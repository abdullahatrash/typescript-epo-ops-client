import { AxiosRequestConfig, AxiosResponse } from 'axios';
import NodeCache from 'node-cache';
import { Middleware } from './Middleware';

export interface DogpileOptions {
  cacheOptions?: NodeCache.Options;
  httpStatusCodes?: number[];
}

export class Dogpile extends Middleware {
  private cache: NodeCache;
  private httpStatusCodes: number[];

  constructor(options: DogpileOptions = {}) {
    super();
    this.cache = new NodeCache(options.cacheOptions || { stdTTL: 60 * 60 * 24 * 14 }); // 2 weeks default
    this.httpStatusCodes = options.httpStatusCodes || [200, 404, 405, 413];
  }

  private generateCacheKey(request: AxiosRequestConfig): string {
    const { method, url, params, data } = request;
    return JSON.stringify({ method, url, params, data });
  }

  async processRequest(request: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    const cacheKey = this.generateCacheKey(request);
    const cachedResponse = this.cache.get<AxiosResponse>(cacheKey);

    if (cachedResponse) {
      return Promise.reject({
        config: request,
        response: cachedResponse,
        isFromCache: true,
      });
    }

    return this.next ? this.next.processRequest(request) : request;
  }

  async processResponse(response: AxiosResponse): Promise<AxiosResponse> {
    if (this.httpStatusCodes.includes(response.status)) {
      const cacheKey = this.generateCacheKey(response.config);
      this.cache.set(cacheKey, response);
    }

    return this.next ? this.next.processResponse(response) : response;
  }
} 
