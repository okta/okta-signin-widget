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
import { act } from '@testing-library/preact';
import {
  FormBag,
  LinkElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { TERMINAL_KEY, TERMINAL_TITLE_KEY } from '../../constants';
import { getStubTransaction } from '../../mocks/utils/utils';
import { SessionStorage } from '../../util';
import { redirectTransformer } from '../redirect';
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
    SessionStorage: {
      removeStateHandle: jest.fn(),
    },
    setUsernameCookie: jest.fn().mockImplementation(() => {}),
    removeUsernameCookie: jest.fn().mockImplementation(() => {}),
  };
});

describe('Terminal Transaction Transformer Tests', () => {
  let transaction: IdxTransaction;
  let mockAuthClient: any;
  let widgetProps: Partial<WidgetProps>;
  let windowSpy: jest.SpyInstance<Window>;
  const mockBootstrapFn = jest.fn();

  beforeEach(() => {
    transaction = getStubTransaction(IdxStatus.TERMINAL);
    transaction.messages = [];
    widgetProps = {};
    windowSpy = jest.spyOn(global, 'window', 'get');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    (SessionStorage.removeStateHandle as jest.Mock).mockRestore();
    windowSpy.mockRestore();
  });

  it('should add return empty formbag when interaction code flow transaction', () => {
    transaction.messages = undefined;
    transaction.interactionCode = '123456789aabbcc';
    widgetProps = { clientId: 'abcd1234', authScheme: 'oauth2' };
    const formBag = transformTerminalTransaction(transaction, widgetProps as WidgetProps, mockBootstrapFn);

    expect(formBag).toMatchSnapshot();
    expect(formBag.uischema.elements.length).toBe(0);
  });

  it('should add back to signin element when transaction contains API error', () => {
    const mockErrorMessage = 'This is a mock error message';
    transaction.error = {
      errorSummary: mockErrorMessage,
    };
    const formBag = transformTerminalTransaction(transaction, widgetProps as WidgetProps, mockBootstrapFn);

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
    const formBag = transformTerminalTransaction(transaction, widgetProps as WidgetProps, mockBootstrapFn);

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
    const formBag = transformTerminalTransaction(transaction, widgetProps as WidgetProps, mockBootstrapFn);

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
    const formBag = transformTerminalTransaction(transaction, widgetProps as WidgetProps, mockBootstrapFn);

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
    const formBag = transformTerminalTransaction(transaction, widgetProps as WidgetProps, mockBootstrapFn);

    expect(formBag).toMatchSnapshot();
    expect(formBag.uischema.elements.length).toBe(1);
    expect(formBag.uischema.elements[0].type).toBe('Title');
    expect((formBag.uischema.elements[0] as TitleElement).options?.content).toBe('oie.safe.mode.title');
  });

  it('should add try again link for'
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
    const formBag = transformTerminalTransaction(transaction, widgetProps as WidgetProps, mockBootstrapFn);

    expect(formBag).toMatchSnapshot();
    expect(formBag.uischema.elements.length).toBe(1);
    expect(formBag.uischema.elements[0].type).toBe('Link');
    expect((formBag.uischema.elements[0] as LinkElement).options?.label).toBe('oie.try.again');
    expect((formBag.uischema.elements[0] as LinkElement).options?.href).toBe(mockHref);
  });

  it('should add title element with message for'
    + ' oie.selfservice.unlock_user.success.message message key', () => {
    const mockErrorMessage = 'Some generic error message';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'INFO',
      TERMINAL_KEY.UNLOCK_ACCOUNT_KEY,
    ));
    const formBag = transformTerminalTransaction(transaction, widgetProps as WidgetProps, mockBootstrapFn);

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
    const formBag = transformTerminalTransaction(transaction, widgetProps as WidgetProps, mockBootstrapFn);

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
    const formBag = transformTerminalTransaction(transaction, widgetProps as WidgetProps, mockBootstrapFn);

    expect(formBag.uischema.elements.length).toBe(0);
  });

  it('should clear state and use backToSigninUri', () => {
    // Mock window.location.assign function
    const assignMock: jest.Mock = jest.fn();
    // @ts-expect-error We do not need to fully mock the window object
    windowSpy.mockImplementation(() => ({
      location: {
        assign: assignMock,
      },
    }));

    mockAuthClient = {
      transactionManager: {
        clear: jest.fn(),
      },
    };
    widgetProps = { backToSignInLink: '/', authClient: mockAuthClient };
    const mockErrorMessage = 'Session expired';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'ERROR',
      TERMINAL_KEY.SESSION_EXPIRED,
    ));
    const formBag = transformTerminalTransaction(transaction, widgetProps as WidgetProps, mockBootstrapFn);
    expect(SessionStorage.removeStateHandle).toHaveBeenCalledTimes(1);
    expect(mockAuthClient.transactionManager.clear).toHaveBeenCalledTimes(1);

    expect(formBag).toMatchSnapshot();
    expect(formBag.uischema.elements.length).toBe(1);
    expect(formBag.uischema.elements[0].type).toBe('Link');
    expect((formBag.uischema.elements[0] as LinkElement).options?.label).toBe('goback');
    expect(typeof (formBag.uischema.elements[0] as LinkElement).options?.onClick).toBe('function');
    act(() => {
      (formBag.uischema.elements[0] as LinkElement).options?.onClick?.();
    });
    expect(SessionStorage.removeStateHandle).toHaveBeenCalledTimes(2);
    expect(mockAuthClient.transactionManager.clear).toHaveBeenCalledTimes(2);
    expect(assignMock).toHaveBeenCalledTimes(1);
    expect(assignMock).toHaveBeenCalledWith('/');
  });

  it('should clear state and reload page for verification time out', () => {
    const loginPath = 'http://example.com/login/path';
    // Mock window.location.assign function
    const assignMock: jest.Mock = jest.fn();
    // @ts-expect-error We do not need to fully mock the window object
    windowSpy.mockImplementation(() => ({
      location: {
        href: loginPath,
        assign: assignMock,
      },
    }));

    mockAuthClient = {
      transactionManager: {
        clear: jest.fn(),
      },
    };
    widgetProps = { authClient: mockAuthClient };
    const mockErrorMessage = 'Verification timed out';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'ERROR',
      TERMINAL_KEY.VERIFICATION_TIMED_OUT,
    ));
    const formBag = transformTerminalTransaction(transaction, widgetProps as WidgetProps, mockBootstrapFn);
    expect(SessionStorage.removeStateHandle).toHaveBeenCalledTimes(0);
    expect(mockAuthClient.transactionManager.clear).toHaveBeenCalledTimes(0);

    expect(formBag).toMatchSnapshot();
    expect(formBag.uischema.elements.length).toBe(1);
    expect(formBag.uischema.elements[0].type).toBe('Link');
    expect((formBag.uischema.elements[0] as LinkElement).options?.label).toBe('goback');
    expect(typeof (formBag.uischema.elements[0] as LinkElement).options?.onClick).toBe('function');
    act(() => {
      (formBag.uischema.elements[0] as LinkElement).options?.onClick?.();
    });
    expect(SessionStorage.removeStateHandle).toHaveBeenCalledTimes(1);
    expect(mockAuthClient.transactionManager.clear).toHaveBeenCalledTimes(1);
    expect(assignMock).toHaveBeenCalledTimes(1);
    expect(assignMock).toHaveBeenCalledWith(loginPath);
  });

  it('should invoke oda enrollment terminal transformer when device enrollment data is present', () => {
    transaction.context = {
      deviceEnrollment: {
        value: {
          name: 'oda',
        },
      },
    } as unknown as IdxContext;
    transformTerminalTransaction(transaction, widgetProps as WidgetProps, mockBootstrapFn);

    expect(transformOdaEnrollment).toHaveBeenCalled();
  });

  it('should not invoke redirect transformer when failure href is present and Oauth2 is enabled', () => {
    transaction.context = {
      failure: {
        href: 'www.failure.com',
      },
    } as unknown as IdxContext;
    widgetProps = { clientId: 'abcd1234', authScheme: 'oauth2' };
    transformTerminalTransaction(transaction, widgetProps as WidgetProps, mockBootstrapFn);

    expect(redirectTransformer).not.toHaveBeenCalled();
  });

  it('should invoke redirect transformer when failure redirect href is present in transaction context', () => {
    transaction.context = {
      failure: {
        href: 'www.failure.com',
      },
    } as unknown as IdxContext;
    transformTerminalTransaction(transaction, widgetProps as WidgetProps, mockBootstrapFn);

    expect(redirectTransformer).toHaveBeenCalled();
  });
});
