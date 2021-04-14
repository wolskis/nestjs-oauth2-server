import { Injectable } from '@nestjs/common';
import { Request, Response } from "oauth2-server";

@Injectable()
export class TokenService {
    // obtainToken(req, res) {

    //     var request = new Request(req);
    //     var response = new Response(res);
    
    //     return app.oauth.token(request, response)
    //         .then(function(token) {
    //             res.json(token);
    //         }).catch(function(err) {
    //             res.status(err.code || 500).json(err);
    //         });
    // }
    
    // authenticateRequest(req, res, next) {
    
    //     var request = new Request(req);
    //     var response = new Response(res);
    
    //     return app.oauth.authenticate(request, response)
    //         .then(function(token) {
    //             next();
    //         }).catch(function(err) {
    //             res.status(err.code || 500).json(err);
    //         });
    // }

}
