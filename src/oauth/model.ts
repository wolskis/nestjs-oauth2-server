import { Client, Token, User, AuthorizationCode, ServerOptions, AuthorizationCodeModel } from "oauth2-server";
import { Dependencies } from "@nestjs/common";
import { ClientsService } from "../clients/clients.service";
import { AuthCodesService } from "../authcodes/authcodes.service";
import { DatabaseService } from "../database/database.service";
import { TokensService } from "../tokens/tokens.service";
import { UsersService } from "../users/users.service";
const AccessDeniedError = require('oauth2-server/lib/errors/access-denied-error');

interface ModelGeneratorType {
    init(): ServerOptions["model"]
}

@Dependencies(ClientsService)
export class ModelGenerator implements ModelGeneratorType {

    private databaseInstance = new DatabaseService;
    private clientService = new ClientsService(this.databaseInstance);
    private authcodesService = new AuthCodesService(this.databaseInstance);
    private usersService = new UsersService(this.databaseInstance);
    private tokensService = new TokensService(this.databaseInstance);

    public init() {
        return {
            getAccessToken: async(token: string): Promise<Token> => {
                console.log('getAccessToken');
                const retrievedToken = await this.tokensService.getTokenByToken(token);
                const client = await this.clientService.getClientById(retrievedToken.clientid);
                const user = await this.usersService.getUserById(retrievedToken.userid);
                // clean up redundancy
                delete retrievedToken.clientid, retrievedToken.userid;
                // use promise.all to optimise this?
                return Promise.resolve({
                    ...retrievedToken,
                    id: retrievedToken.id,
                    accessToken: retrievedToken.accesstoken,
                    accessTokenExpiresAt: retrievedToken.accesstokenexpiresat,
                    refreshToken: retrievedToken.refreshtoken,
                    refreshTokenExpiresAt: retrievedToken.retrievedtokenexpiresat,
                    scope: retrievedToken.scope,
                    client,
                    user
                });
            },
            getAuthorizationCode: async (code: string): Promise<Partial<AuthorizationCode>> => {
                console.log('getAuthorizationCode');
                const storedcode = await this.authcodesService.getAuthorizationCode(code);
                if (!storedcode) {
                    const err = new AccessDeniedError();
                    err.message = 'Invalid authorization code';
                    return Promise.reject(err);
                }
                const client = await this.clientService.getClientById(storedcode.clientid);
                const user = await this.usersService.getUserById(storedcode.userid);
                // use promise.all to optimise this?
                return Promise.resolve({
                    code: storedcode.code,
                    expiresAt: storedcode.expiresat,
                    scope: storedcode.scope,
                    redirectUri: storedcode.redirecturi,
                    client,
                    user
                });
            },
            getClient: async (clientId: string, clientSecret: string): Promise<Client> => {
                console.log('getClient')
                if (clientSecret) {
                    return this.clientService.getClientByIdAndSecret(clientId, clientSecret);
                } else {
                    return this.clientService.getClientById(clientId);
                }
            },
            getRefreshToken: async (refreshToken: string): Promise<Token> => {
                console.log('getRefreshToken');
                const token: Token = await this.tokensService.getTokenByRefresh(refreshToken);
                if (!token) {
                    const err = new AccessDeniedError();
                    err.message = 'Invalid refresh token';
                    return Promise.reject(err);
                }
                const client = await this.clientService.getClientById(token.clientid);
                const user = await this.usersService.getUserById(token.userid);
                // clean up redundancy
                delete token.clientid, token.userid;
                // use promise.all to optimise this?
                return Promise.resolve({
                    ...token,
                    client,
                    user
                });
            },
            getUser: async (username: string, password: string): Promise<User> => {
                console.log('getUser');
                return await this.usersService.getUserByCredentials(username, password);
            },
            getUserFromClient: async (client: Client): Promise<User> => {
                console.log('getUserFromClient')
                return this.usersService.getUserByClientId(client.clientid);
            },
            revokeAuthorizationCode: (code: AuthorizationCode): Promise<boolean> => {
                console.log('revokeAuthorizationCode');
                return this.authcodesService.deleteAuthorizationCode(code.code);
            },
            revokeToken: (token: Token): Promise<boolean> => {
                console.log('revokeToken');
                console.log(token);
                return this.tokensService.deleteTokenByToken(token.accesstoken);
            },
            saveAuthorizationCode: async (code: AuthorizationCode, client: Client, user: User): Promise<AuthorizationCode> => {
                console.log('saveAuthorizationCode');
                const savedCode = await this.authcodesService.saveAuthorizationCode(code, client, user);
                if (!savedCode) {
                    return Promise.reject('Could not store authorization code');
                }
                return Promise.resolve(code);
            },
            saveToken: async (token: Token, client: Client, user: User): Promise<Token> => {
                console.log('saveToken')
                // implement token format here
                // note: there is a bug in v3.0.1 oauth2-server where tokens are retrieved via client.id instead of client.clientId
                token.client = client;

                token.user = user || null;

                try {
                    await this.tokensService.saveToken(token);
                } catch(e) {
                    console.log(e)
                }
                return Promise.resolve(token);
            },
            validateClient: async (clientId:string, redirectUri:string, scopes: Array<string>): Promise<boolean> => {
                console.log('validateClient');
                const client = await this.clientService.validateClient(clientId, redirectUri, scopes);
                return Promise.resolve(!!client);
            },
            validateScope: (token: Token): Promise<boolean> => {
                console.log('verifyScope');
                // logic to verify scope goes here
                return Promise.resolve(true)
            },
            verifyScope: (token: Token): Promise<boolean> => {
                console.log('verifyScope');
                // logic to verify scope goes here
                return Promise.resolve(true)
            }
        }
    }
}