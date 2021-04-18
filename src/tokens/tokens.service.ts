import { Injectable,Inject,forwardRef } from '@nestjs/common';
import { Token } from "oauth2-server";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class TokensService {
    constructor(
        @Inject(forwardRef(() => DatabaseService))
        private databaseService: DatabaseService,
    ) {}
    
    public async getTokenByRefresh(refreshToken: String): Promise<Token> {
        console.log(`SELECT * FROM tokens WHERE refreshToken = '${refreshToken}'`);
        const { rows } = await this.databaseService.query(`SELECT * FROM tokens WHERE refreshToken = '${refreshToken}'`);
        console.log(rows);
        if (rows.length === 1){
            return rows[0] as Token;
        }
        return null;
    }

    public async saveToken(token: Token): Promise<Boolean> {
        // console.log(`SELECT * FROM tokens WHERE refreshToken = '${refreshToken}'`);
        // const { rows } = await this.databaseService.query(`SELECT * FROM tokens WHERE refreshToken = '${refreshToken}'`);
        console.log(token);
        try {
            await this.databaseService.query(
                'INSERT INTO tokens (accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt, scope, clientId, userId) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [token.accessToken, token.accessTokenExpiresAt, token.refreshToken, token.refreshTokenExpiresAt, token.scope, token.client.clientid, token.user.id]
            );
        } catch(e) {
            console.log(e);
            return e;
        }
        return true;
    }
}
