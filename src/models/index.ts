export interface Client {
    id: String;
    clientId: String;
    clientSecret: String;
    grants: Array<String>;
    redirectUris: Array<String>;
    scopes: Array<String>;
    created_at?: Date;
    updated_at?: Date;
}

export interface User {
    id: Number;
    username: String;
    password?: String;
}

export interface Token {
    accessToken: String,
    accessTokenExpiresAt: Date,
    refreshToken?: String,
    refreshTokenExpiresAt?: Date,
    scope: String,
    client: Client,
    user?: User
}

export interface AuthCode {
    code: String,
    expiresAt: Date,
    scope: String,
    redirectUri: String,
    client: Client,
    user: User
}