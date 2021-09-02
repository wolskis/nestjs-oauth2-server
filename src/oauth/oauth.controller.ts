import { Controller, Get, Post, Query, Redirect, Req, Res } from '@nestjs/common';
import * as OAuth2Server from "oauth2-server";
import { validate as uuidValidate } from 'uuid';
import utils from "../../utils"
import { ModelGenerator } from "./model";

const model = new ModelGenerator().init()

const accessTokenLifetime = parseInt(process.env.TOKEN_TTL) || 3600;

const oauth2Server = new OAuth2Server({
    model,
    accessTokenLifetime,
	allowBearerTokensInQueryString: false
});

@Controller('oauth')
export class OauthController {
    @Get('token')
    get(): string {
        return 'this would be a front end login page to kickstart auth process usually';
    }

    @Post('token')
    accessToken(@Req() req, @Res() res) {
        const request = new OAuth2Server.Request(req);
        const response = new OAuth2Server.Response(res);

        const query = req.body;

        // check redirect_uri
        if (query.redirect_uri && !utils.validURL(query.redirect_uri)) {
            res.status(400).json({
                message: 'Invalid redirect uri input, must be valid URL.'
            });
            return
        }

        // check scope
        if (query.scope && !utils.validScope(query.scope)) {
            res.status(400).json({
                message: 'Invalid scope, must be alphanumeric, dash, underscore or dot.'
            });
            return
        }

        // check auth code string
        if (query.code && !utils.validCodeOrToken(query.code)) {
            res.status(400).json({
                message: 'Invalid redirect authorization code.'
            });
            return
        }

        // check refresh token string
        if (query.refresh_token && !utils.validCodeOrToken(query.refresh_token)) {
            res.status(400).json({
                message: 'Invalid refresh token input.'
            });
            return
        }

        // check grant type string
        if (query.grant_type && !utils.validGrantType(query.grant_type)) {
            res.status(400).json({
                message: 'Invalid grant type.'
            });
            return
        }

        // check client ID
        if (query.client_id && !uuidValidate(query.client_id)) {
            res.status(400).json({
                message: 'Invalid client ID, must be UUID v4'
            });
            return
        }

        // check grant type string
        if (query.client_secret && !utils.validAlphanumeric(query.client_secret)) {
            res.status(400).json({
                message: 'Invalid client secret string.'
            });
            return
        }

        return oauth2Server.token(request, response)
            .then((token: OAuth2Server.Token) => {
                res.status(200).json({
                    access_token: token.accessToken,
                    ...(token.refreshToken && {refresh_token: token.refreshToken}),
                    expiry: accessTokenLifetime
                });
            }).catch((err: any) => {
                console.log(err);
                res.status(err.code || 500).json(err);
            });

    }
 
    @Post('authorize')
    async redirect(@Req() req, @Query() query, @Res() res, ) {
        const request = new OAuth2Server.Request(req);
        const response = new OAuth2Server.Response(res);
        // should include a csrf token
        if (!query || !query.client_id || !query.redirect_uri || !query.scope || !query.response_type) {
            res.status(400).json({
                message: 'Missing required parameter [client_id, redirect_uri, scope, response_type]'
            });
            return
        }

        // check client ID
        if (!uuidValidate(query.client_id)) {
            res.status(400).json({
                message: 'Invalid client ID, must be UUID v4'
            });
            return
        }

        // check redirect_uri
        if (!utils.validURL(query.redirect_uri)) {
            res.status(400).json({
                message: 'Invalid redirect uri input, must be valid URL.'
            });
            return
        }
        
        // check scope
        if (!utils.validScope(query.scope)) {
            res.status(400).json({    
                message: 'Invalid scope, must be alphanumeric, dash, underscore or dot.'
            });
            return
        }
        
        if (query.response_type !== "code"){
            res.status(400).json({ 
                message: "Only 'code' response type supported"
            });
            return
        }
        
        // validate client
        // the scope validation here is not working yet
        if (!await model.validateClient(query.client_id, query.redirect_uri, query.scope.split('+'))) {
            res.status(400).json({
                message: "Invalid client credentials"
            });
            return
        }

        await oauth2Server.authorize(request, response, {
            allowEmptyState: true,
            authenticateHandler: {
                handle: (req) => {
                    // console.log(req.body);
                    // Whatever you need to do to authorize / retrieve your user from post data here
                    return {id: 1};
                }
            }
        }, (err?: any, result?: any) => {
            if (err) {
                return res.status(400).json(err || {
                    "statusCode": 400,
                    "status": 400,
                    "code": 400,
                    "message": "Could not authorize client credentials",
                    "name": "invalid_client"
                });
            }
            result.expiresAt = Date.parse(result.expiresAt);
            const queryString = Object.keys(result).map(key => {
                if (key === 'authorizationCode') {
                    return 'code=' + result[key];
                }
                return key + '=' + result[key];
            }).join('&');
            return res.redirect(`${query.redirect_uri}?${queryString}`);
        })
    }
}
