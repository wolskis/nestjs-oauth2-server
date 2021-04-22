import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requestScope = this.reflector.get<string[]>('scope', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const tokenScopes = request.user.scope;

    if (tokenScopes) {
      if (!requestScope.every(s =>  tokenScopes.includes(s))) {
        return false
      } 
    }
    return true;
  }
}
