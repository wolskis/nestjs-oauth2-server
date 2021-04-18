import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OauthController } from './oauth/oauth.controller';
import { ApiController } from './api/api.controller';
import { OauthModule } from './oauth/oauth.module';
import { OAuthMiddleware } from './oauth.middleware'
import { ClientsService } from './clients/clients.service';
import { AuthCodesService } from './authcodes/authcodes.service';
import { DatabaseService } from './database/database.service';
import { UsersService } from './users/users.service';

@Module({
  controllers: [AppController, OauthController, ApiController],
  providers: [AppService, ClientsService, AuthCodesService, DatabaseService, UsersService],
  imports: [OauthModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(OAuthMiddleware)
      .forRoutes('api');
  }
}
