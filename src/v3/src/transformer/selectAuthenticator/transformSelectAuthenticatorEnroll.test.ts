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

import { IdxOption } from '@okta/okta-auth-js/types/lib/idx/types/idx-js';
import { AUTHENTICATOR_KEY, IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  AuthenticatorButtonElement,
  AuthenticatorButtonListElement,
  ButtonElement,
  ButtonType,
  DescriptionElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformSelectAuthenticatorEnroll } from '.';

const getMockAuthenticatorButtons = (): AuthenticatorButtonElement[] => {
  const authenticators = [];
  authenticators.push({
    type: 'AuthenticatorButton',
    label: 'Email',
    options: {
      type: ButtonType.BUTTON,
      key: AUTHENTICATOR_KEY.EMAIL,
      ctaLabel: 'Select',
      description: 'Enroll in email authenticator',
      actionParams: {
        'authenticator.id': '123abc',
      },
      ariaLabel: 'Select email.',
      step: IDX_STEP.SELECT_AUTHENTICATOR_ENROLL,
    },
  } as AuthenticatorButtonElement);
  return authenticators;
};

jest.mock('./utils', () => ({
  getAuthenticatorEnrollButtonElements: (
    options: IdxOption[],
  ) => (options.length ? getMockAuthenticatorButtons() : []),
}));

describe('Enroll Authenticator Selector Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  const isSkippable = jest.fn();
  let widgetProps: WidgetProps;

  beforeEach(() => {
    formBag.uischema.elements = [];
    transaction.availableSteps = [];
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
    widgetProps = {} as unknown as WidgetProps;
  });

  it('should not transform elements when IDX Step does not exist in remediations', () => {
    expect(transformSelectAuthenticatorEnroll({ transaction, formBag, widgetProps }))
      .toEqual(formBag);
  });

  it('should not transform elements when inputs are missing from step', () => {
    transaction.nextStep = {
      name: IDX_STEP.SELECT_AUTHENTICATOR_ENROLL,
    };

    expect(transformSelectAuthenticatorEnroll({ transaction, formBag, widgetProps }))
      .toEqual(formBag);
  });

  it('should transform authenticator elements when step is skippable', () => {
    transaction.nextStep!.canSkip = isSkippable.mockReturnValue(true)();
    transaction.availableSteps = [{ name: 'skip', action: jest.fn() }];
    const updatedFormBag = transformSelectAuthenticatorEnroll({
      transaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.select.authenticators.enroll.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.select.authenticators.enroll.subtitle');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
      .toBe('oie.setup.optional');
    expect(updatedFormBag.uischema.elements[3].type).toBe('AuthenticatorButtonList');
    expect(((updatedFormBag.uischema.elements[3] as AuthenticatorButtonListElement)
      .options.buttons.length)).toBe(1);
    expect(((updatedFormBag.uischema.elements[3] as AuthenticatorButtonListElement)
      .options.dataSe)).toBe('authenticator-enroll-list');
    expect(((updatedFormBag.uischema.elements[3] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement).options.actionParams?.['authenticator.id'])
      .toBe('123abc');
    expect(updatedFormBag.uischema.elements[4].type).toBe('Button');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).label)
      .toBe('oie.optional.authenticator.button.title');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).options.step)
      .toBe('skip');
  });

  it('should transform authenticator elements when step is not skippable', () => {
    const updatedFormBag = transformSelectAuthenticatorEnroll({
      transaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.select.authenticators.enroll.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.select.authenticators.enroll.subtitle');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
      .toBe('oie.setup.required');
    expect(updatedFormBag.uischema.elements[3].type).toBe('AuthenticatorButtonList');
    expect((updatedFormBag.uischema.elements[3] as AuthenticatorButtonListElement)
      .options.buttons.length).toBe(1);
    expect(((updatedFormBag.uischema.elements[3] as AuthenticatorButtonListElement)
      .options.dataSe)).toBe('authenticator-enroll-list');
    expect(((updatedFormBag.uischema.elements[3] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement).options.step)
      .toBe('select-authenticator-enroll');
    expect(((updatedFormBag.uischema.elements[3] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement).options.type).toBe(ButtonType.BUTTON);
    expect(((updatedFormBag.uischema.elements[3] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement).options.actionParams?.['authenticator.id'])
      .toBe('123abc');
  });

  it('should transform authenticator elements when step is skippable and brandName is provided', () => {
    widgetProps = { brandName: 'Acme Corp.' } as unknown as WidgetProps;
    transaction.nextStep!.canSkip = isSkippable.mockReturnValue(true)();
    transaction.availableSteps = [{ name: 'skip', action: jest.fn() }];
    const updatedFormBag = transformSelectAuthenticatorEnroll({
      transaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.select.authenticators.enroll.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.select.authenticators.enroll.subtitle.custom');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
      .toBe('oie.setup.optional');
    expect(updatedFormBag.uischema.elements[3].type).toBe('AuthenticatorButtonList');
    expect(((updatedFormBag.uischema.elements[3] as AuthenticatorButtonListElement)
      .options.dataSe)).toBe('authenticator-enroll-list');
    expect(((updatedFormBag.uischema.elements[3] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement)
      .options.actionParams?.['authenticator.id']).toBe('123abc');
    expect(((updatedFormBag.uischema.elements[3] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement).options.step)
      .toBe('select-authenticator-enroll');
    expect(((updatedFormBag.uischema.elements[3] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement).options.type)
      .toBe(ButtonType.BUTTON);
    expect(updatedFormBag.uischema.elements[4].type).toBe('Button');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).label)
      .toBe('oie.optional.authenticator.button.title');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
  });
});
