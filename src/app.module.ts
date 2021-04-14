import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OauthController } from './oauth/oauth.controller';
import { ApiController } from './api/api.controller';
import { TokenService } from './token/token.service';
import { OauthModule } from './oauth/oauth.module';
import { OAuthMiddleware } from './oauth.middleware'

@Module({
  controllers: [AppController, OauthController, ApiController],
  providers: [AppService, TokenService],
  imports: [OauthModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(OAuthMiddleware)
      .forRoutes('api');
  }
}
