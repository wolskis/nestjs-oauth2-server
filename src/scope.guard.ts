import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const scope = this.reflector.get<string[]>('scope', context.getHandler());
    const request = context.switchToHttp().getRequest();
    if (scope) {
      if (!request.user?.client?.scopes || !scope.every(scope => request.user?.client?.scopes.includes(scope))) {
        return false
      } 
    }
    return true;
  }
}
