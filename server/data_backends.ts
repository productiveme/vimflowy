import sqlite3, { Database, Statement } from 'better-sqlite3';

import DataBackend from '../src/shared/data_backend';

export class SQLiteBackend extends DataBackend {
  // init is basically like async constructor
  private db!: Database;
  private setStatement!: Statement;
  private getStatement!: Statement;

  private tableName: string = 'vimflowy';

  constructor() {
    super();
  }

  public async init(filename: string): Promise<void> {
    this.db = new sqlite3(filename);

    this.db.prepare(
      `CREATE TABLE IF NOT EXISTS ${this.tableName} (id string PRIMARY KEY, value string)`
    ).run()

    this.getStatement = this.db.prepare(
      `SELECT value FROM ${this.tableName} WHERE id = (?)`
    );

    this.setStatement = this.db.prepare(
      `INSERT OR REPLACE INTO ${this.tableName} ("id", "value") VALUES (?, ?)`
    );
  }

  public async get(key: string): Promise<string | null> {
    return this.getStatement.get([key]);
  }

  public async set(key: string, value: string): Promise<void> {
    this.setStatement.run([key, value]);
  }
}
