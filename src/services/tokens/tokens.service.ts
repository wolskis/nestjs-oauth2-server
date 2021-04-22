import { Injectable,Inject,forwardRef } from '@nestjs/common';
import { Token } from "oauth2-server";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class TokensService {
    constructor(
        @Inject(forwardRef(() => DatabaseService))
        private databaseService: DatabaseService,
    ) {}

    private cleanToken(token: Token) {
        // surely theres a better way to handle enum arrays?
        if (typeof token.scope === "string") {
            token.scope = token.scope.replace(/[{}"]/g, "").split(',');
        }
        return token;
    }
    
    public async getTokenByRefresh(refreshToken: String): Promise<Token> {
        const { rows } = await this.databaseService.query(`SELECT * FROM tokens WHERE refreshToken = '${refreshToken}'`);
        if (rows.length === 1){
            return this.cleanToken(rows[0]) as Token;
        }
        return null;
    }

    public async getTokenByToken(token: string): Promise<Token> {
        const { rows } = await this.databaseService.query(`SELECT * FROM tokens WHERE accessToken = '${token}'`);
        if (rows.length === 1){
            return this.cleanToken(rows[0]) as Token;
        }
        return null;
    }

    public async deleteTokenByRefresh(refreshToken: String): Promise<boolean> {
        try {    
            await this.databaseService.query(`DELETE FROM tokens WHERE refreshToken = '${refreshToken}'`);
        } catch(e) {
            console.log(e);
            return e;
        }
        return true;
    }

    public async deleteTokenByToken(token: string): Promise<boolean> {
        try {    
            await this.databaseService.query(`DELETE FROM tokens WHERE accessToken = '${token}'`);
        } catch(e) {
            console.log(e);
            return e;
        }
        return true;
    }

    public async saveToken(token: Token): Promise<boolean> {
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
