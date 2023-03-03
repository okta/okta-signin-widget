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

import { IdxTransaction, Input } from '@okta/okta-auth-js';

import { RegistrationErrorCallback } from '../../../../types';
import { IDX_STEP } from '../../constants';
import { getStubFormBag, getStubTransactionWithNextStep } from '../../mocks/utils/utils';
import {
  FormBag,
  RegistrationElementSchema,
  RegistrationSchemaCallbackV3,
  WidgetProps,
} from '../../types';
import { PIV_TYPE, transformTransactionData } from './transform';

describe('Transaction Data transformer tests', () => {
  let transaction: IdxTransaction;
  let formBag: FormBag;
  let widgetProps: WidgetProps;

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    formBag = getStubFormBag();
    widgetProps = {};
  });

  it('should update remediation name for PIV when it exists in remediation and is the NextStep', async () => {
    transaction.neededToProceed = [{
      name: IDX_STEP.REDIRECT_IDP,
      type: PIV_TYPE,
    }];
    // @ts-expect-error OKTA-565392 type missing from NextStep type
    transaction.nextStep = { href: 'https://okta1.com/mtls/idp', name: IDX_STEP.REDIRECT_IDP, type: PIV_TYPE };
    const options = {
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    };
    transformTransactionData(options)(formBag);

    expect(options.transaction.neededToProceed[0].name).toBe(IDX_STEP.PIV_IDP);
    expect(options.transaction.nextStep!.name).toBe(IDX_STEP.PIV_IDP);
    expect(options.step).toBe(IDX_STEP.PIV_IDP);
  });

  it('should update remediation name for PIV when it exists in remediation but is not the Next step', async () => {
    transaction.neededToProceed = [
      { name: IDX_STEP.IDENTIFY },
      { name: IDX_STEP.REDIRECT_IDP, type: PIV_TYPE },
    ];
    transaction.nextStep = { name: IDX_STEP.IDENTIFY };
    const options = {
      transaction,
      widgetProps,
      step: IDX_STEP.IDENTIFY,
      isClientTransaction: false,
      setMessage: () => {},
    };
    transformTransactionData(options)(formBag);

    expect(options.transaction.neededToProceed[1].name).toBe(IDX_STEP.PIV_IDP);
    expect(options.transaction.nextStep!.name).toBe(IDX_STEP.IDENTIFY);
    expect(options.step).toBe(IDX_STEP.IDENTIFY);
  });

  it('should not update remediation name when PIV does not exist in remediation', async () => {
    transaction.neededToProceed = [{ name: IDX_STEP.IDENTIFY }];
    transaction.nextStep = { name: IDX_STEP.IDENTIFY };
    const options = {
      transaction,
      widgetProps,
      step: IDX_STEP.IDENTIFY,
      isClientTransaction: false,
      setMessage: () => {},
    };
    transformTransactionData(options)(formBag);

    expect(options.transaction.neededToProceed[0].name).toBe(IDX_STEP.IDENTIFY);
    expect(options.transaction.nextStep!.name).toBe(IDX_STEP.IDENTIFY);
    expect(options.step).toBe(IDX_STEP.IDENTIFY);
  });

  it('should not execute parseSchema callback when not defined in widget config options', () => {
    transaction.nextStep = {
      name: IDX_STEP.ENROLL_PROFILE,
      inputs: [
        {
          name: 'userProfile',
          value: [
            { name: 'firstName', label: 'First name', required: true },
            { name: 'lastName', label: 'Last name', required: true },
            { name: 'email', label: 'Email', required: true },
          ],
        },
      ],
    };
    const options = {
      transaction,
      widgetProps: { registration: { preSubmit: () => {} } },
      step: IDX_STEP.IDENTIFY,
      isClientTransaction: false,
      setMessage: () => {},
    };
    transformTransactionData(options)(formBag);

    expect((transaction.nextStep?.inputs?.[0]?.value as Input[])?.length).toBe(3);
    expect(transaction.nextStep?.inputs).toMatchSnapshot();
  });

  it('should modify input fields in transaction based on the parseSchema callback', () => {
    transaction.nextStep = {
      name: IDX_STEP.ENROLL_PROFILE,
      inputs: [
        {
          name: 'userProfile',
          value: [
            { name: 'firstName', label: 'First name', required: true },
            { name: 'lastName', label: 'Last name', required: true },
            { name: 'email', label: 'Email', required: true },
          ],
        },
      ],
    };
    const options = {
      transaction,
      widgetProps: {
        registration: {
          parseSchema: (
            schema: RegistrationElementSchema[],
            onSuccess: RegistrationSchemaCallbackV3,
          ) => {
            schema.push({
              name: 'userProfile.address',
              type: 'text',
              placeholder: 'Enter your street address',
              maxLength: 255,
              'label-top': true,
              label: 'Street Address',
              required: true,
              wide: true,
              sublabel: 'Use your home address',
            });
            schema.push({
              name: 'userProfile.dessert',
              type: 'radio',
              'label-top': true,
              label: 'Select your favorite dessert',
              required: true,
              wide: true,
              options: [
                { label: 'I like cookies', value: 'likeCookies' },
                { label: 'I like muffins', value: 'likeMuffins' },
                { label: 'I like games', value: 'likeGames' },
              ],
            });
            schema.push({
              name: 'userProfile.car',
              type: 'select',
              placeholder: 'Select your car',
              'label-top': true,
              label: 'Select your car',
              required: true,
              wide: true,
              options: {
                bmw: 'BMW',
                chevy: 'Chevrolet',
                volkswagon: 'Volkswagon',
              },
            });
            schema.push({
              name: 'userProfile.agreement',
              type: 'checkbox',
              placeholder: 'I agree to the terms of service',
              'label-top': true,
              label: 'Confirm your agreement to terms of service',
              required: true,
              wide: true,
            });
            schema.find(({ name }) => name === 'userProfile.firstName')!.required = false;
            onSuccess(schema);
          },
        },
      },
      step: IDX_STEP.IDENTIFY,
      isClientTransaction: false,
      setMessage: () => {},
    };
    transformTransactionData(options)(formBag);

    expect((transaction.nextStep?.inputs?.[0]?.value as Input[])?.length).toBe(7);
    expect((transaction.nextStep?.inputs?.[0]?.value as Input[])?.[0].required).toBe(false);
    expect(transaction.nextStep?.inputs).toMatchSnapshot();
  });

  it('should set global and field level error messages when triggered from registration callback', () => {
    transaction.nextStep = {
      name: IDX_STEP.ENROLL_PROFILE,
      inputs: [
        {
          name: 'userProfile',
          value: [
            { name: 'firstName', label: 'First name', required: true },
            { name: 'lastName', label: 'Last name', required: true },
            { name: 'email', label: 'Email', required: true },
          ],
        },
      ],
    };
    const mockSetMessageFn = jest.fn();
    const options = {
      transaction,
      widgetProps: {
        registration: {
          parseSchema: (
            _schema: RegistrationElementSchema[],
            _onSuccess: RegistrationSchemaCallbackV3,
            onFailure: RegistrationErrorCallback,
          ) => {
            const error = {
              errorSummary: 'This is my custom global message',
              errorCauses: [{
                property: 'userProfile.lastName',
                errorSummary: 'Custom parseSchema error',
              }],
            };
            onFailure(error);
          },
        },
      },
      step: IDX_STEP.IDENTIFY,
      isClientTransaction: false,
      setMessage: mockSetMessageFn,
    };
    transformTransactionData(options)(formBag);

    expect((transaction.nextStep?.inputs?.[0]?.value as Input[])?.length).toBe(3);
    // @ts-expect-error messages property missing from Input
    expect((transaction.nextStep?.inputs?.[0]?.value as Input[])?.[1].messages?.value?.[0].message)
      .toBe('Custom parseSchema error');
    expect(mockSetMessageFn).toHaveBeenCalledWith({
      class: 'ERROR',
      i18n: { key: '' },
      message: 'This is my custom global message',
    });
    expect(transaction.nextStep?.inputs).toMatchSnapshot();
  });
});
