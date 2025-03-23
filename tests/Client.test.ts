import { Client, DocdbModel, EpodocModel } from '../src';
import axios, { AxiosInstance } from 'axios';
import { IndividualQuotaPerHourExceeded, RegisteredQuotaPerWeekExceeded } from '../src/exceptions/QuotaExceededError';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Client', () => {
  let client: Client;
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    // Create a mock Axios instance
    mockAxiosInstance = {
      request: jest.fn(),
      defaults: {},
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      head: jest.fn(),
      options: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>;

    // Make axios.create return our mock instance
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    
    // Mock the token request
    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: 'test-token',
        expires_in: 3600
      }
    });

    client = new Client({
      key: 'test-key',
      secret: 'test-secret'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('token management', () => {
    it('should request new token when expired', async () => {
      const mockResponse = { data: { result: 'success' } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      // First request should get token
      await client.publishedData('publication', new DocdbModel('1000000', 'EP', 'A1'));
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);

      // Second request should reuse token
      await client.publishedData('publication', new DocdbModel('1000000', 'EP', 'A1'));
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should handle hourly quota exceeded', async () => {
      mockAxiosInstance.request.mockRejectedValue({
        response: {
          status: 403,
          data: 'hourly quota exceeded'
        }
      });

      await expect(
        client.publishedData('publication', new DocdbModel('1000000', 'EP', 'A1'))
      ).rejects.toThrow(IndividualQuotaPerHourExceeded);
    });

    it('should handle weekly quota exceeded', async () => {
      mockAxiosInstance.request.mockRejectedValue({
        response: {
          status: 403,
          data: 'weekly quota exceeded'
        }
      });

      await expect(
        client.publishedData('publication', new DocdbModel('1000000', 'EP', 'A1'))
      ).rejects.toThrow(RegisteredQuotaPerWeekExceeded);
    });
  });

  describe('publishedData', () => {
    it('should make correct request with DocdbModel', async () => {
      const mockResponse = { data: { result: 'success' } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const input = new DocdbModel('1000000', 'EP', 'A1');
      const response = await client.publishedData('publication', input);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'published-data/publication/docdb/1000000.EP.A1/biblio'
        })
      );
      expect(response).toEqual(mockResponse);
    });

    it('should make correct request with EpodocModel', async () => {
      const mockResponse = { data: { result: 'success' } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const input = new EpodocModel('EP1000000');
      const response = await client.publishedData('publication', input);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'published-data/publication/epodoc/EP1000000/biblio'
        })
      );
      expect(response).toEqual(mockResponse);
    });

    it('should handle constituents parameter', async () => {
      const mockResponse = { data: { result: 'success' } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const input = new DocdbModel('1000000', 'EP', 'A1');
      await client.publishedData('publication', input, 'biblio', ['abstract', 'citations']);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: {
            constituents: 'abstract,citations'
          }
        })
      );
    });
  });

  describe('family', () => {
    it('should make correct request with DocdbModel', async () => {
      const mockResponse = { data: { result: 'success' } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const input = new DocdbModel('1000000', 'EP', 'A1');
      const response = await client.family('publication', input);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'family/publication/docdb/1000000.EP.A1'
        })
      );
      expect(response).toEqual(mockResponse);
    });

    it('should handle endpoint parameter', async () => {
      const mockResponse = { data: { result: 'success' } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const input = new DocdbModel('1000000', 'EP', 'A1');
      await client.family('publication', input, 'biblio');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'family/publication/docdb/1000000.EP.A1/biblio'
        })
      );
    });
  });

  describe('publishedDataSearch', () => {
    it('should make correct search request', async () => {
      const mockResponse = { data: { result: 'success' } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const response = await client.publishedDataSearch('ta=computer');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'published-data/search',
          params: {
            q: 'ta=computer',
            Range: '1-25'
          }
        })
      );
      expect(response).toEqual(mockResponse);
    });

    it('should handle custom range', async () => {
      const mockResponse = { data: { result: 'success' } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      await client.publishedDataSearch('ta=computer', 26, 50);

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            Range: '26-50'
          })
        })
      );
    });
  });

  describe('image', () => {
    it('should make correct image request', async () => {
      const mockResponse = { data: Buffer.from('fake-image') };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const response = await client.image('EP1000000.A1.1');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'published-data/images/EP1000000.A1.1.tiff',
          params: {
            Range: 1
          }
        })
      );
      expect(response).toEqual(mockResponse);
    });
  });

  describe('number', () => {
    it('should make correct number conversion request', async () => {
      const mockResponse = { data: { result: 'success' } };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const input = new DocdbModel('1000000', 'EP', 'A1');
      const response = await client.number('publication', input, 'epodoc');

      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'number-service/publication/docdb/1000000.EP.A1/epodoc'
        })
      );
      expect(response).toEqual(mockResponse);
    });
  });
}); 
