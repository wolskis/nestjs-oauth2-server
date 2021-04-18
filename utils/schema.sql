DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tokens CASCADE;
DROP TABLE IF EXISTS authcodes CASCADE;
DROP TYPE IF EXISTS granttypes;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE granttypes AS ENUM ('authorization_code','password','client_credentials','refresh_token');

CREATE TABLE clients 
(
  id              SERIAL,
  clientId        uuid,
  clientSecret    VARCHAR(255),
  grants          granttypes[],
  redirect_uris   TEXT[],
  scopes          TEXT[],
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (clientId)
);

CREATE TABLE users 
(
  id              SERIAL,
  username        VARCHAR(255),
  password        TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE tokens 
(
  id                    SERIAL,
  accessToken           text,
  accessTokenExpiresAt  TIMESTAMPTZ NOT NULL,
  refreshToken          text,
  refreshTokenExpiresAt TIMESTAMPTZ NOT NULL,
  scope                 text,
  clientId    uuid,
  userId      integer,
  PRIMARY KEY (id),
  FOREIGN KEY (clientId) REFERENCES clients(clientId),
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE authcodes 
(
  id          SERIAL,
  code        text,
  expiresAt   TIMESTAMPTZ NOT NULL,
  scope       text,
  redirectUri text,
  clientId    uuid,
  userId      integer,
  FOREIGN KEY (clientId) REFERENCES clients(clientId),
  FOREIGN KEY (userId) REFERENCES users(id),
  PRIMARY KEY (id)
);

INSERT INTO users (username, password)
VALUES
  ('joebloggs', 'foo'),
  ('foobar', 'foo')
RETURNING *;

INSERT INTO clients (clientId, clientSecret, grants, redirect_uris, scopes)
VALUES
  ('b920bbca-aba5-41a0-8f96-18c8e6c8fb39','secret1', ARRAY['password']::granttypes[], null, null),
  ('14e27f24-b935-4f4b-8493-73b8f10f0dab','secret2', ARRAY['client_credentials', 'authorization_code', 'refresh_token']::granttypes[], ARRAY['https://google.com'], ARRAY['user.read', 'user.write'])
RETURNING *;
