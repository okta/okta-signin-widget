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
import { render } from '@testing-library/preact';
import { h } from 'preact';
import { IDX_STEP } from 'src/constants';
import { getStubTransaction } from 'src/mocks/utils/utils';
import { Nullish, WidgetProps } from 'src/types';

import IdentifierContainer from './IdentifierContainer';

let transaction: Nullish<IdxTransaction>;
let mockProps: WidgetProps = {};

jest.mock('../../contexts', () => ({
  useWidgetContext: jest.fn().mockImplementation(
    () => ({ widgetProps: mockProps, idxTransaction: transaction }),
  ),
}));

describe('IdentifierContainer Tests', () => {
  beforeEach(() => {
    transaction = getStubTransaction();
    mockProps = {};
  });

  it('should not display identifier container if transaction is null', async () => {
    transaction = null;
    const { container } = render(<IdentifierContainer />);

    expect(container.firstChild).toBeNull();
  });

  it('should not display identifier container if transaction NextStep is "identify"', async () => {
    (transaction as IdxTransaction).nextStep = { name: IDX_STEP.IDENTIFY };
    const { container } = render(<IdentifierContainer />);

    expect(container.firstChild).toBeNull();
  });

  it('should not display identifier container if user does not exist in transaction context', async () => {
    const { container } = render(<IdentifierContainer />);

    expect(container.firstChild).toBeNull();
  });

  it('should not display identifier when user exists in transaction context but features.showIdentifier = false', async () => {
    mockProps = { features: { showIdentifier: false } };
    const mockUserId = 'testUser@okta.com';
    (transaction as IdxTransaction).context.user = {
      type: 'object',
      value: { identifier: mockUserId, profile: { firstName: 'test', lastName: 'user' } },
    };
    const { container } = render(<IdentifierContainer />);

    expect(container.firstChild).toBeNull();
  });

  it('should display identifier when user exists in transaction context and features.showIdentifier prop is not provided', async () => {
    const mockUserId = 'testUser@okta.com';
    (transaction as IdxTransaction).context.user = {
      type: 'object',
      value: { identifier: mockUserId, profile: { firstName: 'test', lastName: 'user' } },
    };
    const { findByText } = render(<IdentifierContainer />);

    expect(await findByText(mockUserId, { selector: 'span' })).toBeDefined();
  });

  it('should display identifier when user exists in transaction context and features.showIdentifier = true', async () => {
    mockProps = { features: { showIdentifier: true } };
    const mockUserId = 'testUser@okta.com';
    (transaction as IdxTransaction).context.user = {
      type: 'object',
      value: { identifier: mockUserId, profile: { firstName: 'test', lastName: 'user' } },
    };
    const { findByText } = render(<IdentifierContainer />);

    expect(await findByText(mockUserId, { selector: 'span' })).toBeDefined();
  });
});
