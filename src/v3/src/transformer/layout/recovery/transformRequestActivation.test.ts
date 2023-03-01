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
  InfoboxElement,
  WidgetProps,
} from '../../../types';
import { transformRequestActivation } from './transformRequestActivation';

describe('Identity Request Activation Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;

  beforeEach(() => {
    formBag.uischema.elements = [];
    widgetProps = {};
  });

  it('should add title, message box, and request activation button', () => {
    const updatedFormBag = transformRequestActivation({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[1] as InfoboxElement).options?.message)
      .toEqual({
        class: 'ERROR',
        i18n: { key: 'idx.expired.activation.token' },
        message: 'idx.expired.activation.token',
      });
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('oie.activation.request.email.button');
  });
});
