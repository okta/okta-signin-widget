import type { FeatureFlags } from '@/types';

import { hasFeature } from './hasFeature';

export const hasAnyFeature = (keys: string[], featureFlags: FeatureFlags) => {
  return keys.some((key) => hasFeature(key, featureFlags));
};
