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

import { IDX_STEP } from 'src/constants';
import {
  getStubFormBag,
  getStubTransactionWithNextStep,
} from 'src/mocks/utils/utils';

import {
  ButtonElement,
  DescriptionElement,
  DividerElement,
  LinkElement,
  TitleElement,
} from '../../../types';
import { transformIdvIdpAuthenticator } from './transformIdvIdpAuthenticator';

describe('IDV IDP Authenticator transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();

  beforeEach(() => {
    transaction.nextStep = {
      name: IDX_STEP.REDIRECT_IDVERIFY,
      href:
        'http://localhost:3000/idp/identity-verification?stateToken=mockedStateToken124',
      idp: {
        id: 'ID_PROOFING',
        name: 'Persona',
      },
    };
    transaction.messages = [];
  });

  it('should add correct title, descriptions, and button', () => {
    const updatedFormBag = transformIdvIdpAuthenticator({
      formBag,
      transaction,
      widgetProps: {},
    });
    expect(updatedFormBag.uischema.elements.length).toBe(6);
    expect(updatedFormBag).toMatchSnapshot();
    expect(
      (updatedFormBag.uischema.elements[0] as TitleElement).options?.content,
    ).toBe('oie.idv.idp.title');
    expect(
      (updatedFormBag.uischema.elements[1] as DescriptionElement).options
        ?.content,
    ).toBe('oie.idv.idp.desc');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label).toBe(
      'oie.optional.authenticator.button.title',
    );
    expect((updatedFormBag.uischema.elements[3] as DividerElement).type)
      .toBe('Divider');
    expect((updatedFormBag.uischema.elements[4] as LinkElement).type)
      .not.toBe('Link');
    expect(
      (updatedFormBag.uischema.elements[4] as DescriptionElement).options
        ?.content,
    ).toBe('oie.idv.idp.desc.termsOfUse');
    expect(
      (updatedFormBag.uischema.elements[5] as DescriptionElement).options
        ?.content,
    ).toBe('oie.idv.idp.desc.agreement');
  });

  it('should add back to signin link', () => {
    transaction.availableSteps = [
      { name: 'cancel' },
    ];
    const updatedFormBag = transformIdvIdpAuthenticator({
      formBag,
      transaction,
      widgetProps: {},
    });
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect(updatedFormBag).toMatchSnapshot();
    expect(
      (updatedFormBag.uischema.elements[0] as TitleElement).options?.content,
    ).toBe('oie.idv.idp.title');
    expect(
      (updatedFormBag.uischema.elements[1] as DescriptionElement).options
        ?.content,
    ).toBe('oie.idv.idp.desc');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label).toBe(
      'oie.optional.authenticator.button.title',
    );
    expect((updatedFormBag.uischema.elements[3] as DividerElement).type)
      .toBe('Divider');
    expect((updatedFormBag.uischema.elements[4] as LinkElement).options.label)
      .toBe('goback');
    expect(
      (updatedFormBag.uischema.elements[5] as DescriptionElement).options
        ?.content,
    ).toBe('oie.idv.idp.desc.termsOfUse');
    expect(
      (updatedFormBag.uischema.elements[6] as DescriptionElement).options
        ?.content,
    ).toBe('oie.idv.idp.desc.agreement');
  });
});
