import { Injectable,Inject,forwardRef } from '@nestjs/common';
import { AuthorizationCode, Client, User } from "oauth2-server";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class UsersService {
    constructor(
        @Inject(forwardRef(() => DatabaseService))
        private databaseService: DatabaseService,
    ) {}
    
    public async getUserById(id: Number): Promise<User> {
        const { rows } = await this.databaseService.query(`SELECT id, username FROM users WHERE id = '${id}'`);
        if (rows.length === 1){
            return rows[0] as User;
        }
        return null;
    }

    public async getUserByCredentials(username: String, password: String): Promise<User> {
        const { rows } = await this.databaseService.query(`SELECT id, username FROM users WHERE username = '${username}' AND password = '${password}'`);
        if (rows.length === 1){
            return rows[0] as User;
        }
        return null;
    }

    public async getUserByClientId(clientId: String): Promise<User> {
        const { rows } = await this.databaseService.query(`SELECT id, username FROM users WHERE '${clientId}' = ANY(clients)`);
        if (rows.length === 1){
            return rows[0] as User;
        }
        return null;
    }
}
