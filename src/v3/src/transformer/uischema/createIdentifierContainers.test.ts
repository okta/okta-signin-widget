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

import { IdxTransaction } from '@okta/okta-auth-js';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  FormBag,
  IdentifierContainerElement,
  UISchemaElement,
  WidgetProps,
} from 'src/types';

import { createIdentifierContainers } from './createIdentifierContainers';

describe('createIdentifierContainers Tests', () => {
  const mockUserId = 'testUser@okta.com';
  const transactionMockUserId = 'transactionUser@okta.com';
  let transaction: IdxTransaction;
  let formBag: FormBag;
  let widgetProps: WidgetProps;

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    formBag = getStubFormBag();

    formBag.uischema.elements = [];
    widgetProps = {};
  });

  it('should create IdentifierContainer element when user exists in transaction context', async () => {
    transaction.context.user = {
      type: 'object',
      value: { identifier: transactionMockUserId, profile: { firstName: 'test', lastName: 'user' } },
    };
    const updatedFormBag = createIdentifierContainers({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements.length).toEqual(1);
    expect(elements[0].type)
      .toBe('IdentifierContainer');
    expect((elements[0] as IdentifierContainerElement).options.identifier)
      .toBe(transactionMockUserId);
  });

  it('should not create IdentifierContainer element when one already exists in schema', async () => {
    formBag.uischema.elements = [
      {
        type: 'IdentifierContainer',
        options: {
          identifier: mockUserId,
        },
      } as IdentifierContainerElement,
    ];
    const updatedFormBag = createIdentifierContainers({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements.length).toEqual(1);
    expect(elements[0].type)
      .toBe('IdentifierContainer');
    expect((elements[0] as IdentifierContainerElement).options.identifier)
      .toBe(mockUserId);
  });

  it('should default to existing IdentifierContainer even when user exists in transaction context', async () => {
    transaction.context.user = {
      type: 'object',
      value: { identifier: transactionMockUserId, profile: { firstName: 'test', lastName: 'user' } },
    };
    formBag.uischema.elements = [
      {
        type: 'IdentifierContainer',
        options: {
          identifier: mockUserId,
        },
      } as IdentifierContainerElement,
    ];
    const updatedFormBag = createIdentifierContainers({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements.length).toEqual(1);
    expect(elements[0].type)
      .toBe('IdentifierContainer');
    expect((elements[0] as IdentifierContainerElement).options.identifier)
      .toBe(mockUserId);
  });

  it('should hide IdentifierContainer element when user exists in transaction context', async () => {
    transaction.context.user = {
      type: 'object',
      value: { identifier: transactionMockUserId, profile: { firstName: 'test', lastName: 'user' } },
    };
    const updatedFormBag = createIdentifierContainers({
      transaction, widgetProps, step: '', isClientTransaction: false, setMessage: () => {},
    })(formBag);
    const { elements } = <{ elements: UISchemaElement[] }>updatedFormBag.uischema;

    expect(updatedFormBag).toMatchSnapshot();
    expect(elements.length).toEqual(1);
    expect(elements[0].type)
      .toBe('IdentifierContainer');
    expect((elements[0] as IdentifierContainerElement).options.identifier)
      .toBe(transactionMockUserId);
  });
});
