import { Module } from '@nestjs/common';
import { OauthController } from './oauth.controller';

@Module({
    controllers: [OauthController],
})
export class OauthModule {}
