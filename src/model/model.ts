import { data } from "../data"
 

/**
 * Dump the memory storage content (for debug).
 */

var dump = function() {
	console.log(data);
};

/*
 * Methods used by all grant types.
 */


// TODO must typecase promise returns

export const oauth2Model = {
    getAccessToken: async(token): Promise<any> => {
        
        var tokens = data.tokens.filter(function(savedToken) {
            return savedToken.accessToken === token;
        });

        return Promise.resolve(tokens[0]);
    },
    getClient: (clientId, clientSecret): Promise<any> => {
        console.log(clientId, clientSecret);
        // const client = data.clients.find(client => client.clientId === clientId && client.clientSecret === clientSecret);
        const client = data.clients.find(client => client.clientId === clientId);
        console.log(client);
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
    getAuthorizationCode: (clientId, clientSecret): Promise<any> => {
        console.log('get auth code');
        console.log(clientId, clientSecret);
        const client = data.clients.find(client => client.clientId === clientId);
 
        return Promise.resolve(client);
    },
    generateAuthorizationCode: (): Promise<any> => {
        return Promise.resolve('a0c32560-5243-6ba8-e09e-39603d37f81a')
    },
    revokeAuthorizationCode: (code): Promise<boolean> => {
        console.log('revoke auth code');
        console.log(code);
        return Promise.resolve(true)
    },
    saveAuthorizationCode: (code, client, user): Promise<boolean> => {
        // console.log('save auth code');
        // console.log(code, client, user);
        return Promise.resolve(code);
    },
}
