import { FeatureFlags } from '@/types';

export const hasFeature = (key: string, featureFlags: FeatureFlags) => {
  return featureFlags.includes(key);
};
