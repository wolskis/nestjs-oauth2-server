import { Test, TestingModule } from '@nestjs/testing';
import { TokensService } from './tokens.service';
import { DatabaseService } from '../database/database.service';
import { authcode, client as clientmock, user, dbAuthCode, token } from '../../mocks'
import { MockedDatabaseService } from '../database/__mocks__/database.service';

describe('TokensService', () => {
  let service: TokensService;
  let repositoryMock: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        { provide: 'DatabaseService', useClass: MockedDatabaseService }
      ],
    }).compile();
    repositoryMock = module.get<DatabaseService>(DatabaseService);
    service = module.get<TokensService>(TokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(TokensService);
  });

  it('should save tokens to db', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [] });
    const test = await service.saveToken(token)
    expect(test).toBe(true);
    done();
  });

  it('should fail to save tokens to db gracefully', async (done) => {
    repositoryMock.query.mockRejectedValueOnce(new Error('Async error'))
    const test = await service.saveToken(token)
    expect(test).toBeInstanceOf(Error);
    done();
  });

  it('should get tokens by refresh token', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [token] });
    const test = await service.getTokenByRefresh(token.refreshToken)
    expect(test).toBe(token);
    done();
  });

  it('should get tokens by token', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [token] });
    const test = await service.getTokenByToken(token.accessToken)
    expect(test).toBe(token);
    done();
  });

  it('should delete tokens by refresh token', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [] });
    const test = await service.deleteTokenByRefresh(token.refreshToken)
    expect(test).toBe(true);
    done();
  });

  it('should fail to get tokens by refresh to db gracefully', async (done) => {
    repositoryMock.query.mockRejectedValueOnce(new Error('Async error'))
    const test = await service.deleteTokenByRefresh(token.refreshToken)
    expect(test).toBeInstanceOf(Error);
    done();
  });

  it('should delete tokens by token', async (done) => {
    repositoryMock.query.mockResolvedValueOnce({ rows: [] });
    const test = await service.deleteTokenByToken(token.accessToken)
    expect(test).toBe(true);
    done();
  });

  it('should fail to get tokens by token to db gracefully', async (done) => {
    repositoryMock.query.mockRejectedValueOnce(new Error('Async error'))
    const test = await service.deleteTokenByToken(token.accessToken)
    expect(test).toBeInstanceOf(Error);
    done();
  });

});