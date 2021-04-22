import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { Client } from 'pg';

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

describe('DatabaseService', () => {
  let service: DatabaseService;
  let client: any;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService],
    }).compile();

    client = new Client();
    service = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(DatabaseService);
  });

  it('should return queries', async (done) => {
    const mock = { rows: [{"foo": "bar"}] };
    client.query.mockResolvedValueOnce(mock);
    const user = await service.query('foo');
    
    setImmediate(() => {
      expect(user).toBe(mock);
      done();
    })
  })
});
