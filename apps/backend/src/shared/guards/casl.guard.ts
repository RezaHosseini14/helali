import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createAppAbility, subject } from '@helali/shared';

import type { IAbilityRequirement } from '@helali/shared';

import { ABILITY_KEY } from '@/shared/constants/metadata-keys';
import type { IAuthenticatedUser } from '@/shared/types/auth.types';

@Injectable()
export class CaslGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requirements = this.reflector.getAllAndOverride<
      ReadonlyArray<IAbilityRequirement> | undefined
    >(ABILITY_KEY, [context.getHandler(), context.getClass()]);

    if (!requirements || requirements.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user: IAuthenticatedUser; params: Record<string, string> }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Access denied');
    }

    const ability = createAppAbility({
      id: user.id,
      role: user.role,
      permissions: user.permissions,
    });

    const isAllowed = requirements.every((requirement) =>
      this.checkRequirement(ability, requirement, request.params),
    );

    if (!isAllowed) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private checkRequirement(
    ability: ReturnType<typeof createAppAbility>,
    requirement: IAbilityRequirement,
    params: Record<string, string>,
  ): boolean {
    if (requirement.field && requirement.param) {
      const fieldValue = params[requirement.param];

      if (!fieldValue) {
        return false;
      }

      const parsedId = Number(fieldValue);

      if (Number.isNaN(parsedId)) {
        return false;
      }

      return ability.can(
        requirement.action,
        subject('User', { id: parsedId }),
      );
    }

    return ability.can(requirement.action, requirement.subject);
  }
}
