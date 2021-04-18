# NestJS OAuth2.0 Server

An exercise in developing a generic and compliant javascript-based OAuth 2.0 Server and API.  Based on [Nest](https://github.com/nestjs/nest) framework and [oauth2-server](https://github.com/oauthjs/node-oauth2-server#readme) package.

**Note:** This is a work in progress and is functionally incomplete.  See repo project for outstanding tasks and components

## Installation

**Install client**
```bash
$ npm install
```

**Bootstrap database**
From the project root directory, launch postgres container with docker
```docker run -p 5432:5432 --name oauth-server -e POSTGRES_PASSWORD=password -e POSTGRES_DB=oauth -d postgres```

Initialise table schema (and seed some data), by copying the schema.sql file into the container and executing it.
```
docker cp ./utils/schema.sql oauth-server:/docker-entrypoint-initdb.d/schema.sql
docker exec -u postgres oauth-server psql oauth postgres -f /docker-entrypoint-initdb.d/schema.sql
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
