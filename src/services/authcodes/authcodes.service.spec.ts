import { Test, TestingModule } from '@nestjs/testing';
import { AuthCodesService } from './authcodes.service';
import { DatabaseService } from '../database/database.service';
import { Client as DBClient } from 'pg';
import { authcode, client as clientmock, user, dbAuthCode } from '../../mocks'

// TODO: make this importable/shareable
// is currently hoisted, so cannot be imported
jest.mock('pg', () => {
  const mClient = {
    query: jest.fn(),
    end: jest.fn(),
    release: jest.fn()
  }
  const mPool = {
    connect: jest.fn(() => mClient),
    query: jest.fn(),
    end: jest.fn(),
    release: jest.fn()
  };
  return { 
    Pool: jest.fn(() => mPool),
    Client: jest.fn(() => mClient)
  };
});

describe('AuthCodesService', () => {
  let service: AuthCodesService;
  let client: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthCodesService,DatabaseService]
    }).compile();

    client = new DBClient();
    service = module.get<AuthCodesService>(AuthCodesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AuthCodesService);
  });

  it('should save auth codes to db', async (done) => {
    client.query.mockResolvedValueOnce({ rows: [] });
    const test = await service.saveAuthorizationCode(authcode, clientmock, user)
    expect(test).toBe(true);
    done();
  });

  it('should get auth codes from db', async (done) => {
    client.query.mockResolvedValueOnce({ rows: [dbAuthCode] });
    const test = await service.getAuthorizationCode('d9524def3dfdd46fa6cac54b8b64d0088ff21013');
    expect(test).toBe(dbAuthCode);
    done();
  });

  it('should handle errors if auth code cannot be found', async (done) => {
    client.query.mockResolvedValueOnce({ rows: [] });
    const test = await service.getAuthorizationCode('d9524def3dfdd46fa6cac54b8b64d0088ff21013');
    expect(test).toBe(null);
    done();
  });

  it('should delete auth codes from db', async (done) => {
    client.query.mockResolvedValueOnce({ rows: [] });
    const test = await service.deleteAuthorizationCode('d9524def3dfdd46fa6cac54b8b64d0088ff21013');
    expect(test).toBe(true);
    done();
  })
});
