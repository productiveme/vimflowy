import { Client } from './../node_modules/@types/pg/index.d';
import sqlite3, { Database, Statement } from 'better-sqlite3';
import { Client as PGClient } from 'pg';

import DataBackend from '../src/shared/data_backend';

export class SQLiteBackend extends DataBackend {
  // init is basically like async constructor
  private db!: sqlite.Database;
  private setStatement!: sqlite.Statement;
  private getStatement!: sqlite.Statement;

  private tableName: string = 'vimflowy';

  constructor() {
    super();
  }

  public async init(filename: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.db = new sqlite.Database(filename, (err) => {
        if (err) { reject(err); } else { resolve(); }
      });
    });

    await new Promise<void>((resolve, reject) => {
      this.db.run(
        `CREATE TABLE IF NOT EXISTS ${this.tableName} (id string PRIMARY KEY, value string)`,
        (err) => {
          if (err) { reject(err); } else { resolve(); }
        }
      );
    });

    this.getStatement = this.db.prepare(
      `SELECT value FROM ${this.tableName} WHERE id = (?)`
    );

    this.setStatement = this.db.prepare(
      `INSERT OR REPLACE INTO ${this.tableName} ("id", "value") VALUES (?, ?)`
    );
  }

  public async get(key: string): Promise<string | null> {
    return await new Promise<string | null>((resolve, reject) => {
      this.getStatement.get([key], (err: string, result: any) => {
        if (err) { return reject(err); }
        if (!result) {
          resolve(null);
        } else {
          resolve(result.value);
        }
      });
    });
  }

  public async set(key: string, value: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.setStatement.run([key, value], (err: string) => {
        if (err) { return reject(err); }
        resolve();
      });
    });
  }
}

export class PostgresBackend extends DataBackend {
  private db!: Client;
  private setStatement!: string;
  private getStatement!: string;

  private tableName: string = 'vimflowy';

  constructor() {
    super();
  }

  public async init(connectionString): Promise<void> {
    this.db = new PGClient({ connectionString });

    await this.db.query(
      `CREATE TABLE IF NOT EXISTS ${this.tableName} (id string PRIMARY KEY, value string)`
    );

    this.getStatement = `SELECT value FROM ${this.tableName} WHERE id = ($1::text)`;
    this.setStatement = `INSERT OR REPLACE INTO ${this.tableName} ("id", "value") VALUES ($1::text, $2::text)`;
  }

  public async get(key: string): Promise<string | null> {
    const { rows: [ { value } ] } = await this.db.query(this.getStatement, [key]);
    return value;
  }

  public async set(key: string, value: string): Promise<void> {
    await this.db.query(this.setStatement, [key, value]);
  }
}