import { Injectable } from '@nestjs/common';
import { Pool } from 'pg'
import { Client } from "oauth2-server";

interface Response {
  rows: Array<any>;
}

@Injectable()
export class ClientsService {
    private async query(q: string, v?: Array<any>): Promise<Response> {
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

    private cleanClient(client: Client) {
        // limitations of postgres case sensitivity
        client.redirectUris = client.redirecturis;
        delete client.redirecturis;

        // surely theres a better way to handle enum arrays?
        if (typeof client.grants === "string") {
            client.grants = client.grants.replace(/[{}]/g, "").split(',');
        }
        console.log(client);
        return client;
    }
    
    public async getClientById(clientId: String): Promise<Client> {
        const { rows } = await this.query(`SELECT * FROM clients WHERE clientId = '${clientId}'`);
        if (rows.length === 1){
            return this.cleanClient(rows[0]) as Client;
        }
        return null;
    }

    public async getClientByIdAndSecret(clientId: String, clientSecret: String): Promise<Client> {
        const { rows } = await this.query(`SELECT * FROM clients WHERE clientId = '${clientId}' AND clientSecret = '${clientSecret}'`);
        if (rows.length === 1){
            return this.cleanClient(rows[0]) as Client;
        }
        return null;
    }

    public async validateClient(clientId: String, redirectUri: String, scopes: Array<String>): Promise<Client> {
        const { rows } = await this.query(`SELECT * FROM clients WHERE clientId = '${clientId}'`);
        if (rows.length === 1){
            const client = rows[0];

            if(!client.redirecturis.includes(redirectUri) || !scopes.every(scope => client.scopes?.includes(scope))) {
                // todo: return an appropriate error here
                return null;
            }

            return this.cleanClient(rows[0]) as Client;
        }
        return null;
    }
}
