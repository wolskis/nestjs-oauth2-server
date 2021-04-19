import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

interface Response {
    rows: Array<any>;
}

@Injectable()
export class DatabaseService {
    public async query(q: string, v?: Array<any>): Promise<Response> {
        // TODO: swap this for env vars
        const pool = await new Pool({
          user: process.env.DB_USER || 'postgres',
          host: process.env.DB_HOST || '127.0.0.1',
          database: process.env.DB_NAME || 'oauth',
          password: process.env.DB_PASSWORD || 'password',
          port: parseInt(process.env.DB_PORT, 10) || 5432
        })
        const client = await pool.connect()
        let res
        try {
          try {
            res = await client.query({text: q, values: v})
          } catch (err) {
            throw err
          }
        } finally {
          client.release()
        }
        return res
    }
}
