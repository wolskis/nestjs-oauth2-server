import { Injectable,Inject,forwardRef } from '@nestjs/common';
import { AuthorizationCode, Client, User } from "oauth2-server";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class AuthCodesService {
    constructor(
        @Inject(forwardRef(() => DatabaseService))
        private databaseService: DatabaseService,
    ) {}

    private cleanAuthCode(code: AuthorizationCode) {
        // console.log(code);
        return code;
    }

    public async saveAuthorizationCode(code: AuthorizationCode, client:Client, user:User): Promise<boolean> {   
        try {
            await this.databaseService.query(
                'INSERT INTO authcodes (code, expiresAt, scope, redirectUri, clientId, userId) VALUES ($1, $2, $3, $4, $5, $6)',
                [code.authorizationCode, code.expiresAt, code.scope, code.redirectUri, client.clientid, user.id]
            );
        } catch(e) {
            console.log(e);
            return e;
        }
        return true;
    }
    
    public async getAuthorizationCode(code: String): Promise<AuthorizationCode> {
        const { rows } = await this.databaseService.query(`SELECT * FROM authcodes WHERE code = '${code}'`);
        if (rows.length === 1){
            return this.cleanAuthCode(rows[0]) as AuthorizationCode;
        }
        return null;
    }

    public async deleteAuthorizationCode(code: String): Promise<boolean> {
        try {    
            await this.databaseService.query(`DELETE FROM authcodes WHERE code = '${code}'`);
        } catch(e) {
            console.log(e);
            return e;
        }
        return true;
    }
}
