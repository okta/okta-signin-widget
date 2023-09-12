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
import { IDX_STEP } from 'src/constants';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  DescriptionElement,
  InfoboxElement,
  LinkElement,
  TitleElement,
  UISchemaLayout,
  UISchemaLayoutType,
  WidgetMessage,
  WidgetProps,
} from 'src/types';

import { extractFirstWidgetMessageStr, extractPageTitle } from '.';

describe('FormUtils Tests', () => {
  describe('WidgetMessage extraction tests', () => {
    it('should extract first message string from an array of widget messages', () => {
      const TEST_MESSAGE_STR = 'This is a test message';
      const message: WidgetMessage = { message: TEST_MESSAGE_STR };
      const message2: WidgetMessage = { message: 'This is another message' };
      const messageStr = extractFirstWidgetMessageStr([message, message2]);

      expect(messageStr).toBe(TEST_MESSAGE_STR);
    });

    it('should extract first message string from a widget message object', () => {
      const TEST_MESSAGE_STR = 'This is a test message';
      const message: WidgetMessage = { message: TEST_MESSAGE_STR };
      const messageStr = extractFirstWidgetMessageStr(message);

      expect(messageStr).toBe(TEST_MESSAGE_STR);
    });

    it('should extract first message string from a nested widget message object', () => {
      const TEST_MESSAGE_STR = 'This is a test message';
      const message: WidgetMessage = {
        message: [{
          message: [{ message: TEST_MESSAGE_STR }] as WidgetMessage[],
        }] as WidgetMessage[],
      };
      const messageStr = extractFirstWidgetMessageStr(message);

      expect(messageStr).toBe(TEST_MESSAGE_STR);
    });
  });

  describe('ExtractPageTitle tests', () => {
    let uischema: UISchemaLayout;
    let widgetProps: WidgetProps;
    let transaction: IdxTransaction;

    beforeEach(() => {
      uischema = {
        type: UISchemaLayoutType.VERTICAL,
        elements: [],
      };
      widgetProps = {};
      transaction = getStubTransactionWithNextStep();
    });

    it('should return application name as title when nextStep is consent-admin', () => {
      transaction.nextStep = {
        ...transaction.nextStep,
        name: IDX_STEP.CONSENT_ADMIN,
      };
      transaction.rawIdxState = {
        ...transaction.rawIdxState,
        // @ts-expect-error OKTA-598868 app is missing from rawIdxState type
        app: {
          type: 'object',
          value: {
            label: 'Workflow Application',
          },
        },
      };

      const title = extractPageTitle(uischema, widgetProps, transaction);

      expect(title).toBe('Workflow Application');
    });

    it('should not return page title when no title elements exist and no page content', () => {
      const linkEle: LinkElement = {
        type: 'Link',
        options: {
          label: 'Back to signin',
          step: 'identify',
        },
      };
      uischema.elements.push(linkEle);

      const title = extractPageTitle(uischema, widgetProps, transaction);

      expect(title).toBeNull();
    });

    it('should extract page title when Title element exists in uischema', () => {
      const TEST_MESSAGE_STR = 'This is a test message';
      const titleEle: TitleElement = {
        type: 'Title',
        options: { content: TEST_MESSAGE_STR },
      };
      uischema.elements.push(titleEle);

      const title = extractPageTitle(uischema, widgetProps, transaction);

      expect(title).toBe(TEST_MESSAGE_STR);
    });

    it('should extract page title from first Title element when multiple Title elements exists in uischema', () => {
      const TEST_MESSAGE_STR = 'This is a test message';
      const titleEle: TitleElement = {
        type: 'Title',
        options: { content: TEST_MESSAGE_STR },
      };
      const titleEle2: TitleElement = {
        type: 'Title',
        options: { content: 'This is another message' },
      };
      uischema.elements.push(titleEle);
      uischema.elements.push(titleEle2);

      const title = extractPageTitle(uischema, widgetProps, transaction);

      expect(title).toBe(TEST_MESSAGE_STR);
    });

    it('should extract page title when Error Info Box exists in uischema', () => {
      const TEST_MESSAGE_STR = 'This is a test message';
      const errorBoxEle: InfoboxElement = {
        type: 'InfoBox',
        options: {
          message: {
            message: TEST_MESSAGE_STR,
          },
          class: 'ERROR',
        },
      };
      uischema.elements.push(errorBoxEle);

      const title = extractPageTitle(uischema, widgetProps, transaction);

      expect(title).toBe(TEST_MESSAGE_STR);
    });

    it('should extract page title when Error Info Box exists in uischema with nested message object', () => {
      const TEST_MESSAGE_STR = 'This is a test message';
      const errorBoxEle: InfoboxElement = {
        type: 'InfoBox',
        options: {
          message: {
            message: [{
              message: [{
                message: [{ message: TEST_MESSAGE_STR } as WidgetMessage] as WidgetMessage[],
              }] as WidgetMessage[],
            }, { message: 'This is another test message' }] as WidgetMessage[],
          },
          class: 'ERROR',
        },
      };
      const linkEle: LinkElement = {
        type: 'Link',
        options: {
          label: 'Back to signin',
          step: 'identify',
        },
      };
      uischema.elements.push(errorBoxEle);
      uischema.elements.push(linkEle);

      const title = extractPageTitle(uischema, widgetProps, transaction);

      expect(title).toBe(TEST_MESSAGE_STR);
    });

    it('should extract page title when only description exists in uischema', () => {
      const TEST_MESSAGE_STR = 'This is a test message';
      const descrEle: DescriptionElement = {
        type: 'Description',
        options: { content: TEST_MESSAGE_STR },
      };
      const linkEle: LinkElement = {
        type: 'Link',
        options: {
          label: 'Back to signin',
          step: 'identify',
        },
      };
      uischema.elements.push(descrEle);
      uischema.elements.push(linkEle);

      const title = extractPageTitle(uischema, widgetProps, transaction);

      expect(title).toBe(TEST_MESSAGE_STR);
    });
  });
});
