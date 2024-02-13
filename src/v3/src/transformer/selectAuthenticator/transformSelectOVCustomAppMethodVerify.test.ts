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

import { IdxAuthenticator } from '@okta/okta-auth-js';
import { AUTHENTICATOR_KEY, IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  AuthenticatorButtonElement,
  AuthenticatorButtonListElement,
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  LinkElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { hasMinAuthenticatorOptions } from '../../util';
import { transformSelectOVCustomAppMethodVerify } from './transformSelectOVCustomAppMethodVerify';
import {
  getAppAuthenticatorMethodButtonElements,
  isOnlyPushWithAutoChallenge,
} from './utils';

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
        'authenticator.id': 'abcde1234',
        'authenticator.methodType': 'push',
      },
      ariaLabel: 'Select to get a push notification.',
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
        'authenticator.id': 'abcde1234',
        'authenticator.methodType': 'totp',
      },
      ariaLabel: 'Select to enter a code.',
      step: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
    },
  });
  return authenticators;
};

jest.mock('./utils', () => ({
  getAppAuthenticatorMethodButtonElements: jest.fn().mockImplementation(
    () => jest.fn().mockReturnValue(getMockMethodTypes()),
  ),
  isOnlyPushWithAutoChallenge: jest.fn().mockImplementation(
    () => jest.fn().mockReturnValue(false),
  ),
}));

jest.mock('../../util', () => ({
  // @ts-expect-error spreading required here for loc impl
  ...jest.requireActual('../../util'),
  hasMinAuthenticatorOptions: jest.fn().mockImplementation(
    () => jest.fn().mockReturnValue(false),
  ),
}));

describe('Transform Select OV Method Verify Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  const widgetProps: WidgetProps = {} as unknown as WidgetProps;

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
      relatesTo: {
        value: {
          methods: [{ type: 'push' }],
          key: AUTHENTICATOR_KEY.OV,
        } as IdxAuthenticator,
      },
    };
  });

  it('should not transform elements when transaction is missing inputs', () => {
    transaction.nextStep!.inputs = undefined;
    expect(transformSelectOVCustomAppMethodVerify({
      transaction,
      formBag,
      widgetProps,
    })).toEqual(formBag);
  });

  it('should not transform elements when transaction is missing methodType from input values', () => {
    transaction.nextStep!.inputs = [{ name: 'authenticator' }];
    expect(transformSelectOVCustomAppMethodVerify({
      transaction,
      formBag,
      widgetProps,
    })).toEqual(formBag);
  });

  it('should transform elements when transaction only contains push method type '
    + 'with autoChallenge option', () => {
    (isOnlyPushWithAutoChallenge as jest.Mock).mockReturnValue(true);
    (getAppAuthenticatorMethodButtonElements as jest.Mock).mockReturnValue([]);
    const updatedFormBag = transformSelectOVCustomAppMethodVerify({
      transaction,
      formBag,
      widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.okta_verify.push.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('authenticator.autoChallenge');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('oie.okta_verify.sendPushButton');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options?.step)
      .toBe('select-authenticator-authenticate');
    expect(updatedFormBag.data)
      .toEqual({ 'authenticator.autoChallenge': 'true', 'authenticator.methodType': 'push' });
  });

  it('should transform elements when transaction only contains push method type '
    + 'with autoChallenge option and has verify with something else link', () => {
    transaction.availableSteps = [{
      name: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
    }];
    (hasMinAuthenticatorOptions as jest.Mock).mockReturnValue(true);
    (isOnlyPushWithAutoChallenge as jest.Mock).mockReturnValue(true);
    (getAppAuthenticatorMethodButtonElements as jest.Mock).mockReturnValue([]);
    const updatedFormBag = transformSelectOVCustomAppMethodVerify({
      transaction,
      formBag,
      widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.okta_verify.push.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('authenticator.autoChallenge');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('oie.okta_verify.sendPushButton');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options?.step)
      .toBe('select-authenticator-authenticate');
    expect(updatedFormBag.data)
      .toEqual({ 'authenticator.autoChallenge': 'true', 'authenticator.methodType': 'push' });
    expect((updatedFormBag.uischema.elements[3] as LinkElement).type).toBe('Link');
    expect((updatedFormBag.uischema.elements[3] as LinkElement).options.label)
      .toBe('oie.verification.switch.authenticator');
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
            name: 'id',
            required: true,
            mutable: false,
            value: 'abcde1234',
          }, {
            name: 'methodType',
            options: [{ label: 'Enter code', value: 'totp' }, { label: 'Push', value: 'push' }],
          }],
        },
      ],
      relatesTo: {
        value: {
          methods: [{ type: 'push' }],
          key: AUTHENTICATOR_KEY.OV,
        } as IdxAuthenticator,
      },
    };
    (isOnlyPushWithAutoChallenge as jest.Mock).mockReturnValue(false);
    (getAppAuthenticatorMethodButtonElements as jest.Mock).mockReturnValue(getMockMethodTypes());
    const updatedFormBag = transformSelectOVCustomAppMethodVerify({
      transaction,
      formBag,
      widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.select.authenticators.verify.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.select.authenticators.verify.subtitle');
    expect((updatedFormBag.uischema.elements[2] as AuthenticatorButtonElement).type).toBe('AuthenticatorButtonList');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.dataSe)).toBe('authenticator-verify-list');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons.length)).toBe(2);
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement)
      .options.actionParams?.['authenticator.methodType']).toBe('push');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons[0] as AuthenticatorButtonElement).label)
      .toBe('Get a push notification');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons[1] as AuthenticatorButtonElement)
      .options.actionParams?.['authenticator.methodType']).toBe('totp');
    expect(((updatedFormBag.uischema.elements[2] as AuthenticatorButtonListElement)
      .options.buttons[1] as AuthenticatorButtonElement).label).toBe('Enter a code');
  });
});

