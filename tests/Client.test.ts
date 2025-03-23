import { Client, DocdbModel, EpodocModel } from '../src';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Client', () => {
  let client: Client;

  beforeEach(() => {
    client = new Client({
      key: 'test-key',
      secret: 'test-secret'
    });

    mockedAxios.create.mockReturnValue(mockedAxios);
    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: 'test-token',
        expires_in: 3600
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('publishedData', () => {
    it('should make correct request with DocdbModel', async () => {
      const mockResponse = { data: { result: 'success' } };
      mockedAxios.request.mockResolvedValue(mockResponse);

      const input = new DocdbModel('1000000', 'EP', 'A1');
      const response = await client.publishedData('publication', input);

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'published-data/publication/docdb/1000000.EP.A1/biblio'
        })
      );
      expect(response).toEqual(mockResponse);
    });

    it('should make correct request with EpodocModel', async () => {
      const mockResponse = { data: { result: 'success' } };
      mockedAxios.request.mockResolvedValue(mockResponse);

      const input = new EpodocModel('EP1000000');
      const response = await client.publishedData('publication', input);

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'published-data/publication/epodoc/EP1000000/biblio'
        })
      );
      expect(response).toEqual(mockResponse);
    });
  });

  describe('family', () => {
    it('should make correct request with DocdbModel', async () => {
      const mockResponse = { data: { result: 'success' } };
      mockedAxios.request.mockResolvedValue(mockResponse);

      const input = new DocdbModel('1000000', 'EP', 'A1');
      const response = await client.family('publication', input);

      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'family/publication/docdb/1000000.EP.A1'
        })
      );
      expect(response).toEqual(mockResponse);
    });
  });

  describe('publishedDataSearch', () => {
    it('should make correct search request', async () => {
      const mockResponse = { data: { result: 'success' } };
      mockedAxios.request.mockResolvedValue(mockResponse);

      const response = await client.publishedDataSearch('ta=computer');

      expect(mockedAxios.request).toHaveBeenCalledWith(
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
  });
}); 
