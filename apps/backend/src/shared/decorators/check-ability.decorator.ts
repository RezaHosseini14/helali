import { SetMetadata } from '@nestjs/common';

import type { IAbilityRequirement } from '@helali/shared';

import { ABILITY_KEY } from '@/shared/constants/metadata-keys';

export const CheckAbility = (...requirements: ReadonlyArray<IAbilityRequirement>) =>
  SetMetadata(ABILITY_KEY, requirements);
