import { AuthorizationCode, Client, User } from "oauth2-server";

export const client: Client = {
    id: '2',
    clientid: '14e27f24-b935-4f4b-8493-73b8f10f0dab',
    grants: [ 'client_credentials', 'authorization_code', 'refresh_token' ],
    scopes: [ 'user.read', 'user.write' ],
    redirecturis: [ 'https://google.com' ]
}
export const user: User = { id: 1, username: 'joebloggs' }

export const authcode: AuthorizationCode = {
    authorizationCode: '70b092d9e1bf25eb20727212a8149ce67017e80b',
    expiresAt: new Date('2021-04-21T02:20:07.854Z'),
    redirectUri: 'https://google.com',
    scope: 'user.read',
    client,
    user
}

export const dbAuthCode = {
    id: 4,
    code: 'd9524def3dfdd46fa6cac54b8b64d0088ff21013',
    expiresat: new Date('2021-04-21T02:29:14.392Z'),
    scope: 'true',
    redirecturi: 'https://google.com',
    clientid: '14e27f24-b935-4f4b-8493-73b8f10f0dab',
    userid: 1
}

export const token = {
    accessToken: '0adab8058775373c32d84a4a7faceb6bca104a0e',
    authorizationCode: undefined,
    accessTokenExpiresAt: new Date('2021-04-22T07:33:38.875Z'),
    refreshToken: '2dcd1cc8e88468ee7f55d739be2aba4aaf4f735e',
    refreshTokenExpiresAt: new Date('2021-05-06T06:33:38.875Z'),
    scope: [ 'user.read', 'user.write' ],
    client,
    user
}

export default { authcode, client, user, dbAuthCode, token }
