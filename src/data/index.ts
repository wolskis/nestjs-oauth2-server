export const data = {
	clients: [{
		id: 'application',	// TODO: Needed by refresh_token grant, because there is a bug at line 103 in https://github.com/oauthjs/node-oauth2-server/blob/v3.0.1/lib/grant-types/refresh-token-grant-type.js (used client.id instead of client.clientId)
		clientId: 'app1',
		clientSecret: 'secret',
		grants: [
			'password',
			'refresh_token'
		],
		redirectUris: [],
		scopes:[]
	},
    {
		clientId: 'app2',
		id: 'app2',
		clientSecret: 'secret2',
		grants: [
			'client_credentials',
            'authorization_code',
			'refresh_token'
		],
		redirectUris: ['https://google.com'],
        scopes: [
            'user.read',
            'user.write'
        ]
	}],
	tokens: [],
	users: [{
		id: 1,
		username: 'pedroetb',
		password: 'password'
	}],
    codes: []
};