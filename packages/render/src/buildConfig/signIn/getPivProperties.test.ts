import type { Databag } from '@/types';

import { getPivProperties } from './getPivProperties';

describe('getPivProperties', () => {
  it('returns undefined when no X509_LOGIN_BUTTON_IN_SIGN_IN_WIDGET FF', () => {
    const databag = {
      featureFlags: ['random-ff'],
    } as Databag;
    expect(getPivProperties(databag)).toEqual(undefined);
  });

  describe('with X509_LOGIN_BUTTON_IN_SIGN_IN_WIDGET FF', () => {
    const databag = {
      featureFlags: ['X509_LOGIN_BUTTON_IN_SIGN_IN_WIDGET'],
    } as Databag;

    it('populates correct data', () => {
      const testData = { ...databag };
      testData.certAuthUrl = 'http://mock-certAuthUrl';
      expect(getPivProperties(testData)).toMatchInlineSnapshot(`
        {
          "certAuthUrl": "http://mock-certAuthUrl",
        }
      `);

      testData.isCustomDomain = true;
      expect(getPivProperties(testData)).toMatchInlineSnapshot(`
        {
          "certAuthUrl": "http://mock-certAuthUrl",
          "isCustomDomain": true,
        }
      `);

      testData.isCustomDomain = false;
      expect(getPivProperties(testData)).toMatchInlineSnapshot(`
        {
          "certAuthUrl": "http://mock-certAuthUrl",
        }
      `);

      testData.customDomain = 'customdomain.com';
      expect(getPivProperties(testData)).toMatchInlineSnapshot(`
        {
          "certAuthUrl": "http://mock-certAuthUrl",
          "customDomain": "customdomain.com",
        }
      `);
    });
  });
});