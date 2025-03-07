/*
 * Copyright (c) 2025-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

// href can be undefined based on logic in Link.tsx, disable the following eslint rule for this test file
/* eslint-disable jsx-a11y/anchor-is-valid */
import { render, RenderResult } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';
import { ReactNode } from 'preact/compat';

import { WidgetContextProvider } from '../../contexts';
import { LinkElement } from '../../types';
import Link from './Link';

const renderWithForm = (ui: ReactNode) => {
  const widgetContext = {
    loading: false,
    widgetProps: {},
  };
  const mockOnSubmit = jest.fn((e) => e.preventDefault());

  return [
    render(
      <WidgetContextProvider value={widgetContext}>
        <form onSubmit={mockOnSubmit}>
          <input data-se="input" />
          {ui}
          <button type="submit">Submit</button>
        </form>
      </WidgetContextProvider>,
    ),
    mockOnSubmit,
  ] as [RenderResult, jest.Mock];
};

const schemaDefaultOptions = {
  label: 'Test Link',
  href: undefined,
  dataSe: 'test-link',
  actionParams: {},
  isActionStep: false,
  step: 'test-step',
  target: '_self',
  onClick: jest.fn(),
  rel: '',
};

describe('Link Component', () => {
  it('should not trigger onClick handler when enter key is pressed', async () => {
    const user = userEvent.setup();
    const uischema = {
      focus: false,
      options: { ...schemaDefaultOptions } as LinkElement['options'],
    };
    const [
      { getByTestId },
      mockOnSubmit,
    ] = renderWithForm(<Link uischema={uischema as LinkElement} />);

    const input = getByTestId('input');
    await user.type(input, 'abc{enter}');

    expect(uischema.options.onClick).not.toHaveBeenCalled();
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should not trigger onClick handler when enter key is pressed when renders with href', async () => {
    const user = userEvent.setup();
    const uischema = {
      type: 'Link',
      focus: false,
      options: { ...schemaDefaultOptions, href: 'http://mock.abc' } as LinkElement['options'],
    };
    const [
      { getByTestId },
      mockOnSubmit,
    ] = renderWithForm(<Link uischema={uischema as LinkElement} />);

    const input = getByTestId('input');
    await user.type(input, 'abc{enter}');

    expect(uischema.options.onClick).not.toHaveBeenCalled();
    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
