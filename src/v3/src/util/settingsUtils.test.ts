/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { IdxTransaction } from '@okta/okta-auth-js';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';

import { WidgetProps } from '../types';
import {
  getBackToSignInUri, getCustomHelpLinks, getDefaultCountryCode, getFactorPageCustomLink,
  getForgotPasswordUri, getHelpLink, getLanguageCode, getPageTitle, getUnlockAccountUri,
  transformIdentifier,
} from './settingsUtils';

jest.mock('../../../util/BrowserFeatures', () => ({
  getUserLanguages: jest.fn().mockReturnValue(['en', 'en-US']),
}));

jest.mock('../../../config/config.json', () => ({
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ok-PL', 'es', 'ko', 'ja', 'nl', 'pt'],
}));

describe('Settings Utils Tests', () => {
  let widgetProps: WidgetProps = {};
  let transaction: IdxTransaction;

  beforeEach(() => {
    widgetProps = { language: 'en' };
    transaction = getStubTransactionWithNextStep();
  });

  it('should return requested language even if it is not a supported language', () => {
    widgetProps.language = 'foobar';

    expect(getLanguageCode(widgetProps)).toBe('foobar');
  });

  it('should return requested language code when other supported languages are available', () => {
    widgetProps.language = 'ok-PL';

    expect(getLanguageCode(widgetProps)).toBe('ok-PL');
  });

  it('should return requested language code when other language prop is provided as a function', () => {
    widgetProps.language = () => ('es');

    expect(getLanguageCode(widgetProps)).toBe('es');
  });

  it('should return "US" as the default country code value when org does not provide a value', () => {
    expect(getDefaultCountryCode(widgetProps)).toBe('US');
  });

  it('should return "US" as the default country code when org provided value is invalid', () => {
    widgetProps.defaultCountryCode = 'ABDC';

    expect(getDefaultCountryCode(widgetProps)).toBe('US');
  });

  it('should return org provided country code as the default value when code is valid', () => {
    widgetProps.defaultCountryCode = 'BW';

    expect(getDefaultCountryCode(widgetProps)).toBe('BW');
  });

  it('should not modify identifier if transform function is not defined', () => {
    const identifier = 'testuser@okta1.com';
    expect(transformIdentifier(widgetProps, 'identify', identifier)).toBe(identifier);
  });

  it('should modify identifier when transform function is defined', () => {
    widgetProps = {
      transformUsername: (username: string) => username.split('@')[0],
    };
    const identifier = 'testuser@okta1.com';
    expect(transformIdentifier(widgetProps, 'identify', identifier)).toBe('testuser');
  });

  it('should return help links', () => {
    widgetProps = {
      baseUrl: 'https://acme.com',
      helpLinks: {
        help: 'https://acme.com/help',
        forgotPassword: 'https://okta.okta.com/signin/forgot-password',
        unlock: 'https://acme.com/unlock-account',
        custom: [
          {
            text: 'What is Okta?',
            href: 'https://acme.com/what-is-okta',
          },
          {
            text: 'Acme Portal',
            href: 'https://acme.com',
            target: '_blank',
          },
        ],
        factorPage: {
          text: 'custom factor page link',
          href: 'https://acme.com/what-is-okta-autheticators',
        },
      },
      backToSignInLink: 'https://okta.okta.com/',
    };
    expect(getHelpLink(widgetProps)).toBe('https://acme.com/help');
    expect(getBackToSignInUri(widgetProps)).toBe('https://okta.okta.com/');
    expect(getForgotPasswordUri(widgetProps)).toBe('https://okta.okta.com/signin/forgot-password');
    expect(getUnlockAccountUri(widgetProps)).toBe('https://acme.com/unlock-account');
    expect(getCustomHelpLinks(widgetProps)).toStrictEqual([
      {
        text: 'What is Okta?',
        href: 'https://acme.com/what-is-okta',
      },
      {
        text: 'Acme Portal',
        href: 'https://acme.com',
        target: '_blank',
      },
    ]);
    expect(getFactorPageCustomLink(widgetProps)).toStrictEqual({
      text: 'custom factor page link',
      href: 'https://acme.com/what-is-okta-autheticators',
    });
  });

  it('should return default help link if `helpLinks.help` is not provided', () => {
    widgetProps = {
      baseUrl: 'https://acme.com',
    };
    expect(getHelpLink(widgetProps)).toBe('https://acme.com/help/login');
  });

  it('should accept `signOutLink` as an alias for `backToSignInLink`', () => {
    widgetProps = {
      signOutLink: 'https://okta.okta.com/',
    };
    expect(getBackToSignInUri(widgetProps)).toBe('https://okta.okta.com/');
  });

  it.each`
    setPageTitle | brandName
    ${undefined} | ${undefined}
    ${undefined} | ${'Acme Inc.'}
    ${true}      | ${undefined}
    ${true}      | ${'Acme Inc.'}
  `('should return default page title when setPageTitle is: $setPageTitle and brandName: $brandName', ({ setPageTitle, brandName }) => {
    const formTitle = 'Sign In';
    widgetProps = { brandName, features: { setPageTitle } };

    const expectedPageTitle: string | undefined = brandName ? `${brandName} | ${formTitle}` : formTitle;
    expect(getPageTitle(widgetProps, formTitle)).toBe(expectedPageTitle);
  });

  it.each`
    brandNameProvided
    ${false}
    ${true}
  `('should not return page title when setPageTitle is false and brandName provided: $brandNameProvided', ({ brandNameProvided }) => {
    const formTitle = 'Sign In';
    const brandName: string | undefined = brandNameProvided && 'Acme Inc.';
    widgetProps = { brandName, features: { setPageTitle: false } };

    expect(getPageTitle(widgetProps, formTitle)).toBeNull();
  });

  it.each`
    setPageTitle
    ${''}
    ${'My custom page title'}
    ${'   '}
  `('should return custom page title when setPageTitle config option is a string: $setPageTitle', ({ setPageTitle }) => {
    const formTitle = 'Sign In';
    widgetProps = { features: { setPageTitle } };

    expect(getPageTitle(widgetProps, formTitle)).toBe(setPageTitle);
  });

  it.each`
    step
    ${'identify'}
    ${'enroll-profile'}
    ${'select-authenticator-enroll'}
  `('should return custom page title when setPageTitle config option is provided as a function and step is: $step', ({ step }) => {
    const DEFAULT_TITLE = 'Deafult page title';
    transaction = {
      ...transaction,
      nextStep: {
        ...transaction.nextStep,
        name: step,
      },
    };
    widgetProps = {
      features: {
        setPageTitle: (context, { formTitle }) => {
          const CONTROLLER_TITLE_MAP: Record<string, string> = {
            'primary-auth': 'Sign In',
            registration: 'Enroll Profile',
          };
          // Use default page title provided by SIW if not in CONTROLLER_TITLE_MAP
          return context.controller && CONTROLLER_TITLE_MAP[context.controller]
            ? CONTROLLER_TITLE_MAP[context.controller]
            : formTitle;
        },
      },
    };

    const EXPECTED_FORM_TITLE_MAP: Record<string, string> = {
      identify: 'Sign In',
      'enroll-profile': 'Enroll Profile',
      'select-authenticator-enroll': DEFAULT_TITLE,
    };
    expect(getPageTitle(widgetProps, DEFAULT_TITLE, transaction))
      .toBe(EXPECTED_FORM_TITLE_MAP[step]);
  });

  it('should not return page title when setPageTitle is set to an invalid value', () => {
    const formTitle = 'Sign In';
    const brandName: string | undefined = 'Acme Inc.';
    // @ts-expect-error forcing invalid value to be passed to setPageTitle for test
    widgetProps = { brandName, features: { setPageTitle: 123 } };

    expect(getPageTitle(widgetProps, formTitle)).toBeNull();
  });
});
