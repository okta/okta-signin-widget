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

import { IDX_STEP } from '../../constants';
import { getStubFormBag, getStubTransactionWithNextStep } from '../../mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  DividerElement,
  FieldElement,
  FormBag,
  IWidgetContext,
  LaunchAuthenticatorButtonElement,
  LinkElement,
  TitleElement,
  WidgetProps,
} from '../../types';
import { transformIDPButtons } from './transformIDPButtons';

describe('IDP Button transformer tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  let widgetProps: WidgetProps;

  beforeEach(() => {
    formBag = getStubFormBag();
    formBag.uischema.elements = [
      { type: 'Title', options: { content: 'Sign in' } } as TitleElement,
      { type: 'Field', options: { inputMeta: { name: 'identifier' } } } as FieldElement,
      { type: 'Field', options: { inputMeta: { name: 'credentials.passcode' } } } as FieldElement,
      { type: 'Button', options: { type: ButtonType.SUBMIT } } as ButtonElement,
      { type: 'Link', options: { label: 'Forgot Password' } } as LinkElement,
    ];
    widgetProps = {};
  });

  it('should not add PIV IDP button when PIV does not exist in remediation but Identify does', () => {
    transaction.neededToProceed = [
      { name: IDX_STEP.IDENTIFY },
    ];
    const updatedFormBag = transformIDPButtons({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag).toEqual(formBag);
  });

  it('should not add PIV IDP button when PIV remediation exists but identify does not', () => {
    transaction.neededToProceed = [
      { name: IDX_STEP.PIV_IDP, type: 'X509' },
    ];
    const updatedFormBag = transformIDPButtons({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag).toEqual(formBag);
  });

  it('should add PIV/CAC IDP button when exists in remediation with default (PRIMARY) display', async () => {
    transaction.neededToProceed = [
      { name: IDX_STEP.IDENTIFY },
      { name: IDX_STEP.PIV_IDP, type: 'X509' },
    ];
    const updatedFormBag = transformIDPButtons({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect((updatedFormBag.uischema.elements[1] as ButtonElement).label).toBe('piv.cac.card');
    expect((updatedFormBag.uischema.elements[1] as ButtonElement).options.step)
      .toBe(IDX_STEP.PIV_IDP);
    expect((updatedFormBag.uischema.elements[1] as ButtonElement).options.type)
      .toBe(ButtonType.BUTTON);
    expect((updatedFormBag.uischema.elements[2] as DividerElement).options?.text)
      .toBe('socialauth.divider.text');
  });

  it('should add PIV/CAC IDP button when exists in remediation with SECONDARY display', async () => {
    transaction.neededToProceed = [
      { name: IDX_STEP.IDENTIFY },
      { name: IDX_STEP.PIV_IDP, type: 'X509' },
    ];
    widgetProps = { idpDisplay: 'SECONDARY' };
    const updatedFormBag = transformIDPButtons({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect((updatedFormBag.uischema.elements[4] as DividerElement).options?.text)
      .toBe('socialauth.divider.text');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).label).toBe('piv.cac.card');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).options.step)
      .toBe(IDX_STEP.PIV_IDP);
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).options.type)
      .toBe(ButtonType.BUTTON);
  });

  it('should execute PIV/CAC button function when clicked', async () => {
    transaction.neededToProceed = [
      { name: IDX_STEP.IDENTIFY },
      { name: IDX_STEP.PIV_IDP, type: 'X509' },
    ];
    const updatedFormBag = transformIDPButtons({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    const pivButton: ButtonElement = updatedFormBag.uischema.elements.find(
      (ele) => ele.type === 'Button' && (ele as ButtonElement).options.step === IDX_STEP.PIV_IDP,
    ) as ButtonElement;

    const mockSetTransaction = jest.fn();
    const context: IWidgetContext = {
      setIdxTransaction: mockSetTransaction,
    } as unknown as IWidgetContext;
    pivButton.options.onClick!(context);

    expect(mockSetTransaction).toHaveBeenCalledWith({
      ...transaction,
      messages: [],
      neededToProceed: [{ name: IDX_STEP.PIV_IDP, type: 'X509' }],
      availableSteps: [{ name: IDX_STEP.PIV_IDP, type: 'X509' }],
      nextStep: { name: IDX_STEP.PIV_IDP, type: 'X509' },
    });
  });
  it('should add Fastpass button when exists in remediation', async () => {
    transaction.nextStep!.name = IDX_STEP.IDENTIFY;
    transaction.neededToProceed = [
      { name: IDX_STEP.IDENTIFY },
      { name: IDX_STEP.LAUNCH_AUTHENTICATOR },
    ];
    const updatedFormBag = transformIDPButtons({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect((updatedFormBag.uischema.elements[1] as LaunchAuthenticatorButtonElement).label).toBe('oktaVerify.button');
    expect((updatedFormBag.uischema.elements[1] as LaunchAuthenticatorButtonElement).options.step)
      .toBe(IDX_STEP.LAUNCH_AUTHENTICATOR);
    expect((updatedFormBag.uischema.elements[1] as LaunchAuthenticatorButtonElement).type)
      .toBe('LaunchAuthenticatorButton');
    expect((updatedFormBag.uischema.elements[2] as DividerElement).options?.text)
      .toBe('socialauth.divider.text');
  });
});
