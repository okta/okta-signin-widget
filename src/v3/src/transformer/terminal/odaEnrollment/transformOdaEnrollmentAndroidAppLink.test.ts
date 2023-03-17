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

import { IdxContext, IdxStatus } from '@okta/okta-auth-js';

import { getStubFormBag, getStubTransaction } from '../../../mocks/utils/utils';
import {
  DescriptionElement,
  ListElement,
  StepperLayout,
  StepperLinkElement,
  TitleElement,
  UISchemaLayout,
  WidgetProps,
} from '../../../types';
import { transformOdaEnrollmentAndroidAppLink } from './transformOdaEnrollmentAndroidAppLink';

describe('Terminal ODA enrollment Android App Link transformer', () => {
  const transaction = getStubTransaction(IdxStatus.TERMINAL);
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;

  beforeEach(() => {
    transaction.messages = [];
    widgetProps = {};
  });

  it('adds UI elements appropriately', () => {
    transaction.context = {
      deviceEnrollment: {
        value: {
          name: 'oda',
          challengeMethod: 'APP_LINK',
          signInUrl: 'https://okta.com',
          orgName: 'Okta',
        },
      },
    } as unknown as IdxContext;

    const updatedFormBag = transformOdaEnrollmentAndroidAppLink({
      formBag,
      transaction,
      widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();

    const [stepperLayout] = updatedFormBag.uischema.elements;
    const [layoutOne, layoutTwo, layoutThree] = (stepperLayout as StepperLayout).elements;

    expect(layoutOne.elements.length).toBe(3);
    expect((layoutOne.elements[0] as TitleElement).options.content)
      .toBe('enroll.title.oda.with.account');

    expect(layoutTwo.elements.length).toBe(5);
    expect((layoutTwo.elements[0] as TitleElement).options.content)
      .toBe('enroll.title.oda.with.account');

    expect((layoutTwo.elements[4] as StepperLinkElement).label)
      .toBe('oform.back');

    expect(layoutThree.elements.length).toBe(4);
    expect((layoutThree.elements[0] as TitleElement).options.content)
      .toBe('enroll.title.oda.without.account');

    const layoutThreeList = layoutThree.elements[2] as ListElement;

    expect(layoutThreeList.type).toBe('List');
    const layoutThreeListItemThree = layoutThreeList.options.items[2] as UISchemaLayout;

    expect((layoutThreeListItemThree.elements[1] as DescriptionElement).type).toBe('Description');
    expect((layoutThreeListItemThree.elements[1] as DescriptionElement).options.content)
      .toBe('<span class="no-translate">https://okta.com</span>');
    expect((layoutThree.elements[3] as StepperLinkElement).label)
      .toBe('oform.back');
  });
});
