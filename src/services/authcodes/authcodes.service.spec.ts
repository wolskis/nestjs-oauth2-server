import { Test, TestingModule } from '@nestjs/testing';
import { AuthCodesService } from './authcodes.service';
import { DatabaseService } from '../database/database.service';
import { authcode, client as clientmock, user, dbAuthCode } from '../../mocks'
import { MockedDatabaseService } from '../database/__mocks__/database.service';

describe('AuthCodesService', () => {
  let service: AuthCodesService;
  let repositoryMock: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthCodesService,
        { provide: 'DatabaseService', useClass: MockedDatabaseService }
      ]
    }).compile();

    repositoryMock = module.get<DatabaseService>(DatabaseService);
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
    repositoryMock.query.mockResolvedValueOnce({ rows: [] });
    const test = await service.saveAuthorizationCode(authcode, clientmock, user)
    expect(test).toBe(true);
    done();
  });

  it('should get auth codes from db', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [dbAuthCode] });
    const test = await service.getAuthorizationCode('d9524def3dfdd46fa6cac54b8b64d0088ff21013');
    expect(test).toBe(dbAuthCode);
    done();
  });

  it('should handle errors if auth code cannot be found', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [] });
    const test = await service.getAuthorizationCode('d9524def3dfdd46fa6cac54b8b64d0088ff21013');
    expect(test).toBe(null);
    done();
  });

  it('should delete auth codes from db', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [] });
    const test = await service.deleteAuthorizationCode('d9524def3dfdd46fa6cac54b8b64d0088ff21013');
    expect(test).toBe(true);
    done();
  })
});
