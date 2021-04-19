import { ScopeGuard } from './scope.guard';
import { Reflector } from '@nestjs/core';

describe('ScopeGuard', () => {
  it('should be defined', () => {
    expect(new ScopeGuard(new Reflector)).toBeDefined();
  });
});
