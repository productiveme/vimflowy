import { Client } from './../node_modules/@types/pg/index.d';
import { Client as PGClient } from 'pg';
import sqlite3, { Database, Statement } from 'better-sqlite3';

import DataBackend from '../src/shared/data_backend';

export class SQLiteBackend extends DataBackend {
  // init is basically like async constructor
  private db!: Database;
  private setStatement!: Statement;
  private getStatement!: Statement;

  private tableName: string = 'vimflowy';

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

export class PostgresBackend extends DataBackend {
  private db!: Client;
  private setStatement!: string;
  private getStatement!: string;

  private tableName: string = 'vimflowy';

  public async init(connectionString: string): Promise<void> {
    console.log({connectionString})
    this.db = new PGClient({ connectionString });

    await this.db.query(
      `CREATE TABLE IF NOT EXISTS ${this.tableName} (id text PRIMARY KEY, value text)`
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