describe('Transform Select Custom App Method Verify Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  const widgetProps: WidgetProps = {} as unknown as WidgetProps;

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
      relatesTo: {
        value: {
          methods: [{ type: 'push' }],
          key: AUTHENTICATOR_KEY.CUSTOM_APP,
        } as IdxAuthenticator,
      },
    };
  });

  it('should transform elements when transaction only contains push method type '
    + 'with autoChallenge option and Custom App authenticator key', () => {
    (isOnlyPushWithAutoChallenge as jest.Mock).mockReturnValue(true);
    (getAppAuthenticatorMethodButtonElements as jest.Mock).mockReturnValue([]);
    const updatedFormBag = transformSelectOVCustomAppMethodVerify({
      transaction,
      formBag,
      widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.custom_app.push.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('authenticator.autoChallenge');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('oie.custom_app.sendPushButton');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options?.step)
      .toBe('select-authenticator-authenticate');
    expect(updatedFormBag.data)
      .toEqual({ 'authenticator.autoChallenge': 'true', 'authenticator.methodType': 'push' });
  });

  it('should transform elements when transaction only contains push method type '
    + 'with Custom App authenticator key, autoChallenge option, and has verify with something else link', () => {
    transaction.availableSteps = [{
      name: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
    }];
    (hasMinAuthenticatorOptions as jest.Mock).mockReturnValue(true);
    (isOnlyPushWithAutoChallenge as jest.Mock).mockReturnValue(true);
    (getAppAuthenticatorMethodButtonElements as jest.Mock).mockReturnValue([]);
    const updatedFormBag = transformSelectOVCustomAppMethodVerify({
      transaction,
      formBag,
      widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.custom_app.push.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('authenticator.autoChallenge');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('oie.custom_app.sendPushButton');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options?.step)
      .toBe('select-authenticator-authenticate');
    expect(updatedFormBag.data)
      .toEqual({ 'authenticator.autoChallenge': 'true', 'authenticator.methodType': 'push' });
    expect((updatedFormBag.uischema.elements[3] as LinkElement).type).toBe('Link');
    expect((updatedFormBag.uischema.elements[3] as LinkElement).options.label)
      .toBe('oie.verification.switch.authenticator');
  });
});
