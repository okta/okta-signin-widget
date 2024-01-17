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

import { IdxAuthenticator, IdxTransaction } from '@okta/okta-auth-js';
import { AUTHENTICATOR_KEY, IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  AuthenticatorButtonElement,
  AuthenticatorButtonListElement,
  ButtonElement,
  ButtonType,
  FormBag,
  TitleElement,
  TranslationInfo,
  WidgetProps,
} from 'src/types';

import { transformAuthenticatorButton } from './transformAuthenticatorButton';

describe('Authenticator Button transformer tests', () => {
  let transaction: IdxTransaction;
  let formBag: FormBag;
  let widgetProps: WidgetProps;

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    formBag = getStubFormBag();
    formBag.uischema.elements = [
      { type: 'Title', options: { content: 'Sign in' } } as TitleElement,
      {
        type: 'AuthenticatorButtonList',
        options: {
          buttons: [
            {
              type: 'AuthenticatorButton',
              label: 'Okta Email',
              options: { key: AUTHENTICATOR_KEY.EMAIL, ctaLabel: 'Verify' },
            } as AuthenticatorButtonElement,
          ],
        },
      } as AuthenticatorButtonListElement,
      { type: 'Button', options: { type: ButtonType.SUBMIT } } as ButtonElement,
    ];
    widgetProps = {};
  });

  it('should add translations for Email Authenticator button', () => {
    transaction.nextStep = {
      name: IDX_STEP.SELECT_AUTHENTICATOR_ENROLL,
      relatesTo: { type: '', value: { key: AUTHENTICATOR_KEY.EMAIL } as IdxAuthenticator },
    };
    const updatedFormBag = transformAuthenticatorButton({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(((updatedFormBag.uischema.elements[1] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement).translations?.length)
      .toBe(1);
    expect(((updatedFormBag.uischema.elements[1] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement).translations)
      .toEqual([{ name: 'label', i18nKey: 'oie.email.label', value: 'oie.email.label' } as TranslationInfo]);
  });

  it('should add translations for OV button with Method type', () => {
    transaction.nextStep = {
      name: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
      relatesTo: { type: '', value: { key: AUTHENTICATOR_KEY.OV } as IdxAuthenticator },
    };
    formBag.uischema.elements = [
      { type: 'Title', options: { content: 'Sign in' } } as TitleElement,
      {
        type: 'AuthenticatorButtonList',
        options: {
          buttons: [
            {
              type: 'AuthenticatorButton',
              label: 'Okta Verify',
              options: {
                key: AUTHENTICATOR_KEY.OV,
                ctaLabel: 'Verify',
                actionParams: { 'authenticator.methodType': 'push' },
              } as unknown as AuthenticatorButtonElement['options'],
            } as AuthenticatorButtonElement,
          ],
        },
      } as AuthenticatorButtonListElement,
      { type: 'Button', options: { type: ButtonType.SUBMIT } } as ButtonElement,
    ];
    const updatedFormBag = transformAuthenticatorButton({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(((updatedFormBag.uischema.elements[1] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement).translations?.length)
      .toBe(1);
    expect(((updatedFormBag.uischema.elements[1] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement).translations)
      .toEqual([{
        name: 'description', i18nKey: 'oie.okta_verify.push.title', value: 'oie.okta_verify.push.title',
      } as TranslationInfo]);
  });

  it('should add translations for Custom Authenticator button', () => {
    transaction.nextStep = {
      name: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
      relatesTo: { type: '', value: { key: AUTHENTICATOR_KEY.CUSTOM_APP } as IdxAuthenticator },
    };
    formBag.uischema.elements = [
      { type: 'Title', options: { content: 'Sign in' } } as TitleElement,
      {
        type: 'AuthenticatorButtonList',
        options: {
          buttons: [
            {
              type: 'AuthenticatorButton',
              label: 'My custom authenticator app',
              options: {
                key: AUTHENTICATOR_KEY.CUSTOM_APP,
                ctaLabel: 'Verify',
              } as unknown as AuthenticatorButtonElement['options'],
            } as AuthenticatorButtonElement,
          ],
        },
      } as AuthenticatorButtonListElement,
      { type: 'Button', options: { type: ButtonType.SUBMIT } } as ButtonElement,
    ];
    const updatedFormBag = transformAuthenticatorButton({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(((updatedFormBag.uischema.elements[1] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement).translations?.length)
      .toBe(1);
    expect(((updatedFormBag.uischema.elements[1] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement).translations)
      .toEqual([{
        name: 'description', i18nKey: 'oie.custom.app.authenticator.title', value: 'oie.custom.app.authenticator.title',
      } as TranslationInfo]);
  });
});
