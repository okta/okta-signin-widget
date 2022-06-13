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

import { ControlElement } from '@jsonforms/core';
import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { IDX_STEP } from 'src/constants';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  AuthenticatorOptionValue,
  FormBag,
  Option,
  WidgetProps,
} from 'src/types';

import { transformSelectAuthenticatorEnroll } from '.';

const getMockAuthenticators = (): Option<AuthenticatorOptionValue>[] => {
  const authenticators = [];
  authenticators.push({
    key: 'okta_email',
    label: 'Email',
    value: {
      key: 'okta_email',
      description: 'Enroll in email authenticator',
      label: 'Select',
    },
  });
  return authenticators;
};

jest.mock('./utils', () => ({
  getAuthenticatorEnrollOptions: (
    options: IdxOption[],
  ) => (options.length ? getMockAuthenticators() : []),
}));

describe('Enroll Authenticator Selector Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  const isSkippable = jest.fn();
  let mockProps: WidgetProps;

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
    transaction.nextStep = {
      name: IDX_STEP.SELECT_AUTHENTICATOR_ENROLL,
      canSkip: isSkippable.mockReturnValue(false)(),
      inputs: [{
        name: 'authenticator',
        options: [
          {
            label: 'Email',
            value: 'okta_email',
          } as IdxOption,
        ],
      }],
    };
    mockProps = {};
  });

  it('should not transform elements when IDX Step does not exist in remediations', () => {
    expect(transformSelectAuthenticatorEnroll(transaction, formBag, mockProps)).toEqual(formBag);
  });

  it('should not transform elements when inputs are missing from step', () => {
    transaction.nextStep = {
      name: IDX_STEP.SELECT_AUTHENTICATOR_ENROLL,
    };

    expect(transformSelectAuthenticatorEnroll(transaction, formBag, mockProps)).toEqual(formBag);
  });

  it('should transform authenticator elements when step is skippable', () => {
    transaction.nextStep.canSkip = isSkippable.mockReturnValue(true)();
    transaction.availableSteps = [{ name: 'skip', action: jest.fn() }];
    const updatedFormBag = transformSelectAuthenticatorEnroll(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect(updatedFormBag.uischema.elements[0].options?.content)
      .toBe('oie.select.authenticators.enroll.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect(updatedFormBag.uischema.elements[1].options?.content)
      .toBe('oie.select.authenticators.enroll.subtitle');
    expect(updatedFormBag.uischema.elements[1].options?.contentParams)
      .toBeUndefined();
    expect(updatedFormBag.uischema.elements[2].options?.format).toBe('AuthenticatorList');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).scope)
      .toBe('#/properties/authenticator');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).label)
      .toBe('oie.setup.optional');
    expect(updatedFormBag.schema.properties?.authenticator).toEqual({
      type: 'object',
      enum: getMockAuthenticators(),
    });
    expect(updatedFormBag.uischema.elements[3].type).toBe('Control');
    expect((updatedFormBag.uischema.elements[3] as ControlElement).label)
      .toBe('enroll.choices.submit.finish');
    expect(updatedFormBag.uischema.elements[3].options?.format).toBe('button');
    expect(updatedFormBag.uischema.elements[3].options?.action).not.toBeUndefined();
    expect(updatedFormBag.uischema.elements[3].options?.idxMethodParams?.skip).toBe(true);
  });

  it('should transform authenticator elements when step is not skippable', () => {
    const updatedFormBag = transformSelectAuthenticatorEnroll(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect(updatedFormBag.uischema.elements[0].options?.content)
      .toBe('oie.select.authenticators.enroll.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect(updatedFormBag.uischema.elements[1].options?.content)
      .toBe('oie.select.authenticators.enroll.subtitle');
    expect(updatedFormBag.uischema.elements[1].options?.contentParams)
      .toBeUndefined();
    expect(updatedFormBag.uischema.elements[2].options?.format).toBe('AuthenticatorList');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).scope)
      .toBe('#/properties/authenticator');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).label)
      .toBe('oie.setup.required');
    expect(updatedFormBag.schema.properties?.authenticator).toEqual({
      type: 'object',
      enum: getMockAuthenticators(),
    });
  });

  it('should transform authenticator elements when step is skippable and brandName is provided', () => {
    mockProps = { brandName: 'Acme Corp.' };
    transaction.nextStep.canSkip = isSkippable.mockReturnValue(true)();
    transaction.availableSteps = [{ name: 'skip', action: jest.fn() }];
    const updatedFormBag = transformSelectAuthenticatorEnroll(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect(updatedFormBag.uischema.elements[0].options?.content)
      .toBe('oie.select.authenticators.enroll.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect(updatedFormBag.uischema.elements[1].options?.content)
      .toBe('oie.select.authenticators.enroll.subtitle.custom');
    expect(updatedFormBag.uischema.elements[1].options?.contentParams)
      .toEqual(['Acme Corp.']);
    expect(updatedFormBag.uischema.elements[2].options?.format).toBe('AuthenticatorList');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).scope)
      .toBe('#/properties/authenticator');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).label)
      .toBe('oie.setup.optional');
    expect(updatedFormBag.schema.properties?.authenticator).toEqual({
      type: 'object',
      enum: getMockAuthenticators(),
    });
    expect(updatedFormBag.uischema.elements[3].type).toBe('Control');
    expect((updatedFormBag.uischema.elements[3] as ControlElement).label)
      .toBe('enroll.choices.submit.finish');
    expect(updatedFormBag.uischema.elements[3].options?.format).toBe('button');
    expect(updatedFormBag.uischema.elements[3].options?.action).not.toBeUndefined();
    expect(updatedFormBag.uischema.elements[3].options?.idxMethodParams?.skip).toBe(true);
  });
});
