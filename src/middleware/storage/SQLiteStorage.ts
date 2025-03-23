import { Database } from 'sqlite3';
import { Storage } from './Storage';

export class SQLiteStorage extends Storage {
  private db: Database;

  constructor(filename: string = ':memory:') {
    super();
    this.db = new Database(filename);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS throttle_history (
          timestamp INTEGER NOT NULL,
          service TEXT NOT NULL
        )
      `);
      this.db.run('CREATE INDEX IF NOT EXISTS ix_throttle_history_service ON throttle_history(service)');
    });
  }

  async update(service: string): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - Storage.THROTTLE_HISTORY_WINDOW;

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(
          'DELETE FROM throttle_history WHERE timestamp < ?',
          [cutoff],
          (err) => {
            if (err) reject(err);
          }
        );

        this.db.run(
          'INSERT INTO throttle_history (timestamp, service) VALUES (?, ?)',
          [now, service],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    });
  }

  async delayFor(service: string): Promise<number> {
    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - Storage.THROTTLE_HISTORY_WINDOW;

    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) as request_count FROM throttle_history WHERE service = ? AND timestamp > ?',
        [service, cutoff],
        (err, row: { request_count: number }) => {
          if (err) {
            reject(err);
            return;
          }

          const limit = Storage.SERVICE_LIMITS[service as keyof typeof Storage.SERVICE_LIMITS];
          if (row.request_count >= limit) {
            // Calculate delay needed
            this.db.get(
              'SELECT MIN(timestamp) as oldest FROM throttle_history WHERE service = ? AND timestamp > ?',
              [service, cutoff],
              (err, result: { oldest: number }) => {
                if (err) {
                  reject(err);
                  return;
                }
                const delay = result.oldest + Storage.THROTTLE_HISTORY_WINDOW - now;
                resolve(Math.max(0, delay));
              }
            );
          } else {
            resolve(0);
          }
        }
      );
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
} 
