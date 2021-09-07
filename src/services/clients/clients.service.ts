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
        if (!client.redirectUris && !!client.redirecturis){
            client.redirectUris = client.redirecturis;
            delete client.redirecturis;
        }

        // surely theres a better way to handle enum arrays?
        if (typeof client.grants === "string") {
            client.grants = client.grants.replace(/[{}]/g, "").split(',');
        }
        return client;
    }
    
    public async getClientById(clientId: String): Promise<Client> {
        const { rows } = await this.databaseService.query(`SELECT id, name, clientid, grants, scopes, redirecturis FROM clients WHERE clientId = '${clientId}'`);
        if (rows.length === 1){
            return this.cleanClient(rows[0]) as Client;
        }
        return null;
    }

    public async getClientByIdAndSecret(clientId: String, clientSecret: String): Promise<Client> {
        const { rows } = await this.databaseService.query(`SELECT id, name, clientid, grants, scopes, redirecturis FROM clients WHERE clientId = '${clientId}' AND clientSecret = '${clientSecret}'`);
        if (rows.length === 1){
            return this.cleanClient(rows[0]) as Client;
        }
        return null;
    }

    public async validateClient(clientId: String, redirectUri: string, scopes: Array<String>): Promise<Client> {
        const { rows } = await this.databaseService.query(`SELECT id, name, clientid, grants, scopes, redirecturis FROM clients WHERE clientId = '${clientId}'`);
        if (rows.length === 1){
            const client = this.cleanClient(rows[0]) as Client;
            if(client.redirectUris.length <= 0 || !client.redirectUris.includes(redirectUri) || !scopes.every(scope => client.scopes?.includes(scope))) {
                // todo: return an appropriate error here
                return null;
            }

            return client;
        }
        return null;
    }
}
