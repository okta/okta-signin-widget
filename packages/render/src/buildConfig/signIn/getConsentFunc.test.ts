import type { Databag } from '@/types';

import { getConsentFunc } from './getConsentFunc';

describe('getConsentFunc', () => {
  it('returns undefined when no consentCancelUrl', () => {
    const databag = {} as Databag;
    expect(getConsentFunc(databag)).toBeUndefined();
  });

  it('matches snapshot', () => {
    const databag = {
      consentCancelUrl: 'https://mock-consentcancel.com',
    } as Databag;
    expect(getConsentFunc(databag)).toMatchInlineSnapshot(`
      {
        "cancel": [Function],
      }
    `);
  });
});
