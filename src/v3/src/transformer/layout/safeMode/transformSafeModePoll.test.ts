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
  DescriptionElement,
  TitleElement,
  UISchemaLayout,
  UISchemaLayoutType,
  WidgetProps,
} from 'src/types';

import { transformSafeModePoll } from './transformSafeModePoll';

jest.mock('src/util/generateRandomString', () => ({
  generateRandomString: () => 'random-string',
}));

describe('Transform Safe Mode Poll Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  const widgetProps: WidgetProps = {};

  beforeEach(() => {
    formBag.uischema.elements = [];
    transaction.nextStep = {
      name: IDX_STEP.POLL,
      refresh: 2000,
    };
  });

  it('renders safe mode poll view', () => {
    const updatedFormBag = transformSafeModePoll({
      transaction,
      formBag,
      widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect((updatedFormBag.uischema.elements[0] as UISchemaLayout).type)
      .toBe(UISchemaLayoutType.STEPPER);

    const [step1, step2] = (
      updatedFormBag.uischema.elements[0] as UISchemaLayout
    ).elements as UISchemaLayout[];

    expect(step1.type).toBe(UISchemaLayoutType.VERTICAL);
    expect(step1.elements.length).toBe(3);
    expect((step1.elements[0] as TitleElement).options.content)
      .toBe('poll.form.title');
    expect((step1.elements[1] as DescriptionElement).options.content)
      .toBe('poll.form.message');
    expect((step1.elements[2]).type)
      .toBe('StepperNavigator');

    expect(step2.type).toBe(UISchemaLayoutType.VERTICAL);
    expect(step2.elements.length).toBe(2);
    expect((step2.elements[0] as TitleElement).options.content)
      .toBe('poll.form.title');
    expect((step2.elements[1]).type)
      .toBe('Spinner');
  });
});
