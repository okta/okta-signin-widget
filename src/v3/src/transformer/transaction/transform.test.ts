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

import { IdxTransaction } from '@okta/okta-auth-js';

import { IDX_STEP } from '../../constants';
import { getStubFormBag, getStubTransactionWithNextStep } from '../../mocks/utils/utils';
import {
  FormBag,
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
    const options = { transaction, widgetProps, step: '' };
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
    const options = { transaction, widgetProps, step: IDX_STEP.IDENTIFY };
    transformTransactionData(options)(formBag);

    expect(options.transaction.neededToProceed[1].name).toBe(IDX_STEP.PIV_IDP);
    expect(options.transaction.nextStep!.name).toBe(IDX_STEP.IDENTIFY);
    expect(options.step).toBe(IDX_STEP.IDENTIFY);
  });

  it('should not update remediation name when PIV does not exist in remediation', async () => {
    transaction.neededToProceed = [{ name: IDX_STEP.IDENTIFY }];
    transaction.nextStep = { name: IDX_STEP.IDENTIFY };
    const options = { transaction, widgetProps, step: IDX_STEP.IDENTIFY };
    transformTransactionData(options)(formBag);

    expect(options.transaction.neededToProceed[0].name).toBe(IDX_STEP.IDENTIFY);
    expect(options.transaction.nextStep!.name).toBe(IDX_STEP.IDENTIFY);
    expect(options.step).toBe(IDX_STEP.IDENTIFY);
  });
});
