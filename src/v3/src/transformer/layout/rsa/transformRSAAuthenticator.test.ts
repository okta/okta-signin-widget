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

import { IdxTransaction } from '@okta/okta-auth-js';
import {
  ButtonElement,
  ButtonType,
  FieldElement, FormBag, TitleElement, WidgetProps,
} from 'src/types';

import { ON_PREM_TOKEN_CHANGE_ERROR_KEY } from '../../../constants';
import { getStubFormBag, getStubTransactionWithNextStep } from '../../../mocks/utils/utils';
import * as locUtils from '../../../util/locUtil';
import { transformRSAAuthenticator } from './transformRSAAuthenticator';

describe('transformRSAAuthenticator tests', () => {
  let transaction: IdxTransaction;
  let widgetProps: WidgetProps;
  let formBag: FormBag;

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    widgetProps = {};
    formBag = getStubFormBag();
    formBag.uischema.elements = [
      {
        type: 'Field',
        options: { inputMeta: { name: 'credentials.clientData', value: 'rsa_username' } },
      } as FieldElement,
      {
        type: 'Field',
        options: { inputMeta: { name: 'credentials.passcode', secret: true } },
      } as FieldElement,
    ];
  });

  it.each`
    rawIdxState                                                                                   | stepName                      | titleKey                      | titleKeyParams
    ${{ currentAuthenticatorEnrollment: { type: 'object', value: { displayName: 'SecureID' } } }} | ${'challenge-authenticator'}  | ${'oie.on_prem.verify.title'} | ${['SecureID']}
    ${{ currentAuthenticator: { type: 'object', value: { displayName: 'SecureID' } } }}           | ${'enroll-authenticator'}     | ${'oie.on_prem.enroll.title'} | ${['SecureID']}
    ${{}}                                                                                         | ${'challenge-authenticator'}  | ${'oie.on_prem.verify.title'} | ${['oie.on_prem.authenticator.default.vendorName']}
    ${{}}                                                                                         | ${'enroll-authenticator'}     | ${'oie.on_prem.enroll.title'} | ${['oie.on_prem.authenticator.default.vendorName']}
  `('should add appropriate title and button elements for RSA Remediation step: $stepName with titleKey: $titleKey and titleKeyParams: $titleKeyParams', ({
    rawIdxState, stepName, titleKey, titleKeyParams,
  }) => {
    const locSpy = jest.spyOn(locUtils, 'loc');
    transaction.rawIdxState = rawIdxState;
    transaction.nextStep = { ...transaction.nextStep, name: stepName };
    const updatedFormBag = transformRSAAuthenticator({ transaction, widgetProps, formBag });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe(titleKey);
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('credentials.clientData');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options.inputMeta.name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('mfa.challenge.verify');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
    expect(updatedFormBag.data['credentials.clientData']).toBe('rsa_username');
    expect(locSpy).toHaveBeenCalledWith(titleKey, 'login', titleKeyParams);
  });

  it('should clear password field when change token error is present in transaction', () => {
    transaction.messages = [{
      message: 'Wait for token to change.',
      class: 'ERROR',
      i18n: { key: ON_PREM_TOKEN_CHANGE_ERROR_KEY },
    }];
    formBag.data['credentials.passcode'] = 'abcd1234!';

    const updatedFormBag = transformRSAAuthenticator({ transaction, widgetProps, formBag });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.data['credentials.passcode']).toBe('');
  });
});
