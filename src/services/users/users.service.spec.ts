import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';
import { authcode, client as clientmock, user, dbAuthCode, token } from '../../mocks'
import { MockedDatabaseService } from '../database/__mocks__/database.service';

describe('TokensService', () => {
  let service: UsersService;
  let repositoryMock: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: 'DatabaseService', useClass: MockedDatabaseService }
      ],
    }).compile();
    repositoryMock = module.get<DatabaseService>(DatabaseService);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(UsersService);
  });
  
  it('should get users by id from db', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [user] });
    const test = await service.getUserById(user.id)
    expect(test).toBe(user);
    done();
  });

  it('should get users by credentials from db', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [user] });
    const test = await service.getUserByCredentials(user.username, user.password)
    expect(test).toBe(user);
    done();
  });

  it('should get user associated with client id from db', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [user] });
    const test = await service.getUserByClientId(clientmock.id)
    expect(test).toBe(user);
    done();
  });

  it('should fail to get users by id from db gracefully', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [] });
    const test = await service.getUserById(user.id)
    expect(test).toBe(null);
    done();
  });

  it('should fail to get get users by credentials from db gracefully', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [] });
    const test = await service.getUserByCredentials(user.username, user.password)
    expect(test).toBe(null);
    done();
  });

  it('should fail to get get user associated with client id from db gracefully', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [] });
    const test = await service.getUserByClientId(clientmock.id)
    expect(test).toBe(null);
    done();
  });
});