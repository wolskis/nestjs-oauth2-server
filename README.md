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

## Example flows

*Client credentials*
```
curl --location --request POST 'http://localhost:3000/oauth/token' \
--header 'Authorization: Basic MTRlMjdmMjQtYjkzNS00ZjRiLTg0OTMtNzNiOGYxMGYwZGFiOnNlY3JldDI=' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=client_credentials'
```
Note: Client credentials currently requires base64 encoded basic auth (username: client id, password: client secret)

*Authorize flow*
```
curl --location --request POST 'http://localhost:3000/oauth/authorize?client_id=14e27f24-b935-4f4b-8493-73b8f10f0dab&redirect_uri=https://google.com&response_type=code&scope=user.read'
```
Note: the above should be triggered from a form submission that explicitly lists scopes

*Authorization code token*
```
curl --location --request POST 'http://localhost:3000/oauth/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=authorization_code' \
--data-urlencode 'client_id=14e27f24-b935-4f4b-8493-73b8f10f0dab' \
--data-urlencode 'client_secret=secret2' \
--data-urlencode 'redirect_uri=https://google.com' \
--data-urlencode 'code=ede489e1df93145fe432aefaa275af2a96f598ab'
```
Note: gain code above from authorize flow response

*Refresh token*
```
curl --location --request POST 'http://localhost:3000/oauth/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--header 'Authorization: Basic MTRlMjdmMjQtYjkzNS00ZjRiLTg0OTMtNzNiOGYxMGYwZGFiOnNlY3JldDI=' \
--data-urlencode 'grant_type=refresh_token' \
--data-urlencode 'refresh_token=f06ffb517fe9b19535bdfa684b4ec4049e67a066'
```

*Password token*
```
curl --location --request POST 'http://localhost:3000/oauth/token' \
--header 'Authorization: Basic YjkyMGJiY2EtYWJhNS00MWEwLThmOTYtMThjOGU2YzhmYjM5OnNlY3JldDE=' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=password' \
--data-urlencode 'username=joebloggs' \
--data-urlencode 'password=foo'
```

*Testing authenticated routes and scopes*
```
curl --location --request GET 'http://localhost:3000/api' \
--header 'Authorization: Bearer e878d996d51ad47e164ca76dca9491658147787d'
```