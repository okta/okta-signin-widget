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
import { IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  DescriptionElement,
  FieldElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import * as locUtils from '../../util/locUtil';
import { transformPhoneVerification } from '.';

describe('Phone verification Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep(IDX_STEP.AUTHENTICATOR_VERIFICATION_DATA);
  const widgetProps: WidgetProps = {} as unknown as WidgetProps;
  const formBag = getStubFormBag();
  beforeEach(() => {
    formBag.uischema.elements = [
      {
        type: 'Field',
        options: {
          inputMeta: {
            name: 'authenticator.methodType',
            options: [{ value: 'sms', label: 'SMS' }, { value: 'voice', label: 'Voice call' }],
          },
        },
      } as FieldElement,
    ];
  });

  it('should add correct UI elements to schema when multiple methodType choices exists'
    + ' and sms is the first methodType choice', () => {
    const updatedFormBag = transformPhoneVerification({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.phone.verify.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.phone.verify.sms.sendText.without.phone');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');
    // primary button
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('oie.phone.sms.primaryButton');
    expect(((updatedFormBag.uischema.elements[3] as ButtonElement)
      .options.actionParams?.['authenticator.methodType'])).toBe('sms');
    // secondary button
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).label)
      .toBe('oie.phone.call.secondaryButton');
    expect(((updatedFormBag.uischema.elements[4] as ButtonElement).options
      ?.actionParams?.['authenticator.methodType'])).toBe('voice');
  });

  it('should add correct UI elements to schema when multiple methodType choices exists'
    + ' and voice is the first methodType choice', () => {
    formBag.uischema.elements = [{
      type: 'Field',
      options: {
        inputMeta: {
          name: 'authenticator.methodType',
          options: [{ value: 'voice', label: 'Voice call' }, { value: 'sms', label: 'SMS' }],
        },
      },
    } as FieldElement];
    const updatedFormBag = transformPhoneVerification({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.phone.verify.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.phone.verify.call.sendText.without.phone');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');
    // primary button
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('oie.phone.call.primaryButton');
    expect(((updatedFormBag.uischema.elements[3] as ButtonElement)
      .options.actionParams?.['authenticator.methodType']))
      .toBe('voice');
    // secondary button
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).label)
      .toBe('oie.phone.sms.secondaryButton');
    expect(((updatedFormBag.uischema.elements[4] as ButtonElement).options
      ?.actionParams?.['authenticator.methodType'])).toBe('sms');
  });

  it('should add correct UI elements to schema when only voice methodType choice exists', () => {
    formBag.uischema.elements = [{
      type: 'Field',
      options: {
        inputMeta: {
          name: 'authenticator.methodType',
          options: [{ value: 'voice', label: 'Voice call' }],
        },
      },
    } as FieldElement];
    const updatedFormBag = transformPhoneVerification({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.phone.verify.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.phone.verify.call.sendText.without.phone');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');
    // primary button
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('oie.phone.call.primaryButton');
    expect(((updatedFormBag.uischema.elements[3] as ButtonElement)
      .options.actionParams?.['authenticator.methodType']))
      .toBe('voice');
  });

  it('should add correct UI elements to schema when only sms methodType choice exists', () => {
    formBag.uischema.elements = [{
      type: 'Field',
      options: {
        inputMeta: {
          name: 'authenticator.methodType',
          options: [{ value: 'sms', label: 'SMS' }],
        },
      },
    } as FieldElement];
    const updatedFormBag = transformPhoneVerification({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.phone.verify.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.phone.verify.sms.sendText.without.phone');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');
    // primary button
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('oie.phone.sms.primaryButton');
    expect(((updatedFormBag.uischema.elements[3] as ButtonElement)
      .options.actionParams?.['authenticator.methodType']))
      .toBe('sms');
  });

  it('should add correct UI elements to schema when only sms methodType choice exists'
    + ' and redacted phoneNumber exists in Idx response ', () => {
    const mockPhoneNumber = '+121xxxxx34';
    formBag.uischema.elements = [{
      type: 'Field',
      options: {
        inputMeta: {
          name: 'authenticator.methodType',
          options: [{ value: 'sms', label: 'SMS' }],
        },
      },
    } as FieldElement];
    transaction.nextStep = {
      name: IDX_STEP.AUTHENTICATOR_VERIFICATION_DATA,
      canResend: true,
      relatesTo: {
        value: {
          profile: {
            phoneNumber: mockPhoneNumber,
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const locSpy = jest.spyOn(locUtils, 'loc');
    const updatedFormBag = transformPhoneVerification({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.phone.verify.title');
    const subtitleKey = 'oie.phone.verify.sms.sendText.with.phone.without.nickname';
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe(subtitleKey);
    expect(locSpy).toHaveBeenCalledWith(
      subtitleKey,
      'login',
      [`&lrm;${mockPhoneNumber}`],
      { $1: { element: 'span', attributes: { class: 'strong no-translate' } } },
    );
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');
    // primary button
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('oie.phone.sms.primaryButton');
    expect(((updatedFormBag.uischema.elements[3] as ButtonElement)
      .options.actionParams?.['authenticator.methodType']))
      .toBe('sms');
  });

  it('should add correct UI elements to schema when only voice methodType choice exists'
    + ' and redacted phoneNumber exists in Idx response ', () => {
    const mockPhoneNumber = '+121xxxxx34';
    formBag.uischema.elements = [{
      type: 'Field',
      options: {
        inputMeta: {
          name: 'authenticator.methodType',
          options: [{ value: 'voice', label: 'Voice call' }],
        },
      },
    } as FieldElement];
    transaction.nextStep = {
      name: IDX_STEP.AUTHENTICATOR_VERIFICATION_DATA,
      canResend: true,
      relatesTo: {
        value: {
          profile: {
            phoneNumber: mockPhoneNumber,
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const locSpy = jest.spyOn(locUtils, 'loc');
    const updatedFormBag = transformPhoneVerification({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.phone.verify.title');
    const subtitleKey = 'oie.phone.verify.call.sendText.with.phone.without.nickname';
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe(subtitleKey);
    expect(locSpy).toHaveBeenCalledWith(
      subtitleKey,
      'login',
      [`&lrm;${mockPhoneNumber}`],
      { $1: { element: 'span', attributes: { class: 'strong no-translate' } } },
    );
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');
    // primary button
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('oie.phone.call.primaryButton');
    expect(((updatedFormBag.uischema.elements[3] as ButtonElement)
      .options.actionParams?.['authenticator.methodType']))
      .toBe('voice');
  });

  // With Nickname
  it('should add correct UI elements to schema when only sms methodType choice exists'
    + ' and redacted phoneNumber and nickname exists in Idx response ', () => {
    const mockPhoneNumber = '+121xxxxx34';
    const mockNickname = 'ph-nn';
    formBag.uischema.elements = [{
      type: 'Field',
      options: {
        inputMeta: {
          name: 'authenticator.methodType',
          options: [{ value: 'sms', label: 'SMS' }],
        },
      },
    } as FieldElement];
    transaction.nextStep = {
      name: IDX_STEP.AUTHENTICATOR_VERIFICATION_DATA,
      canResend: true,
      relatesTo: {
        value: {
          profile: {
            phoneNumber: mockPhoneNumber,
          },
          nickname: mockNickname,
        } as unknown as IdxAuthenticator,
      },
    };
    const locSpy = jest.spyOn(locUtils, 'loc');
    const updatedFormBag = transformPhoneVerification({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.phone.verify.title');
    const subtitleKey = 'oie.phone.verify.sms.sendText.with.phone.with.nickname';
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe(subtitleKey);
    expect(locSpy).toHaveBeenCalledWith(
      subtitleKey,
      'login',
      [`&lrm;${mockPhoneNumber}`, mockNickname],
      {
        $1: { element: 'span', attributes: { class: 'strong no-translate' } },
        $2: {
          element: 'span',
          attributes: { class: 'strong no-translate authenticator-verify-nickname' },
        },
      },
    );
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');
    // primary button
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('oie.phone.sms.primaryButton');
    expect(((updatedFormBag.uischema.elements[3] as ButtonElement)
      .options.actionParams?.['authenticator.methodType']))
      .toBe('sms');
  });

  it('should add correct UI elements to schema when only voice methodType choice exists'
    + ' and redacted phoneNumber and nickname exists in Idx response ', () => {
    const mockPhoneNumber = '+121xxxxx34';
    const mockNickname = 'ph-nn';
    formBag.uischema.elements = [{
      type: 'Field',
      options: {
        inputMeta: {
          name: 'authenticator.methodType',
          options: [{ value: 'voice', label: 'Voice call' }],
        },
      },
    } as FieldElement];
    transaction.nextStep = {
      name: IDX_STEP.AUTHENTICATOR_VERIFICATION_DATA,
      canResend: true,
      relatesTo: {
        value: {
          profile: {
            phoneNumber: mockPhoneNumber,
          },
          nickname: mockNickname,
        } as unknown as IdxAuthenticator,
      },
    };
    const locSpy = jest.spyOn(locUtils, 'loc');
    const updatedFormBag = transformPhoneVerification({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.phone.verify.title');
    const subtitleKey = 'oie.phone.verify.call.sendText.with.phone.with.nickname';
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe(subtitleKey);
    expect(locSpy).toHaveBeenCalledWith(
      subtitleKey,
      'login',
      [`&lrm;${mockPhoneNumber}`, mockNickname],
      {
        $1: { element: 'span', attributes: { class: 'strong no-translate' } },
        $2: {
          element: 'span',
          attributes: { class: 'strong no-translate authenticator-verify-nickname' },
        },
      },
    );
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');
    // primary button
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('oie.phone.call.primaryButton');
    expect(((updatedFormBag.uischema.elements[3] as ButtonElement)
      .options.actionParams?.['authenticator.methodType']))
      .toBe('voice');
  });
});
