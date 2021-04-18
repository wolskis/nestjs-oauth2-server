import { data } from "../data";
import { Client, Token, User, AuthorizationCode, ServerOptions } from "oauth2-server";
import { Dependencies } from "@nestjs/common";
import { ClientsService } from "../clients/clients.service";
import { AuthCodesService } from "../authcodes/authcodes.service";
import { DatabaseService } from "../database/database.service";
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
                let client: Client;
                if (clientSecret) {
                    client = await this.clientService.getClientByIdAndSecret(clientId, clientSecret);
                } else {
                    client = await this.clientService.getClientById(clientId);
                }
                return Promise.resolve(client);
            },
            saveToken: (token, client, user): Promise<Token> => {
                console.log('saveToken')
                // implement token format here
                // note: there is a bug in v3.0.1 oauth2-server where tokens are retrieved via client.id instead of client.clientId
                token.client = client;

                token.user = user || null;

                data.tokens.push(token);
                return Promise.resolve(token);
            },


            /*
            * Method used only by password grant type.
            */

            getUser: async (username, password): Promise<User> => {
                console.log('getUser');
                let user: User;
                try {
                    user = await this.usersService.getUserByCredentials(username, password);
                } catch(e) {
                    console.log(e)
                }
                return Promise.resolve(user);
            },

            /*
            * Method used only by client_credentials grant type.
            */

            getUserFromClient: async (client: Client): Promise<User> => {
                console.log('getUserFromClient')

                let user: User;
                try {
                    user = await this.usersService.getUserByClientId(client.clientid);
                } catch(e) {
                    console.log(e)
                }

                return Promise.resolve(user);
            },

            /*
            * Methods used only by refresh_token grant type.
            */

            getRefreshToken: (refreshToken): Promise<Token> => {
                console.log('getRefreshToken');
                var tokens = data.tokens.filter(function(savedToken) {
                    return savedToken.refreshToken === refreshToken;
                });

                if (!tokens.length) {
                    return;
                }

                return Promise.resolve(tokens[0]);
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