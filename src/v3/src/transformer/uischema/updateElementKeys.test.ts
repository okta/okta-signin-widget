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

    const updatedFormBag = updateElementKeys({ transaction, widgetProps, step: '' })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[0].type}_element_key0`);
    expect(elements[1].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[1].type}_element_key1`);
    expect(elements[2].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[2].type}_element_key2`);
    expect(elements[3].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[3].type}_element_key3`);
  });

  it('should create unique element key when key value is not set and transaction does not contain authKey/authID', async () => {
    const updatedFormBag = updateElementKeys({ transaction, widgetProps, step: '' })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[0].type}`);
    expect(elements[1].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[1].type}`);
    expect(elements[2].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[2].type}`);
    expect(elements[3].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[3].type}`);
  });

  it('should create unique element key when key value is preset and transaction contains authKey', async () => {
    formBag.uischema.elements = formBag.uischema.elements.map(
      (ele: UISchemaElement, index: number) => ({ ...ele, key: `element_key${index}` }),
    );
    const authKey = AUTHENTICATOR_KEY.EMAIL;
    transaction.nextStep!.relatesTo = {
      value: { key: authKey } as unknown as IdxAuthenticator,
    };

    const updatedFormBag = updateElementKeys({ transaction, widgetProps, step: '' })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[0].type}_element_key0_${authKey}`);
    expect(elements[1].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[1].type}_element_key1_${authKey}`);
    expect(elements[2].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[2].type}_element_key2_${authKey}`);
    expect(elements[3].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[3].type}_element_key3_${authKey}`);
  });

  it('should create unique element key when key value is not set and transaction contains authKey', async () => {
    const authKey = AUTHENTICATOR_KEY.EMAIL;
    transaction.nextStep!.relatesTo = {
      value: { key: authKey } as unknown as IdxAuthenticator,
    };

    const updatedFormBag = updateElementKeys({ transaction, widgetProps, step: '' })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[0].type}_${authKey}`);
    expect(elements[1].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[1].type}_${authKey}`);
    expect(elements[2].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[2].type}_${authKey}`);
    expect(elements[3].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[3].type}_${authKey}`);
  });

  it('should create unique element key when key value is preset and transaction contains authID', async () => {
    formBag.uischema.elements = formBag.uischema.elements.map(
      (ele: UISchemaElement, index: number) => ({ ...ele, key: `element_key${index}` }),
    );
    const authId = 'abc1234';
    transaction.rawIdxState.currentAuthenticator = {
      type: '',
      value: {
        id: authId,
      } as unknown as IdxAuthenticator,
    };

    const updatedFormBag = updateElementKeys({ transaction, widgetProps, step: '' })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[0].type}_element_key0_${authId}`);
    expect(elements[1].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[1].type}_element_key1_${authId}`);
    expect(elements[2].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[2].type}_element_key2_${authId}`);
    expect(elements[3].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[3].type}_element_key3_${authId}`);
  });

  it('should create unique element key when key value is not set and transaction contains authID', async () => {
    const authId = 'abc1234';
    transaction.rawIdxState.currentAuthenticator = {
      type: '',
      value: {
        id: authId,
      } as unknown as IdxAuthenticator,
    };

    const updatedFormBag = updateElementKeys({ transaction, widgetProps, step: '' })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[0].type}_${authId}`);
    expect(elements[1].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[1].type}_${authId}`);
    expect(elements[2].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[2].type}_${authId}`);
    expect(elements[3].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[3].type}_${authId}`);
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

    const updatedFormBag = updateElementKeys({ transaction, widgetProps, step: '' })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[0].type}_element_key0_${authKey}_${authId}`);
    expect(elements[1].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[1].type}_element_key1_${authKey}_${authId}`);
    expect(elements[2].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[2].type}_element_key2_${authKey}_${authId}`);
    expect(elements[3].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[3].type}_element_key3_${authKey}_${authId}`);
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

    const updatedFormBag = updateElementKeys({ transaction, widgetProps, step: '' })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[0].type}_${authKey}_${authId}`);
    expect(elements[1].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[1].type}_${authKey}_${authId}`);
    expect(elements[2].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[2].type}_${authKey}_${authId}`);
    expect(elements[3].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${elements[3].type}_${authKey}_${authId}`);
  });

  it('should create unique element key for Reminder Element types', async () => {
    const randomString = '0987654321abc';
    jest.spyOn(randomStringUtil, 'generateRandomString').mockReturnValue(randomString);
    formBag.uischema.elements.unshift({ type: 'Reminder', options: { content: 'See errors below' } } as ReminderElement);

    const updatedFormBag = updateElementKeys({ transaction, widgetProps, step: '' })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements[0].key)
      .toBe(`${IDX_STEP.CHALLENGE_AUTHENTICATOR}_${randomString}`);
  });
});
