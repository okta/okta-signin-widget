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
  ButtonElement,
  ButtonType,
  FieldElement,
  FormBag,
  LinkElement,
  ReminderElement,
  TitleElement,
  UISchemaElement,
  WidgetProps,
} from 'src/types';

import * as randomStringUtil from '../../util/generateRandomString';
import { updateElementKeys } from './updateElementKeys';

describe('updateElementKeys Tests', () => {
  let transaction: IdxTransaction;
  let formBag: FormBag;
  let widgetProps: WidgetProps;

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    formBag = getStubFormBag();

    transaction.nextStep!.name = IDX_STEP.CHALLENGE_AUTHENTICATOR;
    formBag.uischema.elements = [
      { type: 'Title', options: { content: 'Sign in' } } as TitleElement,
      { type: 'Field', options: { inputMeta: { name: 'identifier' } } } as FieldElement,
      { type: 'Field', options: { inputMeta: { name: 'credentials.passcode' } } } as FieldElement,
      { type: 'Button', options: { type: ButtonType.SUBMIT } } as ButtonElement,
      { type: 'Link', options: { label: 'Forgot Password' } } as LinkElement,
    ];
    widgetProps = {};
  });

  it('should create unique element key when key value is preset and transaction does not contain authKey/authID', async () => {
    formBag.uischema.elements = formBag.uischema.elements.map(
      (ele: UISchemaElement, index: number) => ({ ...ele, key: `element_key${index}` }),
    );

    const updatedFormBag = updateElementKeys({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe('challenge-authenticator_Title_element_key0');
    expect(elements[1].key)
      .toBe('challenge-authenticator_Field_element_key1');
    expect(elements[2].key)
      .toBe('challenge-authenticator_Field_element_key2');
    expect(elements[3].key)
      .toBe('challenge-authenticator_Button_element_key3');
    expect(elements[4].key)
      .toBe('challenge-authenticator_Link_element_key4');
  });

  it('should create unique element key when key value is not set and transaction does not contain authKey/authID', async () => {
    const updatedFormBag = updateElementKeys({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe('challenge-authenticator_Title');
    expect(elements[1].key)
      .toBe('challenge-authenticator_Field');
    expect(elements[2].key)
      .toBe('challenge-authenticator_Field');
    expect(elements[3].key)
      .toBe('challenge-authenticator_Button');
    expect(elements[4].key)
      .toBe('challenge-authenticator_Link');
  });

  it('should create unique element key when key value is preset and transaction contains authKey', async () => {
    formBag.uischema.elements = formBag.uischema.elements.map(
      (ele: UISchemaElement, index: number) => ({ ...ele, key: `element_key${index}` }),
    );
    transaction.nextStep!.relatesTo = {
      value: { key: AUTHENTICATOR_KEY.EMAIL } as unknown as IdxAuthenticator,
    };

    const updatedFormBag = updateElementKeys({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe('challenge-authenticator_Title_element_key0_okta_email');
    expect(elements[1].key)
      .toBe('challenge-authenticator_Field_element_key1_okta_email');
    expect(elements[2].key)
      .toBe('challenge-authenticator_Field_element_key2_okta_email');
    expect(elements[3].key)
      .toBe('challenge-authenticator_Button_element_key3_okta_email');
    expect(elements[4].key)
      .toBe('challenge-authenticator_Link_element_key4_okta_email');
  });

  it('should create unique element key when key value is not set and transaction contains authKey', async () => {
    const authKey = AUTHENTICATOR_KEY.EMAIL;
    transaction.nextStep!.relatesTo = {
      value: { key: authKey } as unknown as IdxAuthenticator,
    };

    const updatedFormBag = updateElementKeys({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe('challenge-authenticator_Title_okta_email');
    expect(elements[1].key)
      .toBe('challenge-authenticator_Field_okta_email');
    expect(elements[2].key)
      .toBe('challenge-authenticator_Field_okta_email');
    expect(elements[3].key)
      .toBe('challenge-authenticator_Button_okta_email');
    expect(elements[4].key)
      .toBe('challenge-authenticator_Link_okta_email');
  });

  it('should create unique element key when key value is preset and transaction contains authID', async () => {
    formBag.uischema.elements = formBag.uischema.elements.map(
      (ele: UISchemaElement, index: number) => ({ ...ele, key: `element_key${index}` }),
    );
    transaction.rawIdxState.currentAuthenticator = {
      type: '',
      value: {
        id: 'abc1234',
      } as unknown as IdxAuthenticator,
    };

    const updatedFormBag = updateElementKeys({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe('challenge-authenticator_Title_element_key0_abc1234');
    expect(elements[1].key)
      .toBe('challenge-authenticator_Field_element_key1_abc1234');
    expect(elements[2].key)
      .toBe('challenge-authenticator_Field_element_key2_abc1234');
    expect(elements[3].key)
      .toBe('challenge-authenticator_Button_element_key3_abc1234');
    expect(elements[4].key)
      .toBe('challenge-authenticator_Link_element_key4_abc1234');
  });

  it('should create unique element key when key value is not set and transaction contains authID', async () => {
    const authId = 'abc1234';
    transaction.rawIdxState.currentAuthenticator = {
      type: '',
      value: {
        id: authId,
      } as unknown as IdxAuthenticator,
    };

    const updatedFormBag = updateElementKeys({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe('challenge-authenticator_Title_abc1234');
    expect(elements[1].key)
      .toBe('challenge-authenticator_Field_abc1234');
    expect(elements[2].key)
      .toBe('challenge-authenticator_Field_abc1234');
    expect(elements[3].key)
      .toBe('challenge-authenticator_Button_abc1234');
    expect(elements[4].key)
      .toBe('challenge-authenticator_Link_abc1234');
  });

  it('should create unique element key when key value is preset and transaction contains authKey & authID', async () => {
    formBag.uischema.elements = formBag.uischema.elements.map(
      (ele: UISchemaElement, index: number) => ({ ...ele, key: `element_key${index}` }),
    );
    const authKey = AUTHENTICATOR_KEY.EMAIL;
    transaction.nextStep!.relatesTo = {
      value: { key: authKey } as unknown as IdxAuthenticator,
    };
    const authId = 'abc1234';
    transaction.rawIdxState.currentAuthenticator = {
      type: '',
      value: {
        id: authId,
      } as unknown as IdxAuthenticator,
    };

    const updatedFormBag = updateElementKeys({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe('challenge-authenticator_Title_element_key0_okta_email_abc1234');
    expect(elements[1].key)
      .toBe('challenge-authenticator_Field_element_key1_okta_email_abc1234');
    expect(elements[2].key)
      .toBe('challenge-authenticator_Field_element_key2_okta_email_abc1234');
    expect(elements[3].key)
      .toBe('challenge-authenticator_Button_element_key3_okta_email_abc1234');
    expect(elements[4].key)
      .toBe('challenge-authenticator_Link_element_key4_okta_email_abc1234');
  });

  it('should create unique element key when key value is not set and transaction contains authKey & authID', async () => {
    const authKey = AUTHENTICATOR_KEY.EMAIL;
    transaction.nextStep!.relatesTo = {
      value: { key: authKey } as unknown as IdxAuthenticator,
    };
    const authId = 'abc1234';
    transaction.rawIdxState.currentAuthenticator = {
      type: '',
      value: {
        id: authId,
      } as unknown as IdxAuthenticator,
    };

    const updatedFormBag = updateElementKeys({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe('challenge-authenticator_Title_okta_email_abc1234');
    expect(elements[1].key)
      .toBe('challenge-authenticator_Field_okta_email_abc1234');
    expect(elements[2].key)
      .toBe('challenge-authenticator_Field_okta_email_abc1234');
    expect(elements[3].key)
      .toBe('challenge-authenticator_Button_okta_email_abc1234');
    expect(elements[4].key)
      .toBe('challenge-authenticator_Link_okta_email_abc1234');
  });

  it('should create unique element key for Reminder Element types', async () => {
    jest.spyOn(randomStringUtil, 'generateRandomString').mockReturnValue('0987654321abc');
    formBag.uischema.elements.unshift({ type: 'Reminder', options: { content: 'See errors below' } } as ReminderElement);

    const updatedFormBag = updateElementKeys({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe('challenge-authenticator_0987654321abc');
  });
});
