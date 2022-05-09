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

import { ControlElement } from '@jsonforms/core';
import { IdxStatus, IdxTransaction } from '@okta/okta-auth-js';

import { TERMINAL_KEY, TERMINAL_TITLE_KEY } from '../../constants';
import { MessageTypeVariant } from '../../types';
import transformTerminalTransaction from '.';

const getMockMessage = (message: string, className: string, key: string) => ({
  message,
  class: className,
  i18n: {
    key,
  },
});

describe('Terminal Transformer Tests', () => {
  let transaction: IdxTransaction;

  beforeEach(() => {
    transaction = {
      status: IdxStatus.TERMINAL,
      proceed: jest.fn(),
      neededToProceed: [],
      rawIdxState: { version: '', stateHandle: '' },
      actions: {},
      context: {
        version: '',
        stateHandle: '',
        expiresAt: '',
        intent: '',
        currentAuthenticator: {
          type: '',
          value: {
            displayName: '',
            id: '',
            key: '',
            methods: [],
            type: '',
          },
        },
        authenticators: {
          type: '',
          value: [],
        },
        authenticatorEnrollments: {
          type: '',
          value: [],
        },
        enrollmentAuthenticator: {
          type: '',
          value: {
            displayName: '',
            id: '',
            key: '',
            methods: [],
            type: '',
          },
        },
        user: {
          type: '',
          value: {},
        },
        app: {
          type: '',
          value: {},
        },
      },
      messages: [],
    };
  });

  it('should not add elements when transaction is terminal but has no messages', () => {
    const formBag = transformTerminalTransaction(transaction);

    expect(formBag.schema.properties).toEqual({});
    expect(formBag.uischema.elements.length).toBe(1);
    expect(formBag.uischema.elements[0].type).toBe('Link');
  });

  it('should add info box & cancel elements when transaction contains API error', () => {
    const mockErrorMessage = 'This is a mock error message';
    transaction.error = {
      errorSummary: mockErrorMessage,
    };
    const formBag = transformTerminalTransaction(transaction);

    expect(formBag.schema.properties).toEqual({});
    expect(formBag.uischema.elements.length).toBe(2);
    expect(formBag.uischema.elements[0].type).toBe('InfoBox');
    expect(formBag.uischema.elements[0].options?.message).toBe(mockErrorMessage);
    expect(formBag.uischema.elements[0].options?.class).toBe(MessageTypeVariant.ERROR);
    expect(formBag.uischema.elements[1].type).toBe('Link');
  });

  it('should add custom elements when terminal key indicates to return to orig tab', () => {
    const mockErrorMessage = 'Test error message';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'INFO',
      TERMINAL_KEY.RETURN_TO_ORIGINAL_TAB_KEY,
    ));
    const formBag = transformTerminalTransaction(transaction);

    expect(formBag.uischema.elements.length).toBe(3);
    expect(formBag.uischema.elements[0].type).toBe('Title');
    expect(formBag.uischema.elements[0].options?.content)
      .toBe(TERMINAL_TITLE_KEY[TERMINAL_KEY.RETURN_TO_ORIGINAL_TAB_KEY]);
    expect(formBag.uischema.elements[1].type).toBe('Description');
    expect(formBag.uischema.elements[1].options?.content)
      .toBe('oie.consent.enduser.email.allow.description');
    expect(formBag.uischema.elements[2].options?.content).toBe('oie.return.to.original.tab');
  });

  it('should add info box & cancel elements for generic terminal message key', () => {
    const mockErrorMessage = 'Test error message';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'ERROR',
      'some.test.key',
    ));
    const formBag = transformTerminalTransaction(transaction);

    expect(formBag.uischema.elements.length).toBe(2);
    expect(formBag.uischema.elements[0].type).toBe('InfoBox');
    expect(formBag.uischema.elements[0].options?.class).toBe(MessageTypeVariant.ERROR);
    expect(formBag.uischema.elements[1].type).toBe('Link');
  });

  it('should add Informational Box element and cancel element for link expired message key', () => {
    const mockErrorMessage = 'Test error message';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'INFO',
      TERMINAL_KEY.RETURN_LINK_EXPIRED_KEY,
    ));
    const formBag = transformTerminalTransaction(transaction);

    expect(formBag.uischema.elements.length).toBe(3);
    expect(formBag.uischema.elements[0].type).toBe('Title');
    expect(formBag.uischema.elements[0].options?.content)
      .toBe(TERMINAL_TITLE_KEY[TERMINAL_KEY.RETURN_LINK_EXPIRED_KEY]);
    expect(formBag.uischema.elements[1].type).toBe('InfoBox');
    expect(formBag.uischema.elements[1].options?.message).toBe(mockErrorMessage);
    expect(formBag.uischema.elements[1].options?.class).toBe(MessageTypeVariant.ERROR);
    expect(formBag.uischema.elements[2].type).toBe('Link');
    expect(formBag.uischema.elements[2].options?.label).toBe('goback');
  });

  it('should add Info box element with message and skip setup link for'
    + ' idx.error.server.safe.mode.enrollment.unavailable message key', () => {
    const mockErrorMessage = 'Set up is temporarily unavailable due to server maintenance. Try again later.';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'ERROR',
      'idx.error.server.safe.mode.enrollment.unavailable',
    ));
    const formBag = transformTerminalTransaction(transaction);

    expect(formBag.uischema.elements.length).toBe(3);
    expect(formBag.uischema.elements[0].type).toBe('Title');
    expect(formBag.uischema.elements[0].options?.content).toBe('oie.safe.mode.title');
    expect(formBag.uischema.elements[1].type).toBe('InfoBox');
    expect(formBag.uischema.elements[1].options?.message).toBe(mockErrorMessage);
    expect(formBag.uischema.elements[1].options?.class).toBe(MessageTypeVariant.ERROR);
    expect(formBag.uischema.elements[2].type).toBe('Control');
    expect((formBag.uischema.elements[2] as ControlElement).label).toBe('oie.enroll.skip.setup');
    expect(formBag.uischema.elements[2].options?.idxMethod).toBe('proceed');
    expect(formBag.uischema.elements[2].options?.idxMethodParams?.skip).toBeTruthy();
  });

  it('should add Info box element with message and try again link for'
    + ' idx.device.not.activated.consent.denied message key', () => {
    const mockErrorMessage = 'Set up is temporarily unavailable due to server maintenance. Try again later.';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'ERROR',
      TERMINAL_KEY.DEVICE_NOT_ACTIVATED_CONSENT_DENIED,
    ));
    const formBag = transformTerminalTransaction(transaction);

    expect(formBag.uischema.elements.length).toBe(3);
    expect(formBag.uischema.elements[0].type).toBe('Title');
    expect(formBag.uischema.elements[0].options?.content)
      .toBe(TERMINAL_TITLE_KEY[TERMINAL_KEY.DEVICE_NOT_ACTIVATED_CONSENT_DENIED]);
    expect(formBag.uischema.elements[1].type).toBe('InfoBox');
    expect(formBag.uischema.elements[1].options?.message).toBe(mockErrorMessage);
    expect(formBag.uischema.elements[1].options?.class).toBe(MessageTypeVariant.ERROR);
    expect(formBag.uischema.elements[2].type).toBe('Link');
    expect(formBag.uischema.elements[2].options?.label).toBe('oie.try.again');
  });

  it('should add Description element with message for'
    + ' oie.selfservice.unlock_user.success.message message key', () => {
    const mockErrorMessage = 'Some generic error message';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'INFO',
      TERMINAL_KEY.UNLOCK_ACCOUNT_KEY,
    ));
    const formBag = transformTerminalTransaction(transaction);

    expect(formBag.uischema.elements.length).toBe(2);
    expect(formBag.uischema.elements[0].type).toBe('Title');
    expect(formBag.uischema.elements[0].options?.content)
      .toBe(TERMINAL_TITLE_KEY[TERMINAL_KEY.UNLOCK_ACCOUNT_KEY]);
    expect(formBag.uischema.elements[1].type).toBe('Description');
    expect(formBag.uischema.elements[1].options?.content).toBe(TERMINAL_KEY.UNLOCK_ACCOUNT_KEY);
  });

  it('should add an Info box and Description elements for'
    + ' idx.operation.cancelled.on.other.device message key', () => {
    const mockErrorMessage = 'Access denied on other device.';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'ERROR',
      TERMINAL_KEY.OPERATION_CANCELED_ON_OTHER_DEVICE_KEY,
    ));
    const formBag = transformTerminalTransaction(transaction);

    expect(formBag.uischema.elements.length).toBe(2);
    expect(formBag.uischema.elements[0].type).toBe('InfoBox');
    expect(formBag.uischema.elements[0].options?.message).toBe('idx.operation.cancelled.on.other.device');
    expect(formBag.uischema.elements[0].options?.class).toBe(MessageTypeVariant.ERROR);
    expect(formBag.uischema.elements[1].type).toBe('Description');
    expect(formBag.uischema.elements[1].options?.content).toBe('oie.consent.enduser.deny.description');
  });

  it('should add Info box element with message and try again link for'
    + ' tooManyRequests message key', () => {
    const mockErrorMessage = 'Too many requests';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'ERROR',
      TERMINAL_KEY.TOO_MANY_REQUESTS,
    ));
    const formBag = transformTerminalTransaction(transaction);

    expect(formBag.uischema.elements.length).toBe(2);
    expect(formBag.uischema.elements[0].type).toBe('InfoBox');
    expect(formBag.uischema.elements[0].options?.message).toBe('oie.tooManyRequests');
    expect(formBag.uischema.elements[0].options?.class).toBe(MessageTypeVariant.ERROR);
    expect(formBag.uischema.elements[1].type).toBe('Link');
    expect(formBag.uischema.elements[1].options?.label).toBe('goback');
  });
});
