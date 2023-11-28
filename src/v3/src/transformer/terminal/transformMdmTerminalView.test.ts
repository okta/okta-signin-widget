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

import { IdxContext, IdxStatus, IdxTransaction } from '@okta/okta-auth-js';

import { getStubFormBag, getStubTransaction } from '../../mocks/utils/utils';
import {
  ButtonElement,
  DescriptionElement,
  FormBag,
  ListElement,
  TitleElement,
  UISchemaLayout,
  WidgetProps,
} from '../../types';
import { transformMdmTerminalView } from './transformMdmTerminalView';

function testMdmTerminalViewLayout(updatedFormBag: Record<string, unknown>) {
  expect(updatedFormBag).toMatchSnapshot();

  expect(updatedFormBag.uischema.elements.length).toBe(3);
  expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
    .toBe('enroll.title.mdm');
  expect((updatedFormBag.uischema.elements[1] as DescriptionElement).type).toBe('Description');
  expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
    .toBe('enroll.explanation.mdm');

  const listElement = updatedFormBag.uischema.elements[2] as ListElement;
  expect(listElement.type).toBe('List');
  const listItems = listElement.options.items;

  expect(listItems.length).toBe(4);

  const listItemOne = listItems[0];
  expect((listItemOne as UISchemaLayout).elements.length).toBe(2);
  expect(((listItemOne as UISchemaLayout).elements[0] as DescriptionElement).options.content).toBe('enroll.mdm.step.copyLink');
  expect(((listItemOne as UISchemaLayout).elements[1] as ButtonElement).label).toBe('enroll.mdm.copyLink');
  expect(((listItemOne as UISchemaLayout).elements[1] as ButtonElement).type).toBe('Button');

  const listItemTwo = listItems[1];
  expect((listItemTwo as UISchemaLayout).elements.length).toBe(1);
  expect(((listItemTwo as UISchemaLayout).elements[0] as DescriptionElement).options.content).toBe('enroll.mdm.step.pasteLink');

  const listItemThree = listItems[2];
  expect((listItemThree as UISchemaLayout).elements.length).toBe(1);
  expect(((listItemThree as UISchemaLayout).elements[0] as DescriptionElement).options.content).toBe('enroll.mdm.step.followInstructions');

  const listItemFour = listItems[3];
  expect(((listItemFour as UISchemaLayout).elements[0] as DescriptionElement).options.content).toBe('enroll.mdm.step.relogin');
}

describe('Terminal MDM enrollment transformer', () => {
  let transaction: IdxTransaction;
  let formBag: FormBag;
  let widgetProps: WidgetProps;

  beforeEach(() => {
    transaction = getStubTransaction(IdxStatus.TERMINAL);
    formBag = getStubFormBag();
    transaction.messages = [];
    widgetProps = {};
  });

  it('adds UI elements appropriately when name is mdm', () => {
    transaction.context = {
      deviceEnrollment: {
        value: {
          name: 'mdm',
          enrollmentLink: 'https://okta.com',
          vendor: 'Okta',
        },
      },
    } as unknown as IdxContext;

    const updatedFormBag = transformMdmTerminalView({
      formBag,
      transaction,
      widgetProps,
    });

    testMdmTerminalViewLayout(updatedFormBag);
  });

  it('adds UI elements appropriately when name is ws1', () => {
    transaction.context = {
      deviceEnrollment: {
        value: {
          name: 'ws1',
          enrollmentLink: 'https://someExampleEnrollmentLink.com',
          vendor: 'VMWare Workspace ONE',
        },
      },
    } as unknown as IdxContext;

    const updatedFormBag = transformMdmTerminalView({
      formBag,
      transaction,
      widgetProps,
    });

    testMdmTerminalViewLayout(updatedFormBag);
  });
});
