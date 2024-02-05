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

import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';

import {
  ButtonElement,
  FieldElement,
  TitleElement,
  WidgetProps,
} from '../../../types';
import { transformIdentityRecovery } from './transformIdentityRecovery';

describe('Identity Recovery Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;

  beforeEach(() => {
    formBag.uischema.elements = [
      {
        type: 'Field',
        label: 'Username',
        options: { inputMeta: { name: 'identifier' } },
      } as FieldElement,
    ];
    widgetProps = {};
  });

  it('should add generic title and update label for forgot password identifier field and submit button'
    + ' when no brand name exists', () => {
    const updatedFormBag = transformIdentityRecovery({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.reset.title.generic');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('identifier');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('oform.next');
  });

  it('should add branded title and update label for forgot password identifier field and submit button'
    + ' when brand name exists', () => {
    const mockBrandName = 'Acme Corp';
    widgetProps = { brandName: mockBrandName };
    const updatedFormBag = transformIdentityRecovery({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('password.reset.title.specific');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('identifier');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('oform.next');
  });
});
