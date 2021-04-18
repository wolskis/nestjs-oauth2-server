import { data } from "../data";
import { Client, Token, User, AuthorizationCode, ServerOptions } from "oauth2-server";
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
            getAccessToken: async(token): Promise<Token> => {
                console.log('getAccessToken');
                var tokens = data.tokens.filter(function(savedToken) {
                    return savedToken.accessToken === token;
                });
                return Promise.resolve(tokens[0]);
            },
            getClient: async (clientId, clientSecret): Promise<Client> => {
                console.log('getClient')
                if (clientSecret) {
                    return this.clientService.getClientByIdAndSecret(clientId, clientSecret);
                } else {
                    return this.clientService.getClientById(clientId);
                }
            },
            saveToken: async (token, client, user): Promise<Token> => {
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


            /*
            * Method used only by password grant type.
            */

            getUser: async (username, password): Promise<User> => {
                console.log('getUser');
                return await this.usersService.getUserByCredentials(username, password);
            },

            /*
            * Method used only by client_credentials grant type.
            */

            getUserFromClient: async (client: Client): Promise<User> => {
                console.log('getUserFromClient')

                // let user: User;
                // try {
                //     user = ;
                // } catch(e) {
                //     console.log(e);
                //     Promise.reject(e);
                // }

                return this.usersService.getUserByClientId(client.clientid);
            },

            /*
            * Methods used only by refresh_token grant type.
            */

            getRefreshToken: async (refreshToken): Promise<Token> => {
                console.log('getRefreshToken');

                let token: Token;
                try {
                    token = await this.tokensService.getTokenByRefresh(refreshToken);
                } catch(e) {
                    console.log(e)
                }
                console.log(token);
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

            revokeToken: (token): Promise<boolean> => {
                console.log('revokeToken');
                data.tokens = data.tokens.filter(function(savedToken) {
                    return savedToken.refreshToken !== token.refreshToken;
                });

                var revokedTokensFound = data.tokens.filter(function(savedToken) {
                    return savedToken.refreshToken === token.refreshToken;
                });

                return Promise.resolve(!revokedTokensFound.length);
            },
            verifyScope: (token): Promise<boolean> => {
                console.log('verifyScope');
                // logic to verify scope goes here
                return Promise.resolve(true)
            },
            validateClient: async (clientId:string, redirectUri:string, scopes: Array<string>): Promise<boolean> => {
                console.log('validateClient');
                const client = await this.clientService.validateClient(clientId, redirectUri, scopes);
                return Promise.resolve(!!client);
            },
            getAuthorizationCode: async (code): Promise<Partial<AuthorizationCode>> => {
                console.log('getAuthorizationCode');
                const storedcode = await this.authcodesService.getAuthorizationCode(code);
                if (!storedcode) {
                    const err = new AccessDeniedError();
                    return Promise.reject(err);
                }
                const client = await this.clientService.getClientById(storedcode.clientid);
                const user = await this.usersService.getUserById(storedcode.userid);
                
                // use promise.all to optimise this?
                return Promise.resolve({
                    expiresAt: new Date(storedcode.expiresAt),
                    scope: storedcode.scope,
                    redirectUri: storedcode.redirectUri,
                    client,
                    user
                });
            },
            revokeAuthorizationCode: (code): Promise<boolean> => {
                console.log('revokeAuthorizationCode');
                // delete code from DB here
                return Promise.resolve(true);
            },
            saveAuthorizationCode: async (code, client, user): Promise<AuthorizationCode> => {
                console.log('saveAuthorizationCode');
                const savedCode = await this.authcodesService.saveAuthorizationCode(code, client, user);
                if (!savedCode) {
                    return Promise.reject('Could not store authorization code');
                }
                return Promise.resolve(code);
            }
        }
    }
}