/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
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
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement, DescriptionElement, FieldElement, FormBag, TitleElement, WidgetProps,
} from 'src/types';

import { loc } from '../../../util/locUtil';
import { transformTacAuthenticator } from './transformTacAuthenticator';

jest.mock('../../../util/locUtil', () => ({
  loc: jest.fn().mockImplementation((key) => (key)),
}));

describe('transformTacAuthenticator Tests', () => {
  let transaction: IdxTransaction;
  let widgetProps: WidgetProps;
  let formBag: FormBag;

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    widgetProps = {};
    formBag = getStubFormBag();
    formBag.uischema.elements = [
      {
        type: 'Field',
        options: { inputMeta: { name: 'credentials.passcode' } },
      } as FieldElement,
    ];
  });

  it('should build TAC view elements with generic display name in title', () => {
    const updatedFormBag = transformTacAuthenticator({ transaction, widgetProps, formBag });

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag).toMatchSnapshot();
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.verify.tac.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe('oie.verify.tac.description');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options.inputMeta.name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('mfa.challenge.verify');
    expect(loc)
      .toHaveBeenCalledWith('oie.verify.tac.title', 'login');
  });
});
