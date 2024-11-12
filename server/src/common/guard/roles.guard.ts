import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '../enums/role.enums';
import { ROLE_KEY } from '../decorator/role.decorator';

export class TokenDto {
  id: number;
  role: Role;
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext) {
    const requiredRoles: Role[] = this.reflector.getAllAndOverride<Role[]>(
      ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const req: Request = context.switchToHttp().getRequest<Request>();
    //@ts-ignore
    const { roles: userRoles }: any = req.user;

    if (!requiredRoles || requiredRoles.length == 0) return true;


    //ADMIN role access until requiredRoles has USER role
    const accessForAdmin: boolean =
      requiredRoles.some((role) => role === 'USER') &&
      userRoles.some((role) => role === 'ADMIN');
      
    //SUPER role all access
    const superAccess: boolean = userRoles.some((role) => role === 'SUPER');

    //other role access
    const accessResult = requiredRoles.some((role) => role === userRoles[0]);

    if (accessForAdmin) return accessForAdmin;
    if (superAccess) return superAccess;
    if (accessResult) return accessResult;
    throw new ForbiddenException('شما به این بخش دسترسی ندارید');
  }
}
