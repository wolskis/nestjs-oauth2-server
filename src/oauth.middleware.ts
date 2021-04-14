import { NestMiddleware, Injectable } from "@nestjs/common";
import { Request, Response, NextFunction } from 'express';
import OAuth2Server = require("oauth2-server");
import { oauth2Model } from "./model/model"

const oauth2Server = new OAuth2Server({
    model: oauth2Model
});

@Injectable()
export class OAuthMiddleware implements NestMiddleware {
    async use(req: Request, res: Response, next: NextFunction, authenticateOptions?: any) {
        const options: undefined | any = authenticateOptions || {};
        const request = new OAuth2Server.Request(req);
        const response = new OAuth2Server.Response(res);
        try {
            const token = await oauth2Server.authenticate(request, response, options);
            // req.user = token;
            next();
        } catch (err) {
            res.status(err.code || 500).json(err);
        }
    };
}