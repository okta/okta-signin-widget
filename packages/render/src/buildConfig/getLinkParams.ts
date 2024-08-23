import type { Databag } from '@/types';

import { hasAnyFeature } from '@/utils';

export const getLinkParams = (databag: Databag) => {
  const { featureFlags, linkParams, vendor, thirdPartyEnrollmentUrl } = databag;
  if (!hasAnyFeature([
    'OMM_DEVICE_TRUST_IOS_DEVICE',
    'THIRD_PARTY_DEVICE_TRUST_IOS_DEVICE',
    'OMM_DEVICE_TRUST_ANDROID_DEVICE',
    'THIRD_PARTY_DEVICE_TRUST_ANDROID_DEVICE',
  ], featureFlags)) {
    return undefined;
  }

  let res;
  if (linkParams) {
    res = {
      ...linkParams,
      vendor,
      enrollmentUrl: thirdPartyEnrollmentUrl,
    };
  }

  return res;
};
