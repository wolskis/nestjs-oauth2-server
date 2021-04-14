import { Controller, Get, Post, Query, Redirect, Req, Res } from '@nestjs/common';
import * as OAuth2Server from "oauth2-server";
import { oauth2Model } from "../model/model";
import { data } from "../data";
import { Guid } from "guid-typescript";

const oauth2Server = new OAuth2Server({
    model: oauth2Model,
    accessTokenLifetime: 60 * 60,
	allowBearerTokensInQueryString: true
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
        if (req.body?.grant_type === "authorization_code") {
            oauth2Server.authorize(request, response, {
                allowEmptyState: true,
                authenticateHandler: {
                    handle: (req) => {
                        // console.log(req.body);
                        // Whatever you need to do to authorize / retrieve your user from post data here
                        return {id: 1};
                    }
                }
            })
                .then((token: any) => {
                    // need to typecast any above
                    res.status(200).json(token);
                }).catch((err: any) => {
                    res.status(err.code || 500).json(err);
                });
        } else {
            oauth2Server.token(request, response)
                .then((token: any) => {
                    res.status(200).json(token);
                }).catch((err: any) => {
                    res.status(err.code || 500).json(err);
                });
        }
    }
 
    @Post('authorize')
    async redirect(@Req() req, @Query() query, @Res() res, ) {
        const request = new OAuth2Server.Request(req);
        const response = new OAuth2Server.Response(res);
        // should include a csrf token
        console.log(query);
        if (!query || !query.client_id || !query.redirect_uri || !query.scope || !query.response_type) {
            res.status(400).json({
                message: 'Missing required parameter [client_id, redirect_uri, scope, response_type]'
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
        // console.log(await oauth2Model.validateClient(query.client_id, query.redirect_uri, query.scope.split('+')));
        // if (!await oauth2Model.validateClient(query.client_id, query.redirect_uri, query.scope.split('+'))) {
        //     res.status(400).json({
        //         message: "Invalid client credentials"
        //     });
        //     return
        // }

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
            const queryString = Object.keys(result).map(key => key + '=' + result[key]).join('&');
            return res.redirect(`${query.redirect_uri}?${queryString}`);
        })
    }
}
