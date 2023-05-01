/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import {
  AuthSdkError, IdxStatus, IdxTransaction, TokenResponse,
} from '@okta/okta-auth-js';
import { waitFor } from '@testing-library/preact';
import { renderHook } from '@testing-library/preact-hooks';

import { ClockDriftError, RecoverableError, UserNotAssignedError } from '../../../util/OAuthErrors';
import { getStubTransaction, getStubTransactionWithNextStep } from '../mocks/utils/utils';
import { DescriptionElement, RedirectElement, WidgetProps } from '../types';
import { useInteractionCodeFlow } from './useInteractionCodeFlow';

describe('interactionCodeFlow Hook Tests', () => {
  let transaction: IdxTransaction;
  let mockAuthClient: any;
  let widgetProps: WidgetProps;
  const mockClearMetaFn = jest.fn();
  const mockSavedTransactionMeta = jest.fn();
  const mockOnSuccessCallback = jest.fn();
  const mockOnErrorCallback = jest.fn();

  beforeEach(() => {
    mockClearMetaFn.mockReset();
    mockSavedTransactionMeta.mockReset();
    mockOnSuccessCallback.mockReset();
    mockOnErrorCallback.mockReset();

    transaction = getStubTransaction(IdxStatus.TERMINAL);
    transaction.messages = undefined;
    widgetProps = {
      baseUrl: 'https://okta1.com',
      clientId: 'abc1234',
      issuer: 'https://okta1.com/oauth2/default',
      scopes: ['openid', 'profile', 'email'],
      authScheme: 'Oauth2',
    };
    transaction.interactionCode = 'abcde12345';
    transaction.meta = { urls: { issuer: '' }, interactionHandle: '123456abcdef' };
    mockAuthClient = {
      options: { state: 'abc123' },
      idx: {
        clearTransactionMeta: () => mockClearMetaFn(),
        getSavedTransactionMeta: () => mockSavedTransactionMeta(),
      },
      token: {
        exchangeCodeForTokens: () => jest.fn(),
      },
    };
    widgetProps.authClient = mockAuthClient;
  });

  it('should return throw error when authClient is not defined', () => {
    widgetProps.authClient = undefined;
    const { result } = renderHook(() => useInteractionCodeFlow(
      transaction, widgetProps, mockOnSuccessCallback, mockOnErrorCallback,
    ));
    expect(result.error).toEqual(Error('authClient is required'));
  });

  it('should return undefined when transaction is undefined', () => {
    const { result } = renderHook(() => useInteractionCodeFlow(
      undefined, widgetProps, mockOnSuccessCallback, mockOnErrorCallback,
    ));
    expect(result.current).toBeUndefined();
  });

  it('should return undefined when transaction status is PENDING', () => {
    transaction = getStubTransaction(IdxStatus.PENDING);
    const { result } = renderHook(() => useInteractionCodeFlow(
      transaction, widgetProps, mockOnSuccessCallback, mockOnErrorCallback,
    ));
    expect(result.current).toBeUndefined();
  });

  it('should return undefined when transaction contains a next step', () => {
    transaction = getStubTransactionWithNextStep();
    const { result } = renderHook(() => useInteractionCodeFlow(
      transaction, widgetProps, mockOnSuccessCallback, mockOnErrorCallback,
    ));
    expect(result.current).toBeUndefined();
  });

  it('should return undefined when oauth2 is not enabled', () => {
    widgetProps.authScheme = '';
    const { result } = renderHook(() => useInteractionCodeFlow(
      transaction, widgetProps, mockOnSuccessCallback, mockOnErrorCallback,
    ));
    expect(result.current).toBeUndefined();
  });

  it('should return undefined when transaction does not contain interaction code', () => {
    transaction.interactionCode = '';
    const { result } = renderHook(() => useInteractionCodeFlow(
      transaction, widgetProps, mockOnSuccessCallback, mockOnErrorCallback,
    ));
    expect(result.current).toBeUndefined();
  });

  it('should call onSuccess callback when options has remediation mode enabled', () => {
    widgetProps.codeChallenge = 'remediation';
    mockSavedTransactionMeta.mockReturnValue({ urls: { issuer: '' }, interactionHandle: '123456abcdef' });
    const { result } = renderHook(() => useInteractionCodeFlow(
      transaction, widgetProps, mockOnSuccessCallback, mockOnErrorCallback,
    ));

    expect(result.current).toBeUndefined();
    expect(mockClearMetaFn).toHaveBeenCalled();
    expect(mockOnSuccessCallback).toHaveBeenCalledWith({
      status: 'SUCCESS',
      interaction_code: 'abcde12345',
      state: 'abc123',
    });
  });

  it('should throw error when options contains redirect = "always" but no redirectUri defined', () => {
    widgetProps.redirect = 'always';
    mockSavedTransactionMeta.mockReturnValue({ urls: { issuer: '' }, interactionHandle: '123456abcdef' });

    expect(() => {
      renderHook(() => useInteractionCodeFlow(
        transaction, widgetProps, mockOnSuccessCallback, mockOnErrorCallback,
      ));
    }).toThrow('redirectUri is required');
  });

  it('should create form with redirect element when options contains redirect = "always"', () => {
    widgetProps.redirect = 'always';
    widgetProps.redirectUri = 'http://localhost:3000/success';
    mockSavedTransactionMeta.mockReturnValue({ urls: { issuer: '' }, interactionHandle: '123456abcdef' });
    const { result } = renderHook(() => useInteractionCodeFlow(
      transaction, widgetProps, mockOnSuccessCallback, mockOnErrorCallback,
    ));

    expect(result.current?.uischema.elements?.length).toBe(2);
    expect(result.current?.uischema.elements).toEqual([
      {
        type: 'Description',
        contentType: 'subtitle',
        options: { content: 'oie.success.text.signingIn.with.ellipsis' },
      } as DescriptionElement,
      {
        type: 'Redirect',
        options: { url: 'http://localhost:3000/success?interaction_code=abcde12345&state=abc123' },
      } as RedirectElement,
    ]);
  });

  it('should throw error when transactionMeta is not defined', () => {
    mockSavedTransactionMeta.mockReturnValue(undefined);

    expect(() => {
      renderHook(() => useInteractionCodeFlow(
        transaction, widgetProps, mockOnSuccessCallback, mockOnErrorCallback,
      ));
    }).toThrow('Could not load transaction data from storage');
  });

  it('should call onSuccess when exchanging for tokens', async () => {
    const mockTokens: TokenResponse = {
      tokens: {
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
      },
      state: 'abcd1234',
    };
    widgetProps.authClient!.token.exchangeCodeForTokens = (() => new Promise((resolve) => {
      resolve(mockTokens);
    }));
    mockSavedTransactionMeta.mockReturnValue({ urls: { issuer: '' }, interactionHandle: '123456abcdef', codeVerifier: 'lmnopqrstuv09876543' });
    const { result } = renderHook(() => useInteractionCodeFlow(
      transaction, widgetProps, mockOnSuccessCallback, mockOnErrorCallback,
    ));

    expect(result.current).toBeUndefined();
    await waitFor(() => {
      expect(mockClearMetaFn).toHaveBeenCalled();
      expect(mockOnSuccessCallback).toHaveBeenCalledWith({
        tokens: mockTokens.tokens,
        status: 'SUCCESS',
      });
      expect(mockOnErrorCallback).not.toHaveBeenCalled();
    });
  });

  it('should call onError when exchanging for tokens encounters an unexpected error', async () => {
    widgetProps.authClient!.token.exchangeCodeForTokens = (() => new Promise((resolve, reject) => {
      const error = new AuthSdkError('Unexpected error encountered');
      error.errorCode = 'unexpected';
      error.errorSummary = 'An unexpected error occurred, please try again';
      reject(error);
    }));
    mockSavedTransactionMeta.mockReturnValue({ urls: { issuer: '' }, interactionHandle: '123456abcdef', codeVerifier: 'lmnopqrstuv09876543' });
    const { result } = renderHook(() => useInteractionCodeFlow(
      transaction, widgetProps, mockOnSuccessCallback, mockOnErrorCallback,
    ));

    expect(result.current).toBeUndefined();
    await waitFor(() => {
      expect(mockClearMetaFn).toHaveBeenCalled();
      expect(mockOnErrorCallback).toHaveBeenCalledWith(new RecoverableError(
        new AuthSdkError('Unexpected error encountered'), Object,
      ));
      expect(mockOnSuccessCallback).not.toHaveBeenCalled();
    });
  });

  it('should call onError and display message when exchanging for tokens encounters an inline type error', async () => {
    widgetProps.authClient!.token.exchangeCodeForTokens = (() => new Promise((resolve, reject) => {
      const error = new AuthSdkError('Access denied');
      error.errorCode = 'access_denied';
      error.errorSummary = 'You are not authorized to access this app';
      reject(error);
    }));
    mockSavedTransactionMeta.mockReturnValue({ urls: { issuer: '' }, interactionHandle: '123456abcdef', codeVerifier: 'lmnopqrstuv09876543' });
    const { result } = renderHook(() => useInteractionCodeFlow(
      transaction, widgetProps, mockOnSuccessCallback, mockOnErrorCallback,
    ));

    await waitFor(() => {
      expect(result.current?.uischema.elements).toEqual([{
        type: 'InfoBox',
        options: {
          message: {
            class: 'ERROR',
            i18n: { key: '' },
            message: 'You are not authorized to access this app',
          },
          class: 'ERROR',
        },
      }]);
      expect(mockClearMetaFn).toHaveBeenCalled();
      expect(mockOnErrorCallback).toHaveBeenCalledWith(new UserNotAssignedError(
        new AuthSdkError('Access denied'),
      ));
      expect(mockOnSuccessCallback).not.toHaveBeenCalled();
    });
  });

  it('should call onError and display message when exchanging for tokens encounters a terminal type error', async () => {
    widgetProps.authClient!.token.exchangeCodeForTokens = (() => new Promise((resolve, reject) => {
      const error = new AuthSdkError('The JWT was issued in the future');
      error.errorCode = 'INTERNAL';
      error.errorSummary = 'The JWT was issued in the future';
      reject(error);
    }));
    mockSavedTransactionMeta.mockReturnValue({ urls: { issuer: '' }, interactionHandle: '123456abcdef', codeVerifier: 'lmnopqrstuv09876543' });

    const { result } = renderHook(() => useInteractionCodeFlow(
      transaction, widgetProps, mockOnSuccessCallback, mockOnErrorCallback,
    ));

    await waitFor(() => {
      expect(result.current?.uischema.elements).toEqual([{
        type: 'InfoBox',
        options: {
          message: {
            class: 'ERROR',
            i18n: { key: '' },
            message: 'error.unsynced.clock',
          },
          class: 'ERROR',
        },
      }]);
      expect(mockClearMetaFn).toHaveBeenCalled();
      expect(mockOnErrorCallback).toHaveBeenCalledWith(new ClockDriftError(
        new AuthSdkError('The JWT was issued in the future'),
      ));
      expect(mockOnSuccessCallback).not.toHaveBeenCalled();
    });
  });
});
