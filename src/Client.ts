import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { DocdbModel } from './models/DocdbModel';
import { EpodocModel } from './models/EpodocModel';
import { IMiddleware } from './middleware/Middleware';
import { Throttler } from './middleware/Throttler';
import { IndividualQuotaPerHourExceeded, RegisteredQuotaPerWeekExceeded } from './exceptions/QuotaExceededError';

export interface ClientConfig {
  key: string;
  secret: string;
  middlewares?: IMiddleware[];
  acceptType?: string;
}

export class Client {
  private static readonly BASE_URL = 'https://ops.epo.org/3.2/rest-services';
  private static readonly TOKEN_URL = 'https://ops.epo.org/3.2/auth/accesstoken';
  private axiosInstance: AxiosInstance;
  private middlewares: IMiddleware[];
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private config: ClientConfig) {
    this.middlewares = config.middlewares || [new Throttler()];
    this.axiosInstance = axios.create({
      baseURL: Client.BASE_URL,
      headers: {
        'Accept': config.acceptType || 'application/json',
      },
    });

    // Chain middlewares
    for (let i = 0; i < this.middlewares.length - 1; i++) {
      this.middlewares[i].setNext(this.middlewares[i + 1]);
    }
  }

  private async ensureValidToken(): Promise<void> {
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return;
    }

    const response = await axios.post(
      Client.TOKEN_URL,
      'grant_type=client_credentials',
      {
        auth: {
          username: this.config.key,
          password: this.config.secret,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    this.token = response.data.access_token;
    this.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);
  }

  private async request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    await this.ensureValidToken();
    
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${this.token}`,
    };

    try {
      let currentConfig = config;
      for (const middleware of this.middlewares) {
        currentConfig = await middleware.processRequest(currentConfig);
      }

      const response = await this.axiosInstance.request(currentConfig);

      let currentResponse = response;
      for (const middleware of this.middlewares.reverse()) {
        currentResponse = await middleware.processResponse(currentResponse);
      }

      return currentResponse;
    } catch (error: any) {
      if (error.response?.status === 403) {
        if (error.response.data.includes('hourly')) {
          throw new IndividualQuotaPerHourExceeded();
        } else if (error.response.data.includes('weekly')) {
          throw new RegisteredQuotaPerWeekExceeded();
        }
      }
      throw error;
    }
  }

  async publishedData(
    referenceType: 'publication' | 'application' | 'priority',
    input: DocdbModel | EpodocModel,
    endpoint: string = 'biblio',
    constituents: string[] = []
  ): Promise<AxiosResponse> {
    const inputType = input instanceof DocdbModel ? 'docdb' : 'epodoc';
    const path = `published-data/${referenceType}/${inputType}/${input.toString()}/${endpoint}`;
    
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: path,
    };

    if (constituents.length > 0) {
      config.params = { constituents: constituents.join(',') };
    }

    return this.request(config);
  }

  async family(
    referenceType: 'publication' | 'application' | 'priority',
    input: DocdbModel | EpodocModel,
    endpoint?: string,
    constituents: string[] = []
  ): Promise<AxiosResponse> {
    const inputType = input instanceof DocdbModel ? 'docdb' : 'epodoc';
    let path = `family/${referenceType}/${inputType}/${input.toString()}`;
    
    if (endpoint) {
      path += `/${endpoint}`;
    }

    const config: AxiosRequestConfig = {
      method: 'GET',
      url: path,
    };

    if (constituents.length > 0) {
      config.params = { constituents: constituents.join(',') };
    }

    return this.request(config);
  }

  async publishedDataSearch(
    cql: string,
    rangeBegin: number = 1,
    rangeEnd: number = 25,
    constituents: string[] = []
  ): Promise<AxiosResponse> {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: 'published-data/search',
      params: {
        q: cql,
        Range: `${rangeBegin}-${rangeEnd}`,
      },
    };

    if (constituents.length > 0) {
      config.params.constituents = constituents.join(',');
    }

    return this.request(config);
  }

  async image(
    path: string,
    range: number = 1,
    extension: string = 'tiff'
  ): Promise<AxiosResponse> {
    return this.request({
      method: 'GET',
      url: `published-data/images/${path}.${extension}`,
      params: { Range: range },
    });
  }

  async number(
    referenceType: 'publication' | 'application' | 'priority',
    input: DocdbModel | EpodocModel,
    outputFormat: 'docdb' | 'epodoc'
  ): Promise<AxiosResponse> {
    const inputType = input instanceof DocdbModel ? 'docdb' : 'epodoc';
    return this.request({
      method: 'GET',
      url: `number-service/${referenceType}/${inputType}/${input.toString()}/${outputFormat}`,
    });
  }
} 
