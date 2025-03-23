export interface IStorage {
  update(service: string): Promise<void>;
  delayFor(service: string): Promise<number>;
}

export abstract class Storage implements IStorage {
  protected static readonly SERVICES = {
    images: 'images',
    inpadoc: 'inpadoc',
    other: 'other',
    retrieval: 'retrieval',
    search: 'search',
  };

  protected static readonly THROTTLE_HISTORY_WINDOW = 60; // 1 minute in seconds
  protected static readonly SERVICE_LIMITS = {
    [Storage.SERVICES.images]: 200,
    [Storage.SERVICES.inpadoc]: 60,
    [Storage.SERVICES.other]: 1000,
    [Storage.SERVICES.retrieval]: 200,
    [Storage.SERVICES.search]: 30,
  };

  abstract update(service: string): Promise<void>;
  abstract delayFor(service: string): Promise<number>;
} 
