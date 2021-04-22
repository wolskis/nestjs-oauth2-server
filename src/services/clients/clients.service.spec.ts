import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { DatabaseService } from '../database/database.service';
import { authcode, user, client as clientmock, dbAuthCode } from '../../mocks'
// import {client as clientmock } from '../../mocks/models'
import { MockedDatabaseService } from '../database/__mocks__/database.service';
import { AuthorizationCode, Client, User } from "oauth2-server";

// export const foofuck: Client = {
//     id: '2',
//     clientid: '14e27f24-b935-4f4b-8493-73b8f10f0dab',
//     grants: [ 'client_credentials', 'authorization_code', 'refresh_token' ],
//     scopesaaa: [ 'user.read', 'user.write' ],
//     redirecturis: [ 'https://google.com' ]
// }

describe('AuthCodesService', () => {
  let service: ClientsService;
  let repositoryMock: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: 'DatabaseService', useClass: MockedDatabaseService }
      ]
    }).compile();

    repositoryMock = module.get<DatabaseService>(DatabaseService);
    service = module.get<ClientsService>(ClientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(ClientsService);
  });

  it('get client by ID', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [clientmock] });
    const test = await service.getClientById('123')
    expect(test).toBe(clientmock);
    done();
  });

  it('get client by ID and secret', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [clientmock] });
    const test = await service.getClientByIdAndSecret('123', 'abc')
    expect(test).toBe(clientmock);
    done();
  });

  it('validate client positively', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [clientmock] });
    const test = await service.validateClient('14e27f24-b935-4f4b-8493-73b8f10f0dab', 'https://google.com', ['user.read', 'user.write']);
    expect(test).toBe(clientmock);
    done();
  });

  it('validate client negatively when redirect doesnt match', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [clientmock] });
    const test = await service.validateClient('14e27f24-b935-4f4b-8493-73b8f10f0dab', 'http://localhost', ['user.read', 'user.write']);
    expect(test).toBe(null);
    done();
  });

  it('validate client negatively when scope doesnt match', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [clientmock] });
    const test = await service.validateClient('14e27f24-b935-4f4b-8493-73b8f10f0dab', 'https://google.com', ['foo.bar']);
    expect(test).toBe(null);
    done();
  });

});