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

import { IdxStatus, IdxTransaction } from '@okta/okta-auth-js';
import { DescriptionElement, InfoboxElement } from 'src/types';

import { TERMINAL_KEY } from '../../constants';
import { getStubFormBag, getStubTransaction } from '../../mocks/utils/utils';
import { transformTerminalMessages } from './transformTerminalMessages';

const getMockMessage = (message: string, className: string, key: string) => ({
  message,
  class: className,
  i18n: {
    key,
  },
});

const customFormBag = {
  schema: {},
  uischema: {
    type: 'VerticalLayout',
    elements: [{ type: 'Description', options: { content: 'something custom' } }],
  },
};
jest.mock('./transformEmailMagicLinkOTPOnlyElements', () => ({
  transformEmailMagicLinkOTPOnly: () => customFormBag,
}));

describe('Terminal Message Transformer Tests', () => {
  let transaction: IdxTransaction;
  const formBag = getStubFormBag();

  beforeEach(() => {
    formBag.uischema.elements = [];
    transaction = getStubTransaction(IdxStatus.TERMINAL);
    transaction.messages = [];
  });

  it('should not add elements when transaction is terminal, has no errors and has no messages', () => {
    expect(transformTerminalMessages(transaction, formBag)).toEqual(formBag);
  });

  it('should add info box & cancel elements when transaction contains API error', () => {
    const mockErrorMessage = 'This is a mock error message';
    transaction.error = {
      errorSummary: mockErrorMessage,
    };
    const updatedFormBag = transformTerminalMessages(transaction, formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe('InfoBox');
    expect((updatedFormBag.uischema.elements[0] as InfoboxElement).options?.message).toEqual({
      class: 'ERROR',
      i18n: { key: 'oform.error.unexpected' },
      message: 'oform.error.unexpected',
    });
    expect((
      updatedFormBag.uischema.elements[0] as InfoboxElement
    ).options?.class).toBe('ERROR');
  });

  it('should transform elements when terminal key indicates to return to orig tab', () => {
    const mockErrorMessage = 'Test error message';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'INFO',
      TERMINAL_KEY.RETURN_TO_ORIGINAL_TAB_KEY,
    ));
    const updatedFormBag = transformTerminalMessages(transaction, formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(2);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[0] as DescriptionElement).options?.content)
      .toBe('oie.consent.enduser.email.allow.description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content).toBe('oie.return.to.original.tab');
  });

  it('should add info box element for generic terminal message key', () => {
    const mockErrorMessage = 'Test error message';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'ERROR',
      'some.test.key',
    ));
    const updatedFormBag = transformTerminalMessages(transaction, formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe('InfoBox');
    expect((
      updatedFormBag.uischema.elements[0] as InfoboxElement
    ).options?.message).toEqual({
      class: 'ERROR',
      i18n: { key: 'some.test.key' },
      message: 'Test error message',
    });
    expect((
      updatedFormBag.uischema.elements[0] as InfoboxElement
    ).options?.class).toBe('ERROR');
  });

  it('should add info Box element for link expired message key', () => {
    const mockErrorMessage = 'Test error message';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'INFO',
      TERMINAL_KEY.RETURN_LINK_EXPIRED_KEY,
    ));
    const updatedFormBag = transformTerminalMessages(transaction, formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe('InfoBox');
    expect((
      updatedFormBag.uischema.elements[0] as InfoboxElement
    ).options?.message).toEqual({
      class: 'ERROR',
      i18n: { key: 'idx.return.link.expired' },
      message: 'idx.return.link.expired',
    });
    expect((
      updatedFormBag.uischema.elements[0] as InfoboxElement
    ).options?.class).toBe('ERROR');
  });

  it('should add Description element with message for'
    + ' oie.selfservice.unlock_user.success.message message key', () => {
    const mockErrorMessage = 'Some generic error message';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'INFO',
      TERMINAL_KEY.UNLOCK_ACCOUNT_KEY,
    ));
    const updatedFormBag = transformTerminalMessages(transaction, formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[0] as DescriptionElement).options?.content)
      .toBe(TERMINAL_KEY.UNLOCK_ACCOUNT_KEY);
  });

  it('should add an Info box and Description elements for'
    + ' idx.operation.cancelled.on.other.device message key', () => {
    const mockErrorMessage = 'Access denied on other device.';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'ERROR',
      TERMINAL_KEY.OPERATION_CANCELED_ON_OTHER_DEVICE_KEY,
    ));
    const updatedFormBag = transformTerminalMessages(transaction, formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(2);
    expect(updatedFormBag.uischema.elements[0].type).toBe('InfoBox');
    expect((
      updatedFormBag.uischema.elements[0] as InfoboxElement
    ).options?.message).toEqual({
      class: 'ERROR',
      i18n: { key: 'idx.operation.cancelled.on.other.device' },
      message: 'idx.operation.cancelled.on.other.device',
    });
    expect((
      updatedFormBag.uischema.elements[0] as InfoboxElement
    ).options?.class).toBe('ERROR');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content).toBe('oie.consent.enduser.deny.description');
  });

  it('should add Info box element with message for tooManyRequests message key', () => {
    const mockErrorMessage = 'Too many requests';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'ERROR',
      TERMINAL_KEY.TOO_MANY_REQUESTS,
    ));
    const updatedFormBag = transformTerminalMessages(transaction, formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe('InfoBox');
    expect((
      updatedFormBag.uischema.elements[0] as InfoboxElement
    ).options?.message).toEqual({
      class: 'ERROR',
      i18n: { key: 'tooManyRequests' },
      message: 'oie.tooManyRequests',
    });
    expect((
      updatedFormBag.uischema.elements[0] as InfoboxElement
    ).options?.class).toBe('ERROR');
  });

  it('should add error Info box element for idx.session.expired message key', () => {
    const mockErrorMessage = 'Session expired';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'INFO',
      TERMINAL_KEY.SESSION_EXPIRED,
    ));
    const updatedFormBag = transformTerminalMessages(transaction, formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe('InfoBox');
    expect((
      updatedFormBag.uischema.elements[0] as InfoboxElement
    ).options?.message).toEqual({
      class: 'ERROR',
      i18n: { key: 'idx.session.expired' },
      message: 'idx.session.expired',
    });
    expect((
      updatedFormBag.uischema.elements[0] as InfoboxElement
    ).options?.class).toBe('ERROR');
  });

  it('should add error Info box element with title for message keys prefixed with core.auth.factor.signedNonce.error', () => {
    const mockErrorMessage = 'Signed nonce error';
    transaction.messages?.push(getMockMessage(
      mockErrorMessage,
      'ERROR',
      'core.auth.factor.signedNonce.error.invalidDevice',
    ));
    const updatedFormBag = transformTerminalMessages(transaction, formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe('InfoBox');
    expect((
      updatedFormBag.uischema.elements[0] as InfoboxElement
    ).options?.message).toEqual({
      class: 'ERROR',
      i18n: { key: 'core.auth.factor.signedNonce.error.invalidDevice' },
      message: 'core.auth.factor.signedNonce.error.invalidDevice',
      title: 'user.fail.verifyIdentity',
    });
    expect((
      updatedFormBag.uischema.elements[0] as InfoboxElement
    ).options?.class).toBe('ERROR');
  });

  it('should return custom formBag when message key contains idx.enter.otp.in.original.tab', () => {
    transaction.messages?.push(getMockMessage(
      'Enter the OTP in your original browser or device.',
      'INFO',
      TERMINAL_KEY.IDX_RETURN_LINK_OTP_ONLY,
    ));

    const updatedFormBag = transformTerminalMessages(transaction, formBag);

    expect(updatedFormBag).toEqual(customFormBag);
  });
});
