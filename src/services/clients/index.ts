import { Pool } from 'pg'

interface Response {
  rows: Array<any>;
}

export interface Client {
  id: Number;
  first_name: String;
  last_name: String;
  email: String;
  updated_at: Date;
  created_at: Date;
  password?: String;
}

export default class ClientService {
  private async query(q: string, v?: Array<any>): Promise<Response> {
    const pool = await new Pool({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'names',
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

  public async getUserByEmail(email: String): Promise<Client> {
    const { rows } = await this.query(`SELECT * FROM clients WHERE email = '${email}'`);
    if (rows.length === 1){
      return rows[0] as Client;
    }
    return null;
  }
}