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

import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  FieldElement,
  FormBag,
  WidgetProps,
} from 'src/types';

import { transformIdentify } from './transformIdentify';

jest.mock('../../util', () => ({
  // @ts-ignore spreading required here for loc impl
  ...jest.requireActual('../../util'),
  getUsernameCookie: jest.fn().mockReturnValue('testUserFromCookie'),
}));

describe('Identify Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  let widgetProps: WidgetProps;

  beforeEach(() => {
    formBag = getStubFormBag();
    formBag.uischema.elements = [
      {
        type: 'Field',
        options: { inputMeta: { name: 'identifier' } },
      } as FieldElement,
      {
        type: 'Field',
        options: { inputMeta: { name: 'credentials.passcode', secret: true } },
      } as FieldElement,
      {
        type: 'Field',
        options: { inputMeta: { name: 'rememberMe' } },
      } as FieldElement,
    ];
    widgetProps = {};
  });

  it('should add UI elements for identifier, passcode and rememberMe inputs when no '
    + 'features are provided', () => {
    const updatedFormBag = transformIdentify({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add UI elements for identifier and rememberMe inputs when no '
    + 'features are provided', () => {
    formBag.uischema.elements = [
      {
        type: 'Field',
        options: { inputMeta: { name: 'identifier' } },
      } as FieldElement,
      {
        type: 'Field',
        options: { inputMeta: { name: 'rememberMe' } },
      } as FieldElement,
    ];
    const updatedFormBag = transformIdentify({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should remove rememberMe element from formBag when showKeepMeSignedIn feature '
    + 'is set to false', () => {
    widgetProps = { features: { showKeepMeSignedIn: false } };

    const updatedFormBag = transformIdentify({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add UI elements for identifier, passcode & rememberMe with username default option '
    + 'when username is provided in options', () => {
    widgetProps = { username: 'testUser' };
    const updatedFormBag = transformIdentify({ transaction, formBag, widgetProps });

    expect(updatedFormBag.data.identifier).toBe('testUser');
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add UI elements for identifier, passcode & rememberMe with username pulled from '
    + 'cookie as the default option when username is not provided in options but features '
    + 'rememberMe & rememberMyUsernameOnOIE are provided', () => {
    widgetProps = { features: { rememberMe: true, rememberMyUsernameOnOIE: true } };
    const updatedFormBag = transformIdentify({ transaction, formBag, widgetProps });

    expect(updatedFormBag.data.identifier).toBe('testUserFromCookie');
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag).toMatchSnapshot();
  });
});
