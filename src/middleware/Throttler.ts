import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Middleware } from './Middleware';
import { IStorage } from './storage/Storage';
import { SQLiteStorage } from './storage/SQLiteStorage';

export class Throttler extends Middleware {
  private storage: IStorage;

  constructor(storage?: IStorage) {
    super();
    this.storage = storage || new SQLiteStorage();
  }

  private getServiceFromUrl(url: string): string {
    if (url.includes('/images')) return 'images';
    if (url.includes('/family')) return 'inpadoc';
    if (url.includes('/published-data/search')) return 'search';
    if (url.includes('/published-data')) return 'retrieval';
    return 'other';
  }

  async processRequest(request: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    const service = this.getServiceFromUrl(request.url || '');
    const delay = await this.storage.delayFor(service);
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
    }

    await this.storage.update(service);
    return this.next ? this.next.processRequest(request) : request;
  }

  async processResponse(response: AxiosResponse): Promise<AxiosResponse> {
    return this.next ? this.next.processResponse(response) : response;
  }
} 
