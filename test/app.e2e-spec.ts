import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const assert = require('assert');
const queryString = require('query-string');
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { token } from '../src/mocks'

// TODO: Come up with a better method to test other than shallow object equivalence

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authCode: string;
  let refreshToken: string;
  let accessToken1: string;
  let accessToken2: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/token client_credentials', (done) => {
    return request(app.getHttpServer())
      .post('/oauth/token')
      .send({"grant_type": "client_credentials"})
      .set('Authorization', 'Basic MTRlMjdmMjQtYjkzNS00ZjRiLTg0OTMtNzNiOGYxMGYwZGFiOnNlY3JldDI=')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .expect(200)
      .then(res => {
        assert.ok(Object.keys(res.body).every(k => Object.keys(token).includes(k)));
        done();
      });
  });

  it('/auth/authorize auth flow start', (done) => {
    return request(app.getHttpServer())
      .post('/oauth/authorize')
      .query({
        "client_id":"14e27f24-b935-4f4b-8493-73b8f10f0dab",
        "redirect_uri":"https://google.com",
        "response_type":"code",
        "scope":"user.read",
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
        assert.ok(Object.keys(authResponse).every(k => Object.keys(returnedParams).includes(k)));
        // set this code to use in following test
        authCode = returnedParams.authorizationCode;
        done();
      });
  });

  it('/auth/token', (done) => {
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
      .then(res => {
        assert.ok(Object.keys(res.body).every(k => Object.keys(token).includes(k)));
        // set this token to use in following test
        refreshToken = res.body.refreshToken;
        accessToken1 = res.body.accessToken;
        done();
      });
  });

  it('/auth/token', (done) => {
    return request(app.getHttpServer())
      .post('/oauth/token')
      .send({
        "grant_type":"refresh_token",
        "refresh_token":refreshToken,
      })
      .set('Authorization', 'Basic MTRlMjdmMjQtYjkzNS00ZjRiLTg0OTMtNzNiOGYxMGYwZGFiOnNlY3JldDI=')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .expect(200)
      .then(res => {
        assert.ok(Object.keys(res.body).every(k => Object.keys(token).includes(k)));
        accessToken2 = res.body.accessToken;
        done();
      });
  });

  it('/auth/token password', (done) => {
    return request(app.getHttpServer())
      .post('/oauth/token')
      .send({
        "grant_type":"password",
        "username":"joebloggs",
        "password":"foo"
      })
      .set('Authorization', 'Basic YjkyMGJiY2EtYWJhNS00MWEwLThmOTYtMThjOGU2YzhmYjM5OnNlY3JldDE=')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .expect(200)
      .then(res => {
        assert.ok(Object.keys(res.body).every(k => Object.keys(token).includes(k)));
        done();
      });
  });

  it('Protects secured endpoints', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(401)
  });

  it('Ensures that tokens are invalided if a new one is issued', () => {
    return request(app.getHttpServer())
      .get('/api')
      .set('Authorization', `Bearer ${accessToken1}`)
      .expect(401)
  });

  it('Authenticates secured endpoints', () => {
    return request(app.getHttpServer())
      .get('/api')
      .set('Authorization', `Bearer ${accessToken2}`)
      .expect(200)
  });

  // it('Authenticates secured endpoints with scope verification', () => {
  //   return request(app.getHttpServer())
  //     .post('/api')
  //     .set('Authorization', `Bearer ${accessToken2}`)
  //     .expect(403)
  // });
});
