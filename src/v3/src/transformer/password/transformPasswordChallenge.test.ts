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
import {
  ButtonElement,
  ButtonType,
  FormBag,
  TitleElement,
  UISchemaLayoutType,
  WidgetProps,
} from 'src/types';

import { transformPasswordChallenge } from './transformPasswordChallenge';

describe('Password Challenge Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  let mockProps: WidgetProps;
  beforeEach(() => {
    formBag = {
      dataSchema: {},
      schema: {},
      uischema: {
        type: UISchemaLayoutType.VERTICAL,
        elements: [],
      },
      data: {},
    };
    mockProps = {};
  });

  it('should add title & submt button elements to ui schema when transforming password challenge step', () => {
    const updatedFormBag = transformPasswordChallenge(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(2);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.password.challenge.title');
    expect((updatedFormBag.uischema.elements[1] as ButtonElement).label)
      .toBe('mfa.challenge.verify');
    expect((updatedFormBag.uischema.elements[1] as ButtonElement).type)
      .toBe('Button');
    expect((updatedFormBag.uischema.elements[1] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });
});
