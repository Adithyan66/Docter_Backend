import { injectable, inject } from 'tsyringe';
import { Env } from '../env';

export interface BackupResult {
  key: string;
  tableCount: number;
  rowCount: number;
  bytes: number;
}

/**
 * Exports every D1 table to a portable JSON snapshot in R2. Complements D1 Time
 * Travel (30-day point-in-time recovery) with offsite, restorable dumps.
 */
@injectable()
export class D1BackupService {
  constructor(@inject('Env') private readonly env: Env) {}

  async run(now: Date): Promise<BackupResult> {
    const db = this.env.DB;

    const tableRes = await db
      .prepare(
        `SELECT name FROM sqlite_master
         WHERE type='table'
           AND name NOT LIKE 'sqlite_%'
           AND name NOT LIKE '_cf_%'
           AND name NOT LIKE 'd1_%'
         ORDER BY name`
      )
      .all<{ name: string }>();
    const tables = tableRes.results.map((r) => r.name);

    const snapshot: { version: number; createdAt: string; tables: Record<string, unknown[]> } = {
      version: 1,
      createdAt: now.toISOString(),
      tables: {},
    };

    let rowCount = 0;
    for (const table of tables) {
      const res = await db.prepare(`SELECT * FROM "${table}"`).all();
      snapshot.tables[table] = res.results;
      rowCount += res.results.length;
    }

    const body = JSON.stringify(snapshot);
    const month = now.toISOString().slice(0, 7);
    const key = `backups/${month}/backup-${now.toISOString().replace(/[:.]/g, '-')}.json`;

    await this.env.MEDIA.put(key, body, {
      httpMetadata: { contentType: 'application/json' },
    });

    return { key, tableCount: tables.length, rowCount, bytes: body.length };
  }
}
