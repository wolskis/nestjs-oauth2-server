import { Test, TestingModule } from '@nestjs/testing';
import { AuthcodesService } from './authcodes.service';

describe('AuthcodesService', () => {
  let service: AuthcodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthcodesService],
    }).compile();

    service = module.get<AuthcodesService>(AuthcodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
