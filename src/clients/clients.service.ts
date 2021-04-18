import { Injectable,Inject,forwardRef } from '@nestjs/common';
import { Client } from "oauth2-server";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class ClientsService {
    constructor(
        @Inject(forwardRef(() => DatabaseService))
        private databaseService: DatabaseService,
    ) {}

    private cleanClient(client: Client) {
        // limitations of postgres case sensitivity
        client.redirectUris = client.redirecturis;
        delete client.redirecturis;

        // surely theres a better way to handle enum arrays?
        if (typeof client.grants === "string") {
            client.grants = client.grants.replace(/[{}]/g, "").split(',');
        }
        return client;
    }
    
    public async getClientById(clientId: String): Promise<Client> {
        const { rows } = await this.databaseService.query(`SELECT id, clientid, grants, scopes, redirecturis FROM clients WHERE clientId = '${clientId}'`);
        if (rows.length === 1){
            return this.cleanClient(rows[0]) as Client;
        }
        return null;
    }

    public async getClientByIdAndSecret(clientId: String, clientSecret: String): Promise<Client> {
        const { rows } = await this.databaseService.query(`SELECT id, clientid, grants, scopes, redirecturis FROM clients WHERE clientId = '${clientId}' AND clientSecret = '${clientSecret}'`);
        if (rows.length === 1){
            return this.cleanClient(rows[0]) as Client;
        }
        return null;
    }

    public async validateClient(clientId: String, redirectUri: String, scopes: Array<String>): Promise<Client> {
        const { rows } = await this.databaseService.query(`SELECT id, clientid, grants, scopes, redirecturis FROM clients WHERE clientId = '${clientId}'`);
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
