import { OauthMiddleware } from './oauth.middleware';

describe('OauthMiddleware', () => {
  it('should be defined', () => {
    expect(new OauthMiddleware()).toBeDefined();
  });
});
