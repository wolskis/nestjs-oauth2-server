import { Client, Token, User, AuthorizationCode, ServerOptions, AuthorizationCodeModel } from "oauth2-server";
import { Dependencies } from "@nestjs/common";
import { ClientsService } from "../services/clients/clients.service";
import { AuthCodesService } from "../services/authcodes/authcodes.service";
import { DatabaseService } from "../services/database/database.service";
import { TokensService } from "../services/tokens/tokens.service";
import { UsersService } from "../services/users/users.service";
const AccessDeniedError = require('oauth2-server/lib/errors/access-denied-error');
const InvalidTokenError = require('oauth2-server/lib/errors/invalid-token-error');
const jwt = require('jsonwebtoken');

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
            generateAccessToken: async(client: Client, user: User, scope: string): Promise<string> => {
                console.log('generateAccessToken');
                const exp = Math.floor(Date.now() / 1000) + (parseInt(process.env.TOKEN_TTL) || 3600);
                return jwt.sign({
                    iss: process.env.ISSUER,
                    sub: user.id,
                    aud: client.id, 
                    scope,
                    exp
                }, process.env.JWT_SECRET)
            },
            getAccessToken: async(token: string): Promise<Token> => {
                console.log('getAccessToken');
                const retrievedToken = await this.tokensService.getTokenByToken(token);
                if (!retrievedToken) {
                    const err = new InvalidTokenError();
                    err.message = 'Invalid access token';
                    return Promise.reject(err);
                }
                const client = await this.clientService.getClientById(retrievedToken.clientid);
                const user = await this.usersService.getUserById(retrievedToken.userid);
                // use promise.all to optimise this?
                return Promise.resolve({
                    id: retrievedToken.id,
                    accessToken: retrievedToken.accesstoken,
                    accessTokenExpiresAt: retrievedToken.accesstokenexpiresat,
                    refreshToken: retrievedToken.refreshtoken,
                    refreshTokenExpiresAt: retrievedToken.refreshtokenexpiresat,
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
            getClient: async (clientId: string, clientSecret?: string): Promise<Client> => {
                console.log('getClient')
                if (clientSecret) {
                    return this.clientService.getClientByIdAndSecret(clientId, clientSecret);
                } else {
                    const client = await this.clientService.getClientById(clientId)
                    return client;
                }
            },
            getRefreshToken: async (refreshToken: string): Promise<Token> => {
                console.log('getRefreshToken');
                const token: Token = await this.tokensService.getTokenByRefresh(refreshToken);
                if (!token) {
                    const err = new InvalidTokenError();
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
                // there's a bug in oauth2-server where scopes is returned here as an array of 1 string
                const client = await this.clientService.validateClient(clientId, redirectUri, scopes[0].split(' '));
                return Promise.resolve(!!client);
            },
            validateScope: async (user:User, client: Client, scope: Array<string>|string): Promise<Array<string>> => {
                console.log('validateScope');
                // oauth2-server handles this totally inconsistently
                // password/client_creds flows, scope is undefined
                // authorize flows, scope is an array of strings
                // authorization_code flow, scope is a string

                let s: Array<string>;
                
                if (typeof scope === 'string') {
                    // if scope is a string, convert to array and compare against values on client registration
                    s = scope.split(' ').every(scope => client.scopes.includes(scope)) ? scope.split(' ') : undefined;
                } else if (Array.isArray(scope)) {
                    // if scope is array, compare against values on client registration
                    s = scope.every(scope => client.scopes.includes(scope)) ? scope : undefined;
                } else {
                    // if scope is undefined, return all client scopes
                    s = client.scopes;
                }

                // logic to verify scope goes here
                return Promise.resolve(s);
            },
            verifyScope: (token: Token, scope: string): Promise<boolean> => {
                console.log('verifyScope');
                // logic to verify scope goes here
                return Promise.resolve(true)
            }
        }
    }
}