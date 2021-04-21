import { OAuthMiddleware } from './oauth.middleware';

describe('OauthMiddleware', () => {
  it('should be defined', () => {
    expect(new OAuthMiddleware()).toBeDefined();
  });
});
