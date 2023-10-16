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
import { cleanup, render, RenderResult } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import { h, JSX } from 'preact';
import { IDX_STEP } from 'src/constants';
import { getStubTransaction } from 'src/mocks/utils/utils';
import { IdentifierContainerElement, UISchemaElementComponentProps, WidgetProps } from 'src/types';

import IdentifierContainer from './IdentifierContainer';

const mockUserId = 'testUser@okta.com';
let transaction: IdxTransaction | null;
let mockWidgetProps: WidgetProps = {};

function setup(jsx: JSX.Element): RenderResult & { user: UserEvent } {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

const getComponentProps = (
  options?: Record<string, unknown>,
): UISchemaElementComponentProps & { uischema: IdentifierContainerElement; } => ({
  uischema: {
    type: 'IdentifierContainer',
    options: {
      identifier: mockUserId,
      ...options,
    },
  },
});

jest.mock('../../contexts', () => ({
  useWidgetContext: jest.fn().mockImplementation(
    () => ({ widgetProps: mockWidgetProps, idxTransaction: transaction }),
  ),
}));

describe('IdentifierContainer Tests', () => {
  let props: UISchemaElementComponentProps & { uischema: IdentifierContainerElement; };

  beforeEach(() => {
    transaction = getStubTransaction();
    mockWidgetProps = {};
  });

  afterEach(() => {
    cleanup();
  });

  it('should not display identifier container if identifier is empty string', async () => {
    props = getComponentProps();
    props.uischema.options.identifier = '';
    const { container } = setup(<IdentifierContainer {...props} />);

    expect(container.firstChild).toBeNull();
  });

  it('should not display identifier container if transaction NextStep is "identify"', async () => {
    (transaction as IdxTransaction).nextStep = { name: IDX_STEP.IDENTIFY };
    props = getComponentProps();
    const { container } = setup(<IdentifierContainer {...props} />);

    expect(container.firstChild).toBeNull();
  });

  it('should not display identifier when features.showIdentifier = false', async () => {
    mockWidgetProps = { features: { showIdentifier: false } };
    props = getComponentProps();
    const { container } = setup(<IdentifierContainer {...props} />);

    expect(container.firstChild).toBeNull();
  });

  it('should display identifier when features.showIdentifier prop is not provided', async () => {
    props = getComponentProps();
    const { findByText } = setup(<IdentifierContainer {...props} />);

    expect(await findByText(mockUserId, { selector: 'span' })).toBeDefined();
  });

  it('should display identifier when features.showIdentifier = true', async () => {
    mockWidgetProps = { features: { showIdentifier: true } };
    props = getComponentProps();
    const { findByText } = setup(<IdentifierContainer {...props} />);

    expect(await findByText(mockUserId, { selector: 'span' })).toBeDefined();
  });
});
