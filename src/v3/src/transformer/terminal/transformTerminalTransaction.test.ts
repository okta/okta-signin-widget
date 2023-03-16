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

import { IdxContext, IdxStatus, IdxTransaction } from '@okta/okta-auth-js';
import {
  FormBag,
  LinkElement,
  SuccessCallback,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { TERMINAL_KEY, TERMINAL_TITLE_KEY } from '../../constants';
import { getStubTransaction } from '../../mocks/utils/utils';
import { removeUsernameCookie, setUsernameCookie } from '../../util';
import { transformTerminalTransaction } from '.';
import { transformOdaEnrollment } from './odaEnrollment/transformOdaEnrollment';

const getMockMessage = (message: string, className: string, key: string) => ({
  message,
  class: className,
  i18n: {
    key,
  },
});

jest.mock('./transformTerminalMessages', () => ({
  transformTerminalMessages: (transaction: IdxTransaction, formBag: FormBag) => formBag,
}));

jest.mock('./odaEnrollment/transformOdaEnrollment', () => ({
  transformOdaEnrollment: jest.fn(),
}));

jest.mock('../redirect', () => ({
  redirectTransformer: jest.fn().mockReturnValue({}),
}));

jest.mock('../../util', () => {
  const originalUtil = jest.requireActual('../../util');
  return {
    ...originalUtil,
    setUsernameCookie: jest.fn().mockImplementation(() => {}),
    removeUsernameCookie: jest.fn().mockImplementation(() => {}),
  };
});

describe('Terminal Transaction Transformer Tests', () => {
  let transaction: IdxTransaction;
  let mockAuthClient: any;
  let widgetProps: WidgetProps;
  const mockBootstrapFn = jest.fn();

  beforeEach(() => {
    transaction = getStubTransaction(IdxStatus.TERMINAL);
    transaction.messages = [];
    widgetProps = {};
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Interaction code flow & Redirection Tests', () => {
    const mockClearMetaFn = jest.fn();
    const mockTokens = {
      accessToken: {
        accessToken: 'abc123456',
        claims: { sub: '', user: true },
        authorizeUrl: 'acme.okta1.com',
        scopes: ['admin'],
        expiresAt: 1234567,
        tokenType: 'id',
        userinfoUrl: 'acme.okta1.com/userinfo',
      },
      idToken: {
        issuer: 'okta',
        clientId: 'abcdefth',
        idToken: '1234567asdfghj',
        claims: { sub: '', user: true },
        authorizeUrl: 'acme.okta1.com',
        scopes: ['admin'],
        expiresAt: 1234567,
      },
    };
    beforeEach(() => {
      transaction.messages = undefined;
      transaction.meta = { urls: { issuer: '' }, interactionHandle: '123456abcdef' };
      mockAuthClient = {
        options: { state: 'abc123' },
        idx: {
          clearTransactionMeta: mockClearMetaFn,
          getSavedTransactionMeta: () => undefined,
        },
      };
    });

    it('should add successCallback renderer for interaction code flow', () => {
      transaction.tokens = mockTokens;
      transaction.interactionCode = '123456789aabbcc';
      widgetProps = {
        authClient: mockAuthClient, useInteractionCodeFlow: true,
      };
      const formBag = transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);

      expect(formBag).toMatchSnapshot();
      expect(formBag.uischema.elements.length).toBe(2);
      expect(formBag.uischema.elements[0].type).toBe('Spinner');
      expect(formBag.uischema.elements[1].type).toBe('SuccessCallback');
      expect((formBag.uischema.elements[1] as SuccessCallback).options?.data)
        .toEqual({ status: IdxStatus.SUCCESS, tokens: mockTokens });
    });

    it('should add successCallback renderer for interaction code flow in remediation mode', () => {
      transaction.tokens = mockTokens;
      transaction.interactionCode = '123456789aabbcc';
      widgetProps = {
        authClient: mockAuthClient,
        useInteractionCodeFlow: true,
        codeChallenge: 'bbccdde',
      };
      const formBag = transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);

      expect(formBag).toMatchSnapshot();
      expect(formBag.uischema.elements.length).toBe(2);
      expect(formBag.uischema.elements[0].type).toBe('Spinner');
      expect(formBag.uischema.elements[1].type).toBe('SuccessCallback');
      expect((formBag.uischema.elements[1] as SuccessCallback).options?.data)
        .toEqual({
          status: IdxStatus.SUCCESS,
          interaction_code: transaction.interactionCode,
          state: mockAuthClient.options.state,
        });
      expect(mockClearMetaFn).toHaveBeenCalled();
    });

    it('should throw error when in interaction code flow and missing transaction meta', () => {
      transaction.meta = undefined;
      transaction.interactionCode = '123456789aabbcc';
      widgetProps = {
        authClient: mockAuthClient, useInteractionCodeFlow: true,
      };
      expect(() => {
        transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);
      }).toThrow('Could not load transaction data from storage');
    });

    it('should call redirect Transformer funcion when interaction code flow requires redirection', () => {
      transaction.interactionCode = '123456789aabbcc';
      widgetProps = {
        authClient: mockAuthClient,
        useInteractionCodeFlow: true,
        redirectUri: 'http://acme.okta1.com',
        redirect: 'always',
      };
      const formBag = transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);

      expect(formBag).toEqual({});
    });

    it('should throw error when interaction code flow requires redirection but missing redirect URI', () => {
      transaction.interactionCode = '123456789aabbcc';
      widgetProps = {
        authClient: mockAuthClient,
        useInteractionCodeFlow: true,
        redirect: 'always',
      };
      expect(() => {
        transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);
      }).toThrow('redirectUri is required');
    });

    it('should call redirect Transformer funcion when transaction context contains success redirect href', () => {
      transaction.context = {
        ...transaction.context,
        success: {
          name: 'success',
          href: 'http://acme.okta1.com',
        },
      };
      widgetProps = { authClient: mockAuthClient };
      const formBag = transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);

      expect(formBag).toEqual({});
    });

    it('should throw error when transaction doesnt contain messages and useInteractionCodeFlow is not provided', () => {
      transaction.interactionCode = '123456789aabbcc';
      widgetProps = {
        authClient: mockAuthClient,
        redirect: 'always',
      };
      expect(() => {
        transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);
      }).toThrow('Set "useInteractionCodeFlow" to true in configuration to enable the '
        + 'interaction_code" flow for self-hosted widget.');
    });
  });

  it('should add back to signin element when transaction contains API error', () => {
    const mockErrorMessage = 'This is a mock error message';
    transaction.error = {
      errorSummary: mockErrorMessage,
    };
    const formBag = transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);

    expect(formBag).toMatchSnapshot();
    expect(formBag.uischema.elements.length).toBe(1);
    expect(formBag.uischema.elements[0].type).toBe('Link');
    expect((formBag.uischema.elements[0] as LinkElement).options?.label).toBe('goback');
  });

  it('should add title when terminal key indicates to return to orig tab', () => {
    const mockErrorMessage = 'Test error message';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'INFO',
      TERMINAL_KEY.RETURN_TO_ORIGINAL_TAB_KEY,
    ));
    const formBag = transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);

    expect(formBag).toMatchSnapshot();
    expect(formBag.uischema.elements.length).toBe(1);
    expect(formBag.uischema.elements[0].type).toBe('Title');
    expect((formBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe(TERMINAL_TITLE_KEY[TERMINAL_KEY.RETURN_TO_ORIGINAL_TAB_KEY]);
  });

  it('should add title and back to signin elements for link expired message key', () => {
    const mockErrorMessage = 'Test error message';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'INFO',
      TERMINAL_KEY.RETURN_LINK_EXPIRED_KEY,
    ));
    const formBag = transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);

    expect(formBag).toMatchSnapshot();
    expect(formBag.uischema.elements.length).toBe(2);
    expect(formBag.uischema.elements[0].type).toBe('Title');
    expect((formBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe(TERMINAL_TITLE_KEY[TERMINAL_KEY.RETURN_LINK_EXPIRED_KEY]);
    expect(formBag.uischema.elements[1].type).toBe('Link');
    expect((formBag.uischema.elements[1] as LinkElement).options?.label).toBe('goback');
  });

  it('should add title and skip setup link for'
    + ' idx.error.server.safe.mode.enrollment.unavailable message key', () => {
    const mockErrorMessage = 'Set up is temporarily unavailable due to server maintenance. Try again later.';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'ERROR',
      'idx.error.server.safe.mode.enrollment.unavailable',
    ));
    transaction.availableSteps = [{ name: 'skip', action: jest.fn() }];
    const formBag = transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);

    expect(formBag).toMatchSnapshot();
    expect(formBag.uischema.elements.length).toBe(2);
    expect(formBag.uischema.elements[0].type).toBe('Title');
    expect((formBag.uischema.elements[0] as TitleElement).options?.content).toBe('oie.safe.mode.title');
    expect(formBag.uischema.elements[1].type).toBe('Link');
    expect((formBag.uischema.elements[1] as LinkElement).options.label).toBe('oie.enroll.skip.setup');
    expect((
      formBag.uischema.elements[1] as LinkElement
    ).options?.step).toBe('skip');
  });

  it('should add title only for idx.error.server.safe.mode.enrollment.unavailable'
    + ' message key when intent is "CREDENTIAL_ENROLLMENT"', () => {
    const mockErrorMessage = 'Set up is temporarily unavailable due to server maintenance. Try again later.';
    transaction.context.intent = 'CREDENTIAL_ENROLLMENT';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'ERROR',
      'idx.error.server.safe.mode.enrollment.unavailable',
    ));
    const formBag = transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);

    expect(formBag).toMatchSnapshot();
    expect(formBag.uischema.elements.length).toBe(1);
    expect(formBag.uischema.elements[0].type).toBe('Title');
    expect((formBag.uischema.elements[0] as TitleElement).options?.content).toBe('oie.safe.mode.title');
  });

  it('should add title and try again link for'
    + ' idx.device.not.activated.consent.denied message key', () => {
    const mockErrorMessage = 'Set up is temporarily unavailable due to server maintenance. Try again later.';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'ERROR',
      TERMINAL_KEY.DEVICE_NOT_ACTIVATED_CONSENT_DENIED,
    ));
    const mockHref = 'http://localhost:3000/';
    const mockLocation = jest.spyOn(global, 'location', 'get');
    mockLocation.mockReturnValue(
      { href: mockHref } as unknown as Location,
    );
    const formBag = transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);

    expect(formBag).toMatchSnapshot();
    expect(formBag.uischema.elements.length).toBe(2);
    expect(formBag.uischema.elements[0].type).toBe('Title');
    expect((formBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe(TERMINAL_TITLE_KEY[TERMINAL_KEY.DEVICE_NOT_ACTIVATED_CONSENT_DENIED]);
    expect(formBag.uischema.elements[1].type).toBe('Link');
    expect((formBag.uischema.elements[1] as LinkElement).options?.label).toBe('oie.try.again');
    expect((formBag.uischema.elements[1] as LinkElement).options?.href).toBe(mockHref);
  });

  it('should add title element with message for'
    + ' oie.selfservice.unlock_user.success.message message key', () => {
    const mockErrorMessage = 'Some generic error message';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'INFO',
      TERMINAL_KEY.UNLOCK_ACCOUNT_KEY,
    ));
    const formBag = transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);

    expect(formBag).toMatchSnapshot();
    expect(formBag.uischema.elements.length).toBe(1);
    expect(formBag.uischema.elements[0].type).toBe('Title');
    expect((formBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe(TERMINAL_TITLE_KEY[TERMINAL_KEY.UNLOCK_ACCOUNT_KEY]);
  });

  it('should add back to signin link for tooManyRequests message key when baseUrl not provided', () => {
    const mockIssueOrigin = 'http://localhost:3000/';
    mockAuthClient = { getIssuerOrigin: () => mockIssueOrigin };
    widgetProps = { authClient: mockAuthClient };
    const mockErrorMessage = 'Too many requests';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'ERROR',
      TERMINAL_KEY.TOO_MANY_REQUESTS,
    ));
    const formBag = transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);

    expect(formBag).toMatchSnapshot();
    expect(formBag.uischema.elements.length).toBe(1);
    expect(formBag.uischema.elements[0].type).toBe('Link');
    expect((formBag.uischema.elements[0] as LinkElement).options?.label).toBe('goback');
    expect((formBag.uischema.elements[0] as LinkElement).options?.href).toBe(mockIssueOrigin);
  });

  it('should not add back to sign in link when cancel is not available', () => {
    widgetProps = { features: { hideSignOutLinkInMFA: true } };
    const mockErrorMessage = 'Session expired';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'ERROR',
      TERMINAL_KEY.SESSION_EXPIRED,
    ));
    const formBag = transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);

    expect(formBag.uischema.elements.length).toBe(0);
  });

  it('should add back to sign in link with href when backToSigninUri is set in widget options', () => {
    widgetProps = { backToSignInLink: '/' };
    const mockErrorMessage = 'Session expired';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'ERROR',
      TERMINAL_KEY.SESSION_EXPIRED,
    ));
    const formBag = transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);

    expect(formBag).toMatchSnapshot();
    expect(formBag.uischema.elements.length).toBe(1);
    expect(formBag.uischema.elements[0].type).toBe('Link');
    expect((formBag.uischema.elements[0] as LinkElement).options?.label).toBe('goback');
    expect((formBag.uischema.elements[0] as LinkElement).options?.href).toBe('/');
  });

  it('should set username cookie when successful authentication and rememberMyUsernameOnOIE feature is set', () => {
    const mockIdentifier = 'testUser';
    transaction.context = {
      success: { name: 'success' },
      user: {
        type: 'object',
        value: {
          identifier: mockIdentifier,
        },
      },
    } as unknown as IdxContext;
    widgetProps = {
      features: { rememberMyUsernameOnOIE: true, rememberMe: true },
    };
    transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);

    expect(setUsernameCookie).toHaveBeenCalledWith(mockIdentifier);
  });

  it('should remove username cookie when successful authentication and rememberMyUsernameOnOIE feature is true but rememberMe is false', () => {
    transaction.context = {
      success: { name: 'success' },
      user: {
        type: 'object',
        value: {
          identifier: 'testUser',
        },
      },
    } as unknown as IdxContext;
    widgetProps = {
      features: { rememberMyUsernameOnOIE: true, rememberMe: false },
    };
    transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);

    expect(removeUsernameCookie).toHaveBeenCalled();
  });

  it('should invoke oda enrollment terminal transformer when device enrollment data is present', () => {
    transaction.context = {
      deviceEnrollment: {
        value: {
          name: 'oda',
        },
      },
    } as unknown as IdxContext;
    transformTerminalTransaction(transaction, widgetProps, mockBootstrapFn);

    expect(transformOdaEnrollment).toHaveBeenCalled();
  });
});
