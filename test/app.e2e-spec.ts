import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
const assert = require('assert');
const queryString = require('query-string');
import { join } from 'path';
const jwt = require('jsonwebtoken');
import * as request from 'supertest';
import { parse as parseHTML } from 'node-html-parser';
import { AppModule } from './../src/app.module';
import { tokenResponse } from '../src/mocks'

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;
  let authCode: string;
  let refreshToken: string;
  let accessToken1: string;
  let accessToken2: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useStaticAssets(join(__dirname, '../src', 'public'));
    app.setBaseViewsDir(join(__dirname, '../src', 'client'));
    app.setViewEngine('hbs');

    await app.listen(parseInt(process.env.PORT, 10) || 3000);
  });

  afterEach(() => {
    return app && app.close();
  });

  it('/auth/token client_credentials', (done) => {
    request(app.getHttpServer())
      .post('/oauth/token')
      .send({"grant_type": "client_credentials"})
      .set('Authorization', 'Basic MTRlMjdmMjQtYjkzNS00ZjRiLTg0OTMtNzNiOGYxMGYwZGFiOnNlY3JldDI=')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .expect(200)
      .then(res => {
        assert.ok(Object.keys(res.body).every(k => Object.keys(tokenResponse).includes(k)));
        done();
      });
  });

  it('/auth/authorize auth flow start GET', (done) => {
    request(app.getHttpServer())
      .get('/oauth/authorize')
      .query({
        "client_id":"14e27f24-b935-4f4b-8493-73b8f10f0dab",
        "redirect_uri":"https://google.com",
        "response_type":"code",
        "scope":"user.read",
        "state": "123"
      })
      .expect(200)
      .then(res => {
        // assert that response is a html page
        assert.equal(res.headers["content-type"], 'text/html; charset=utf-8');
        // assert hidden fields are present in html
        const html = parseHTML(res.text);
        assert.equal(html.querySelector('#client_id').getAttribute('value'), "14e27f24-b935-4f4b-8493-73b8f10f0dab");
        done();
      });
  });

  it('/auth/authorize auth flow start POST', (done) => {
    request(app.getHttpServer())
      .post('/oauth/authorize')
      .send({
        "client_id":"14e27f24-b935-4f4b-8493-73b8f10f0dab",
        "redirect_uri":"https://google.com",
        "response_type":"code",
        "scope":"user.read",
        "state": "123",
        "username": "foobar",
        "password": "foo"
      })
      .expect(302)
      .then(res => {
        const returnedParams = queryString.parseUrl(res.header.location).query;
        const authResponse =  {
          code: 'b8f2befbe5158aab8defee8c100a8eb2a9bd6b5b',
          expiresAt: '1619080558000',
          redirectUri: 'https://google.com',
          scope: 'true',
          state: "123"
        }
        assert.ok(Object.keys(authResponse).every(k => Object.keys(returnedParams).includes(k)));
        // set this code to use in following test
        authCode = returnedParams.code;
        done();
      });
  });

  it('/auth/authorize auth flow start POST rejected without user credentials', () => {
    request(app.getHttpServer())
      .post('/oauth/authorize')
      .send({
        "client_id":"14e27f24-b935-4f4b-8493-73b8f10f0dab",
        "redirect_uri":"https://google.com",
        "response_type":"code",
        "scope":"user.read",
        "state": "123"
      })
      .expect(400);
  });

  it('/auth/token', (done) => {
    request(app.getHttpServer())
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
        assert.ok(Object.keys(res.body).every(k => Object.keys(tokenResponse).includes(k)));
        // set this token to use in following test
        refreshToken = res.body.refresh_token;
        accessToken1 = res.body.access_token;
        done();
      });
  });

  it('/auth/token', async (done) => {
    // we add an arbitrary delay here because these two tests actually execute fast enough that the issued token is identical
    await new Promise(resolve => setTimeout(resolve, 1000));
    request(app.getHttpServer())
      .post('/oauth/token')
      .send({
        "grant_type":"refresh_token",
        "refresh_token":refreshToken,
      })
      .set('Authorization', 'Basic MTRlMjdmMjQtYjkzNS00ZjRiLTg0OTMtNzNiOGYxMGYwZGFiOnNlY3JldDI=')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .expect(200)
      .then(res => {
        assert.ok(Object.keys(res.body).every(k => Object.keys(tokenResponse).includes(k)));
        accessToken2 = res.body.access_token;
        done();
      });
  });

  it('/auth/token password', (done) => {
    request(app.getHttpServer())
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
        assert.ok(Object.keys(res.body).every(k => Object.keys(tokenResponse).includes(k)));
        done();
      });
  });

  it('Protects secured endpoints', () => {
    request(app.getHttpServer())
      .get('/api')
      .expect(401)
  });

  it('Ensures that tokens are invalidated if a new one is issued', () => {
    request(app.getHttpServer())
      .get('/api')
      .set('Authorization', `Bearer ${accessToken1}`)
      .expect(401)
  });

  it('Authenticates secured endpoints', () => {
    request(app.getHttpServer())
      .get('/api')
      .set('Authorization', `Bearer ${accessToken2}`)
      .expect(200)
  });

  it('Authenticates secured endpoints with scope verification', () => {
    request(app.getHttpServer())
      .post('/api')
      .set('Authorization', `Bearer ${accessToken2}`)
      .expect(403)
  });

  it('Authenticates secured endpoints with secret verification', () => {
    const tokenParts = accessToken2.split('.');
    tokenParts[2] = Buffer.from('badsecretstring', 'binary').toString('base64');
    const tokenWithFalseSecret = tokenParts.join('.');
    request(app.getHttpServer())
      .post('/api')
      .set('Authorization', `Bearer ${tokenWithFalseSecret}`)
      .expect(401)
  });
});
