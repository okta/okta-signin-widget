import type { Databag } from '@/types';

import { getLinkParams } from './getLinkParams';

describe('getLinkParams', () => {
  it(`returns undefined when none of OMM_DEVICE_TRUST_IOS_DEVICE, 
    THIRD_PARTY_DEVICE_TRUST_IOS_DEVICE, 
    OMM_DEVICE_TRUST_ANDROID_DEVICE, 
    THIRD_PARTY_DEVICE_TRUST_ANDROID_DEVICE FF is available`,
    () => {
      const databag = {
        featureFlags: ['fake-ff']
      } as Databag;
      expect(getLinkParams(databag)).toBeUndefined();
    });

  describe('with any of defined FF', () => {
    const databag = {
      featureFlags: ['THIRD_PARTY_DEVICE_TRUST_IOS_DEVICE']
    } as Databag;

    it('reutrns empty object when no linkParams in databag', () => {
      const testData = {
        ...databag,
        linkParams: undefined
      } as Databag;
      expect(getLinkParams(testData)).toEqual(undefined);
    });

    it('builds linkParams when linkParams is avaliable in databag', () => {
      const testData = {
        ...databag,
        linkParams: { a: 'a' },
        vendor: 'mock-vendor',
        thirdPartyEnrollmentUrl: 'mock-thirdPartyEnrollmentUrl',
      } as Databag;
      expect(getLinkParams(testData)).toEqual({
        a: 'a',
        enrollmentUrl: 'mock-thirdPartyEnrollmentUrl',
        vendor: 'mock-vendor'
      });
    });
  });
});
