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

import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  AuthenticatorButtonElement,
  ButtonType,
  FieldElement,
  WidgetProps,
} from 'src/types';

import { transformSelectOVMethodVerify } from './transformSelectOVMethodVerify';

const getMockMethodTypes = (): AuthenticatorButtonElement[] => {
  const authenticators: AuthenticatorButtonElement[] = [];
  authenticators.push({
    type: 'AuthenticatorButton',
    label: 'Get a push notification',
    options: {
      type: ButtonType.BUTTON,
      key: 'okta_verify',
      ctaLabel: 'Select',
      actionParams: {
        'authenticator.methodType': 'push',
      },
      step: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
    },
  });
  authenticators.push({
    type: 'AuthenticatorButton',
    label: 'Enter a code',
    options: {
      type: ButtonType.BUTTON,
      key: 'okta_verify',
      ctaLabel: 'Select',
      actionParams: {
        'authenticator.methodType': 'totp',
      },
      step: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
    },
  });
  return authenticators;
};

let isPushOnly = false;
jest.mock('./utils', () => ({
  getOVMethodTypeAuthenticatorButtonElements: (
    options?: IdxOption[],
  ) => (options?.length ? getMockMethodTypes() : []),
  isOnlyPushWithAutoChallenge: jest.fn().mockImplementation(
    () => isPushOnly,
  ),
}));

describe('Transform Select OV Method Verify Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  const widgetProps: WidgetProps = {};

  beforeEach(() => {
    formBag.uischema.elements = [
      {
        type: 'Field',
        options: { inputMeta: { name: 'authenticator.methodType' } },
      } as FieldElement,
      {
        type: 'Field',
        options: { inputMeta: { name: 'authenticator.autoChallenge', value: 'true' } },
      } as FieldElement,
    ];
    transaction.nextStep = {
      name: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
      inputs: [
        {
          name: 'authenticator',
          value: [{ name: 'autoChallenge', type: 'boolean', value: 'true' }],
        },
      ],
    };
  });

  it('should not transform elements when transaction is missing inputs', () => {
    transaction.nextStep!.inputs = undefined;
    expect(transformSelectOVMethodVerify({ transaction, formBag, widgetProps })).toEqual(formBag);
  });

  it('should not transform elements when transaction is missing methodType from input values', () => {
    transaction.nextStep!.inputs = [{ name: 'authenticator' }];
    expect(transformSelectOVMethodVerify({ transaction, formBag, widgetProps })).toEqual(formBag);
  });

  it('should transform elements when transaction only contains push method type '
    + 'with autoChallenge option', () => {
    isPushOnly = true;
    const updatedFormBag = transformSelectOVMethodVerify({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should transform elements when transaction contains push and totp method types', () => {
    formBag.uischema.elements = [{
      type: 'Field',
      options: {
        inputMeta: {
          name: 'authenticator.methodType',
          options: [{ label: 'Enter code', value: 'totp' }, { label: 'Push', value: 'push' }],
        },
      },
    } as FieldElement];
    transaction.nextStep = {
      name: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
      inputs: [
        {
          name: 'authenticator',
          value: [{
            name: 'methodType',
            options: [{ label: 'Enter code', value: 'totp' }, { label: 'Push', value: 'push' }],
          }],
        },
      ],
    };
    isPushOnly = false;
    const updatedFormBag = transformSelectOVMethodVerify({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag).toMatchSnapshot();
  });
});
