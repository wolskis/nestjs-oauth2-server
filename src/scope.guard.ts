import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
const jwt = require('jsonwebtoken');

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requestScope = this.reflector.get<string[]>('scope', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const tokenScopes = request.user.scope;

    // not sure this is possible, but double check to prevent server errors
    if (!request.headers.authorization) { return false };
    
    // this is largely redundant, but will prevent JWT scope escalation
    try {
      const token = jwt.verify(request.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
      if (!requestScope.every((s: string) => token.scope.includes(s))) {
        return false
      }
    } catch(err) {
      console.log(err);
      return false;
    }

    if (tokenScopes) {
      if (!requestScope.every((s: string) => tokenScopes.includes(s))) {
        return false
      } 
    }
    return true;
  }
}
