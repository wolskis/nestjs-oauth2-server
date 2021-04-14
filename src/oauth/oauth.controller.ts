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
        console.log(request.body);
        if (req.body?.grant_type === "authorization_code") {
            oauth2Server.authorize(request, response)
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
    @Redirect('https://docs.nestjs.com', 302)
    async redirect(@Req() req, @Query() query, @Res() res, ) {
        const request = new OAuth2Server.Request(req);
        const response = new OAuth2Server.Response(res);
        // should include a csrf token
        // console.log(query);
        // if (!query || !query.client_id || !query.redirect_uri || !query.scope || !query.response_type) {
        //     res.status(400).json({
        //         message: 'Missing required parameter [client_id, redirect_uri, scope, response_type]'
        //     });
        //     return
        // } 
        
        // if (query.response_type !== "code"){
        //     res.status(400).json({ 
        //         message: "Only 'code' response type supported"
        //     });
        //     return
        // }
        
        // // validate client
        // console.log(await oauth2Model.validateClient(query.client_id, query.redirect_uri, query.scope.split('+')));
        // if (!await oauth2Model.validateClient(query.client_id, query.redirect_uri, query.scope.split('+'))) {
        //     res.status(400).json({
        //         message: "Invalid client credentials"
        //     });
        //     return
        // }

        const foo = await oauth2Server.authorize(request, response, {}, (err?: any, result?: any) => {
            if (err) {
                return res.status(400).json(err || {
                    "statusCode": 400,
                    "status": 400,
                    "code": 400,
                    "message": "Could not authorize client credentials",
                    "name": "invalid_client"
                });
            }
            console.log('result: ',result)
        })
            // .then((token: any) => {
            //     console.log(token);
            //     // need to typecast any above
            //     res.status(200).json(token);
            // }).catch((err: any) => {
            //     //console.log(err);
            //     res.status(err.code || 500).json(err);
            // });
        return {
            // url: `${query.redirect_uri}?code=${code}&state=${state}`
            url: `${query.redirect_uri}`
        }
        

        // const client = data.clients.find(client => client.clientId === query.client_id);
        // // store these
        // const state = Guid.create();
        // const code = await oauth2Server.generateAuthorizationCode();
        
        // return {
        //     url: `${query.redirect_uri}?code=${code}&state=${state}`
        // }
    }
}
