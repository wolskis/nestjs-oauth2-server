import { data } from "../data"
const AccessDeniedError = require('oauth2-server/lib/errors/access-denied-error');

/**
 * Dump the memory storage content (for debug).
 */

var dump = function() {
	console.log(data);
};


// TODO must typecase promise returns

export const oauth2Model = {
    getAccessToken: async(token): Promise<any> => {
        
        var tokens = data.tokens.filter(function(savedToken) {
            return savedToken.accessToken === token;
        });

        return Promise.resolve(tokens[0]);
    },
    getClient: (clientId, clientSecret): Promise<any> => {
        let client;
        if (clientSecret) {
            client = data.clients.find(client => client.clientId === clientId && client.clientSecret === clientSecret);
        } else {
            client = data.clients.find(client => client.clientId === clientId);
        }
        return Promise.resolve(client);
    },
    saveToken: (token, client, user): Promise<any> => {

        token.client = {
            id: client.clientId
        };

        token.user = {
            username: user.username
        };

        data.tokens.push(token);

        return Promise.resolve(token);
    },


    /*
    * Method used only by password grant type.
    */

    getUser: (username, password): Promise<any> => {

        var users = data.users.filter(function(user) {
            return user.username === username && user.password === password;
        });

        return Promise.resolve(users[0]);
    },

    /*
    * Method used only by client_credentials grant type.
    */

    getUserFromClient: (client): Promise<Number> => {

        var clients = data.clients.filter(function(savedClient) {
            return savedClient.clientId === client.clientId && savedClient.clientSecret === client.clientSecret;
        });

        return Promise.resolve(clients.length);
    },

    /*
    * Methods used only by refresh_token grant type.
    */

    getRefreshToken: (refreshToken): Promise<any> => {

        var tokens = data.tokens.filter(function(savedToken) {
            return savedToken.refreshToken === refreshToken;
        });

        if (!tokens.length) {
            return;
        }

        return Promise.resolve(tokens[0]);
    },

    revokeToken: (token): Promise<boolean> => {

        data.tokens = data.tokens.filter(function(savedToken) {
            return savedToken.refreshToken !== token.refreshToken;
        });

        var revokedTokensFound = data.tokens.filter(function(savedToken) {
            return savedToken.refreshToken === token.refreshToken;
        });

        return Promise.resolve(!revokedTokensFound.length);
    },
    verifyScope: (token): Promise<boolean> => {
        // logic to verify scope goes here
        return Promise.resolve(true)
    },
    validateClient: async (clientId:string, redirectUri:string, scopes: Array<string>): Promise<boolean> => {
        const client = data.clients.find(client => {
            const c = client.clientId === clientId;
            const r = !!client.redirectUris.find(uri => uri === redirectUri);
            const s = scopes.every(scope => client.scopes?.includes(scope))
            return c && r && s;
        })
        return Promise.resolve(!!client);
    },
    getAuthorizationCode: (code): Promise<any> => {
        // typecast this to code object
        
        const storedcode = data.codes.find(x => x.authorizationCode === code);
        if (!storedcode) {
            const err = new AccessDeniedError();
            return Promise.reject(err);
        }
        // how to determine client and user here?
        // saved in DB with auth code?
        return Promise.resolve({
            code: storedcode.authorizationCode,
            expiresAt: new Date(storedcode.expiresAt),
            scope: storedcode.scope,
            redirectUri: storedcode.redirectUri,
            client: {
                ...data.clients[1],
                id: data.clients[1].clientId
            },
            user: {
                id: 1
            }
        });
    },
    revokeAuthorizationCode: (code): Promise<boolean> => {
        // delete code from DB here
        return Promise.resolve(true);
    },
    saveAuthorizationCode: (code, client, user): Promise<any> => {
        // save code to DB here instead of mem
        data.codes.push(code);
        // console.log(code, client, user);
        return Promise.resolve(code);
    },
}
