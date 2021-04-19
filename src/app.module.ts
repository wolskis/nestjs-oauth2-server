import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OauthController } from './oauth/oauth.controller';
import { ApiController } from './api/api.controller';
import { OauthModule } from './oauth/oauth.module';
import { OAuthMiddleware } from './oauth.middleware'
import { ClientsService } from './services/clients/clients.service';
import { AuthCodesService } from './services/authcodes/authcodes.service';
import { DatabaseService } from './services/database/database.service';
import { UsersService } from './services/users/users.service';
import { TokensService } from './services/tokens/tokens.service';

@Module({
  controllers: [AppController, OauthController, ApiController],
  providers: [AppService, ClientsService, AuthCodesService, DatabaseService, UsersService, TokensService],
  imports: [OauthModule, ConfigModule.forRoot()],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(OAuthMiddleware)
      .forRoutes('api');
  }
}
