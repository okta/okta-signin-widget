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

import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import { FormBag } from 'src/types';

import { transformPoll } from './transformPollFromNextStep';

describe('TransformPollFromNextStep Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;

  beforeEach(() => {
    formBag = {
      envelope: {},
      data: {},
      schema: {},
      uischema: {
        type: 'VerticalLayout',
        elements: [],
      },
    };
  });

  it('should not modify formBag when poll object does not exist', () => {
    const updatedFormBag = transformPoll(transaction, formBag);

    expect(updatedFormBag).toBe(formBag);
  });

  it('should not modify formBag when refresh value does not exist on poll object', () => {
    transaction.nextStep = {
      name: '',
      poll: {},
    };
    const updatedFormBag = transformPoll(transaction, formBag);

    expect(updatedFormBag).toBe(formBag);
  });

  it('should add polling element to formBag when refresh value exists on poll object', () => {
    transaction.nextStep = {
      name: '',
      poll: { refresh: 5000 },
    };
    const updatedFormBag = transformPoll(transaction, formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Polling');
    expect(updatedFormBag.uischema.elements[0].options?.refresh).toBe(5000);
    expect(updatedFormBag.uischema.elements[0].options?.idxMethod).toBe('poll');
    expect(updatedFormBag.uischema.elements[0].options?.skipValidation).toBeTruthy();
  });
});
