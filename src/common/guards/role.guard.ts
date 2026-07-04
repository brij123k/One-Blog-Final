import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
  ) {}

canActivate(context: ExecutionContext): boolean {
  const roles = this.reflector.getAllAndOverride<string[]>(
    ROLES_KEY,
    [
      context.getHandler(),
      context.getClass(),
    ],
  );

  const request = context.switchToHttp().getRequest();

  console.log('Required Roles:', roles);
  console.log('User:', request.user);

  if (!roles) {
    return true;
  }

  const hasRole = roles.includes(request.user.role);

  console.log('Has Role:', hasRole);

  return hasRole;
}
}