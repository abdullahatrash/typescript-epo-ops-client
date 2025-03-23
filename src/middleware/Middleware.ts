import { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface IMiddleware {
  processRequest(request: AxiosRequestConfig): Promise<AxiosRequestConfig>;
  processResponse(response: AxiosResponse): Promise<AxiosResponse>;
  setNext(middleware: IMiddleware): IMiddleware;
}

export abstract class Middleware implements IMiddleware {
  protected next: IMiddleware | null = null;

  setNext(middleware: IMiddleware): IMiddleware {
    this.next = middleware;
    return middleware;
  }

  abstract processRequest(request: AxiosRequestConfig): Promise<AxiosRequestConfig>;
  abstract processResponse(response: AxiosResponse): Promise<AxiosResponse>;
} 
