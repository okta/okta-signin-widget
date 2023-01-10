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
  FormBag,
  WidgetProps,
} from '../../types';
import { PIV_TYPE, transformTransactionData } from './transform';

// TODO: complete tests 
describe('Transaction Data transformer tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  let widgetProps: WidgetProps;

  beforeEach(() => {
    formBag = getStubFormBag();
    widgetProps = {};
  });

  it('should update remediation name for PIV when it exists in remediation and is the Next step', async () => {
    transaction.neededToProceed = [{
      name: IDX_STEP.REDIRECT_IDP,
      type: PIV_TYPE,
    }];
    const updatedFormBag = transformTransactionData({ transaction, widgetProps, step: '' })(formBag);

    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should update remediation name for PIV when it exists in remediation but is not the Next step', async () => {
    transaction.neededToProceed = [{
      name: IDX_STEP.REDIRECT_IDP,
      type: PIV_TYPE,
    }];
    const updatedFormBag = transformTransactionData({ transaction, widgetProps, step: '' })(formBag);

    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should not update remediation name when PIV does not exist in remediation', async () => {
    transaction.neededToProceed = [{
      name: IDX_STEP.REDIRECT_IDP,
      type: PIV_TYPE,
    }];
    const updatedFormBag = transformTransactionData({ transaction, widgetProps, step: '' })(formBag);

    expect(updatedFormBag).toMatchSnapshot();
  });
});
