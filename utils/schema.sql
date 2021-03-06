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
  name            TEXT NOT NULL,
  clientId        uuid,
  clientSecret    VARCHAR(255),
  grants          granttypes[],
  redirectUris    TEXT[],
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
  clients         uuid[],
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
  refreshTokenExpiresAt TIMESTAMPTZ,
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

INSERT INTO users (username, password, clients)
VALUES
  ('joebloggs', crypt('foo', gen_salt('md5')), ARRAY['b920bbca-aba5-41a0-8f96-18c8e6c8fb39']::uuid[]),
  ('foobar', crypt('foo', gen_salt('md5')), ARRAY['14e27f24-b935-4f4b-8493-73b8f10f0dab']::uuid[])
RETURNING *;

INSERT INTO clients (name, clientId, clientSecret, grants, redirectUris, scopes)
VALUES
  ('Applify Dev','b920bbca-aba5-41a0-8f96-18c8e6c8fb39','secret1', ARRAY['password']::granttypes[], null, ARRAY['user.read']),
  ('Applify','14e27f24-b935-4f4b-8493-73b8f10f0dab','secret2', ARRAY['client_credentials', 'authorization_code', 'refresh_token']::granttypes[], ARRAY['https://google.com'], ARRAY['user.read', 'user.write'])
RETURNING *;
