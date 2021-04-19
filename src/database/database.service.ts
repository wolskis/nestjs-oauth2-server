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
          user: 'postgres',
          host: '127.0.0.1',
          database: 'oauth',
          password: 'password',
          port: 5432,
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
