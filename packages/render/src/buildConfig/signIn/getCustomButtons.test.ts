import type { Databag } from '@/types';

import { getCustomButtons } from './getCustomButtons';

describe('getCustomButtons', () => {
  it('returns empty array when showX509button is not truthy', () => {
    const databag = { showX509button: false, i18n: {} } as Databag;
    expect(getCustomButtons(databag)).toEqual([]);
  });

  it('returns empty array when has X509_LOGIN_BUTTON_IN_SIGN_IN_WIDGET feature flag', () => {
    const databag = { 
      featureFlags: ['X509_LOGIN_BUTTON_IN_SIGN_IN_WIDGET'],
      i18n: {}
    } as Databag;
    expect(getCustomButtons(databag)).toEqual([]);
  });

  describe('showX509button is truthy and not has X509_LOGIN_BUTTON_IN_SIGN_IN_WIDGET FF', () => {
    const databag = {
      featureFlags: ['some-random-ff'],
      showX509button: true,
      i18n: {
        pivCardButton: 'mock-pivCardButton',
        idpBasedPivCardButton: 'mock-idpBasedPivCardButton',
      },
    } as Databag;

    it('uses pivCardButton value when not has FF IDP_BASED_SIGN_ON_POLICY', () => {
      expect(getCustomButtons(databag)).toMatchInlineSnapshot(`
        [
          {
            "className": "",
            "click": [Function],
            "title": "mock-pivCardButton",
          },
        ]
      `);
    });

    it('uses pivCardButton value when has FF IDENTITY_ENGINE', () => {
      const updatedDatabag = {
        ...databag,
        featureFlags: ['IDENTITY_ENGINE']
      };
      expect(getCustomButtons(updatedDatabag)).toMatchInlineSnapshot(`
        [
          {
            "className": "",
            "click": [Function],
            "title": "mock-pivCardButton",
          },
        ]
      `);
    });

    it('uses idpBasedPivCardButton value when has FF IDP_BASED_SIGN_ON_POLICY, but not has FF IDENTITY_ENGINE', () => {
      const updatedDatabag = {
        ...databag,
        featureFlags: ['IDP_BASED_SIGN_ON_POLICY']
      };
      expect(getCustomButtons(updatedDatabag)).toMatchInlineSnapshot(`
        [
          {
            "className": "idp-piv-button",
            "click": [Function],
            "title": "mock-idpBasedPivCardButton",
          },
        ]
      `);
    });
  });
});
