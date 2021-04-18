import { data } from "../data";
// import { User, Token, Client, AuthCode } from "../models";
import { Client, Token, User, AuthorizationCode, ServerOptions } from "oauth2-server";
import { Dependencies } from "@nestjs/common";
import { ClientsService } from "../clients/clients.service"
const AccessDeniedError = require('oauth2-server/lib/errors/access-denied-error');

interface ModelGeneratorType {
    init(): any
}

@Dependencies(ClientsService)
export class ModelGenerator implements ModelGeneratorType {
    constructor (
        protected clientService: ClientsService
    ) {
        this.clientService = new ClientsService;
    }

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
                let client;
                if (clientSecret) {
                    client = await this.clientService.getClientByIdAndSecret(clientId, clientSecret);
                } else {
                    client = await this.clientService.getClientById(clientId);
                }
                console.log('foo');
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

            getUser: (username, password): Promise<User> => {
                console.log('getUser');
                var users = data.users.filter(function(user) {
                    return user.username === username && user.password === password;
                });

                return Promise.resolve(users[0]);
            },

            /*
            * Method used only by client_credentials grant type.
            */

            getUserFromClient: (client): Promise<Number> => {
                console.log('getUserFromClient')
                // still not sure what this is used for, doesn't appear to return a user
                var clients = data.clients.filter(function(savedClient) {
                    return savedClient.clientId === client.clientId && savedClient.clientSecret === client.clientSecret;
                });

                return Promise.resolve(clients.length);
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
                // const client = data.clients.find(client => {
                //     const c = client.clientId === clientId;
                //     const r = !!client.redirectUris.find(uri => uri === redirectUri);
                //     const s = scopes.every(scope => client.scopes?.includes(scope))
                //     return c && r && s;
                // })
                const client = await this.clientService.validateClient(clientId, redirectUri, scopes);
                return Promise.resolve(!!client);
            },
            getAuthorizationCode: (code): Promise<AuthorizationCode> => {
                console.log('getAuthorizationCode');
                
                const storedcode = data.codes.find(x => x.authorizationCode === code);
                if (!storedcode) {
                    const err = new AccessDeniedError();
                    return Promise.reject(err);
                }
                // how to determine client and user here?
                // saved in DB with auth code?
                return Promise.resolve({
                    authorizationCode: storedcode.authorizationCode,
                    expiresAt: new Date(storedcode.expiresAt),
                    scope: storedcode.scope,
                    redirectUri: storedcode.redirectUri,
                    client: data.clients[1],
                    user: {
                        id: 1,
                        username: 'foo'
                    }
                });
            },
            revokeAuthorizationCode: (code): Promise<boolean> => {
                console.log('revokeAuthorizationCode');
                // delete code from DB here
                return Promise.resolve(true);
            },
            saveAuthorizationCode: (code, client, user): Promise<AuthorizationCode> => {
                console.log('saveAuthorizationCode');
                // save code to DB here instead of mem
                data.codes.push(code);
                // console.log(code, client, user);
                return Promise.resolve(code);
            }
        }
    }
}