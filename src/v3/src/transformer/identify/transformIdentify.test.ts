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

import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  FieldElement,
  FormBag,
  TitleElement,
  UISchemaElement,
  UISchemaLayoutType,
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
  let widgetProps: WidgetProps;
  let formBag: FormBag;

  beforeEach(() => {
    formBag = {
      dataSchema: {},
      schema: {},
      uischema: {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Control',
            name: 'identifier',
          } as UISchemaElement,
          {
            type: 'Control',
            name: 'credentials.passcode',
            options: { secret: true },
          } as UISchemaElement,
          {
            type: 'Control',
            name: 'rememberMe',
          } as UISchemaElement,
        ],
      },
      data: {},
    };
    widgetProps = {};
  });

  it('should add UI elements for identifier, passcode and rememberMe inputs when no '
    + 'features are provided', () => {
    const updatedFormBag = transformIdentify({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('primaryauth.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).name)
      .toBe('identifier');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).name)
      .toBe('rememberMe');
    expect((updatedFormBag.uischema.elements[4] as UISchemaElement).label)
      .toBe('oie.primaryauth.submit');
  });

  it('should add UI elements for identifier and rememberMe inputs when no '
    + 'features are provided', () => {
    formBag.schema = {};
    formBag.uischema.elements = [
      {
        type: 'Control',
        name: 'identifier',
        scope: '#/properties/identifier',
      } as UISchemaElement,
      {
        type: 'Control',
        name: 'rememberMe',
        scope: '#/properties/rememberMe',
      } as UISchemaElement,
    ];
    const updatedFormBag = transformIdentify({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('primaryauth.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).name)
      .toBe('identifier');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).name)
      .toBe('rememberMe');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).label)
      .toBe('oform.next');
  });

  it('should remove rememberMe element from formBag when showKeepMeSignedIn feature '
    + 'is set to false', () => {
    widgetProps = { features: { showKeepMeSignedIn: false } };

    const updatedFormBag = transformIdentify({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('primaryauth.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).name)
      .toBe('identifier');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).label)
      .toBe('oie.primaryauth.submit');
  });

  it('should add UI elements for identifier, passcode & rememberMe with username default option '
    + 'when username is provided in options', () => {
    widgetProps = { username: 'testUser' };
    const updatedFormBag = transformIdentify({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('primaryauth.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).name)
      .toBe('identifier');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.defaultOption)
      .toBe('testUser');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).name)
      .toBe('rememberMe');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).label)
      .toBe('oie.primaryauth.submit');
  });

  it('should add UI elements for identifier, passcode & rememberMe with username pulled from '
    + 'cookie as the default option when username is not provided in options but features '
    + 'rememberMe & rememberMyUsernameOnOIE are provided', () => {
    widgetProps = { features: { rememberMe: true, rememberMyUsernameOnOIE: true } };
    const updatedFormBag = transformIdentify({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('primaryauth.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).name)
      .toBe('identifier');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.defaultOption)
      .toBe('testUserFromCookie');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).name)
      .toBe('rememberMe');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).label)
      .toBe('oie.primaryauth.submit');
  });
});
