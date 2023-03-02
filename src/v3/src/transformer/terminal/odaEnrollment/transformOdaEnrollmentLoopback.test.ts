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
  TitleElement,
  UISchemaElement,
  UISchemaLayout,
  WidgetProps,
} from '../../../types';
import { transformOdaEnrollmentLoopback } from './transformOdaEnrollmentLoopback';

describe('Terminal ODA enrollment Loopback transformer', () => {
  const transaction = getStubTransaction(IdxStatus.TERMINAL);
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;

  beforeEach(() => {
    formBag.uischema.elements = [];
    transaction.messages = [];
    widgetProps = {};
  });

  it('adds iOS UI elements appropriately when platform is iOS', () => {
    transaction.context = {
      deviceEnrollment: {
        value: {
          name: 'oda',
          challengeMethod: 'LOOPBACK',
          signInUrl: 'https://okta.com',
          platform: 'IOS',
        },
      },
    } as unknown as IdxContext;

    const updatedFormBag = transformOdaEnrollmentLoopback({ formBag, transaction, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();

    expect(formBag.uischema.elements.length).toBe(3);

    expect(formBag.uischema.elements[0].type).toBe('Title');
    expect((formBag.uischema.elements[0] as TitleElement).options.content).toBe('enroll.title.oda');

    expect((formBag.uischema.elements[2] as UISchemaElement).type).toBe('List');

    const listElement = formBag.uischema.elements[2] as ListElement;
    const listItems = listElement.options.items;

    expect(listItems.length).toBe(6);

    const listItemOne = listItems[0];
    expect((listItemOne as UISchemaLayout).elements.length).toBe(2);
    expect(((listItemOne as UISchemaLayout).elements[0] as DescriptionElement).options.content).toBe('enroll.mdm.step.copyLink');

    const listItemFour = listItems[3];
    expect(((listItemFour as UISchemaLayout).elements[0] as DescriptionElement).options.content).toBe('enroll.oda.step1');

    const listItemFive = listItems[4];
    expect(((listItemFive as UISchemaLayout).elements[1] as DescriptionElement).options.content).toBe('<span class="no-translate">https://okta.com</span>');
  });

  it('adds iOS UI elements appropriately when platform is Android and challenge method is loopback', () => {
    transaction.context = {
      deviceEnrollment: {
        value: {
          name: 'oda',
          challengeMethod: 'LOOPBACK',
          signInUrl: 'https://okta.com',
          platform: 'ANDROID',
        },
      },
    } as unknown as IdxContext;

    const updatedFormBag = transformOdaEnrollmentLoopback({ formBag, transaction, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();

    expect(formBag.uischema.elements.length).toBe(3);

    expect(formBag.uischema.elements[0].type).toBe('Title');
    expect((formBag.uischema.elements[0] as TitleElement).options.content).toBe('enroll.title.oda');

    expect((formBag.uischema.elements[2] as UISchemaElement).type).toBe('List');

    const listElement = formBag.uischema.elements[2] as ListElement;
    const listItems = listElement.options.items;

    expect(listItems.length).toBe(4);

    const listItemOne = listItems[0];
    expect(((listItemOne as UISchemaLayout).elements[0] as DescriptionElement).options.content).toBe('enroll.oda.android.step1');

    const listItemThree = listItems[2];
    expect(((listItemThree as UISchemaLayout).elements[1] as DescriptionElement).options.content).toBe('<span class="no-translate">https://okta.com</span>');
  });
});
