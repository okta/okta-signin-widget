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

import { OV_OVERRIDE_MESSAGE_KEY } from 'src/constants';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import { FormBag, MessageTypeVariant, WidgetProps } from 'src/types';

import { transformCustomMessages } from './transformCustomMessages';

describe('Enroll Authenticator Selector Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const mockProps: WidgetProps = {};
  let formBag: FormBag;

  beforeEach(() => {
    formBag = {
      schema: {
        properties: {
          authenticator: {},
        },
      },
      uischema: {
        type: 'VerticalLayout',
        elements: [],
      },
    };
  });

  it('should not update formBag when no messages exist in the transaction', () => {
    expect(transformCustomMessages(transaction, formBag, mockProps)).toEqual(formBag);
  });

  it('should not update formBag when messages in transaction are not to be customized', () => {
    transaction.messages = [
      {
        message: 'This is a standard message',
        class: 'ERROR',
        i18n: { key: 'some.standard.key' },
      },
    ];
    expect(transformCustomMessages(transaction, formBag, mockProps)).toEqual(formBag);
  });

  it('should add title when fips compliance message key exists in transaction', () => {
    transaction.messages = [
      {
        message: 'Force FIPS compliance upgrade key ios message.',
        class: 'ERROR',
        i18n: { key: OV_OVERRIDE_MESSAGE_KEY.OV_FORCE_FIPS_COMPLIANCE_UPGRAGE_KEY_IOS },
      },
    ];
    const updatedFormBag = transformCustomMessages(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].options?.contentType).toBe('string');
    expect(updatedFormBag.uischema.elements[0].options?.class)
      .toBe(MessageTypeVariant.ERROR);
    expect(updatedFormBag.uischema.elements[0].options?.message)
      .toBe('Force FIPS compliance upgrade key ios message.');
    expect(updatedFormBag.uischema.elements[0].options?.title)
      .toBe('oie.okta_verify.enroll.force.upgrade.title');
  });

  it('should add title when OV QR enroll biometrics key exists in transaction', () => {
    transaction.messages = [
      {
        message: 'OV Enroll Biometrics key message.',
        class: 'ERROR',
        i18n: { key: OV_OVERRIDE_MESSAGE_KEY.OV_QR_ENROLL_ENABLE_BIOMETRICS_KEY },
      },
    ];
    const updatedFormBag = transformCustomMessages(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].options?.contentType).toBe('string');
    expect(updatedFormBag.uischema.elements[0].options?.class)
      .toBe(MessageTypeVariant.ERROR);
    expect(updatedFormBag.uischema.elements[0].options?.message)
      .toBe('OV Enroll Biometrics key message.');
    expect(updatedFormBag.uischema.elements[0].options?.title)
      .toBe('oie.authenticator.app.method.push.enroll.enable.biometrics.title');
  });
});
