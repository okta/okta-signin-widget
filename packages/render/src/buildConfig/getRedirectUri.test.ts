import type { Databag } from '@/types';

import { getRedirectUri } from './getRedirectUri';

describe('getRedirectUri', () => {
  it('returns suppliedRedirectUri when has ALLOW_ABSOLUTE_FROM_URI FF', () => {
    const databag = {
      featureFlags: ['ALLOW_ABSOLUTE_FROM_URI'],
      suppliedRedirectUri: 'https://fake-suppliedRedirectUri',
    } as Databag;
    expect(getRedirectUri(databag)).toBe('https://fake-suppliedRedirectUri');
  });

  describe('no ALLOW_ABSOLUTE_FROM_URI', () => {
    const databag = {
      featureFlags: ['random-ff'],
    } as Databag;

    it('returns fromUri if it\'s absolute uri', () => {
      const testData = {
        ...databag,
        fromUri: 'https://fake-absolute-fromuri'
      };
      expect(getRedirectUri(testData)).toBe('https://fake-absolute-fromuri');
    });

    it('appends baseUrl if fromUri is not absolute uri', () => {
      const testData = {
        ...databag,
        fromUri: '/fake-relative-fromuri',
        baseUrl: 'http://baseUrl.com'
      };
      expect(getRedirectUri(testData)).toBe('http://baseUrl.com/fake-relative-fromuri');
    });
  });
});
