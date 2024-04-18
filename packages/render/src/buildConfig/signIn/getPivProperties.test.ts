import type { Databag } from '@/types';

import { getPivProperties } from './getPivProperties';

describe('getPivProperties', () => {
  it('returns empty object when showX509button is falsy or no X509_LOGIN_BUTTON_IN_SIGN_IN_WIDGET FF', () => {
    const databag = {
      featureFlags: ['random-ff'],
      showX509button: false,
    } as Databag;
    expect(getPivProperties(databag)).toEqual({});
  });

  describe('showX509button is truthy and has X509_LOGIN_BUTTON_IN_SIGN_IN_WIDGET FF', () => {
    const databag = {
      featureFlags: ['X509_LOGIN_BUTTON_IN_SIGN_IN_WIDGET'],
      showX509button: true,
    } as Databag;

    it('populates correct data', () => {
      const testData = { ...databag };
      testData.certAuthUrl = 'http://mock-certAuthUrl';
      expect(getPivProperties(testData)).toMatchInlineSnapshot(`
        {
          "certAuthUrl": "http://mock-certAuthUrl",
          "isCustomDomain": false,
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
          "isCustomDomain": false,
        }
      `);

      testData.customDomain = 'customdomain.com';
      expect(getPivProperties(testData)).toMatchInlineSnapshot(`
        {
          "certAuthUrl": "http://mock-certAuthUrl",
          "customDomain": "customdomain.com",
          "isCustomDomain": false,
        }
      `);
    });
  });
});