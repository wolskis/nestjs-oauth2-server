import { Test, TestingModule } from '@nestjs/testing';
import { AuthCodesService } from './authcodes.service';

describe('AuthcodesService', () => {
  let service: AuthCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthCodesService],
    }).compile();

    service = module.get<AuthCodesService>(AuthCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
