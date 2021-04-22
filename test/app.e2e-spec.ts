import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const queryString = require('query-string');
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { token } from '../src/mocks'

// TODO: Come up with a better method to test other than shallow object equivalence

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authCode: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/auth/token client_credentials', () => {
    return request(app.getHttpServer())
      .post('/oauth/token')
      .send({"grant_type": "client_credentials"})
      .set('Authorization', 'Basic MTRlMjdmMjQtYjkzNS00ZjRiLTg0OTMtNzNiOGYxMGYwZGFiOnNlY3JldDI=')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .expect(200)
      .then(res => expect(Object.keys(res.body).every(k => Object.keys(token).includes(k))).toBe(true));
  });

  it('/auth/authorize auth flow start', () => {
    return request(app.getHttpServer())
      .post('/oauth/authorize')
      .query({
        "client_id":"14e27f24-b935-4f4b-8493-73b8f10f0dab",
        "redirect_uri":"https://google.com",
        "response_type":"code",
        "scope":"user.read"
      })
      .expect(302)
      .then(res => {
        const returnedParams = queryString.parseUrl(res.header.location).query;
        const authResponse =  {
          authorizationCode: 'b8f2befbe5158aab8defee8c100a8eb2a9bd6b5b',
          expiresAt: '1619080558000',
          redirectUri: 'https://google.com',
          scope: 'true'
        }
        expect(Object.keys(returnedParams).every(k => Object.keys(authResponse).includes(k))).toBe(true);
        // set this code to use in following test
        authCode = returnedParams.authorizationCode;
      });
  });

  it('/auth/token', () => {
    return request(app.getHttpServer())
      .post('/oauth/token')
      .send({
        "grant_type":"authorization_code",
        "client_id":"14e27f24-b935-4f4b-8493-73b8f10f0dab",
        "client_secret":"secret2",
        "redirect_uri":"https://google.com",
        "code":authCode,
      })
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .expect(200)
      .then(res => expect(Object.keys(res.body).every(k => Object.keys(token).includes(k))).toBe(true));
  });
});
