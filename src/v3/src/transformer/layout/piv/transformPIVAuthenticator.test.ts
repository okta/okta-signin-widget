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
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';

import {
  DescriptionElement, PIVButtonElement, TitleElement, WidgetProps,
} from '../../../types';
import { transformPIVAuthenticator } from './transformPIVAuthenticator';

describe('PIV Authenticator Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;

  beforeEach(() => {
    formBag.uischema.elements = [];
    widgetProps = {};
  });

  it('should create PIV/CAC button, title, and description elements for display', () => {
    transaction.nextStep = {
      name: IDX_STEP.PIV_IDP,
    };
    const updatedFormBag = transformPIVAuthenticator({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).type)
      .toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('piv.cac.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).type)
      .toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe('piv.cac.card.insert');
    expect((updatedFormBag.uischema.elements[2] as PIVButtonElement).type).toBe('PIVButton');
    expect((updatedFormBag.uischema.elements[2] as PIVButtonElement).label).toBe('retry');
    expect((updatedFormBag.uischema.elements[2] as PIVButtonElement).translations)
      .toEqual([{ i18nKey: 'retry', name: 'label', value: 'retry' }]);
  });
});
