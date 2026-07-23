/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { render } from '@testing-library/preact';
import { h } from 'preact';

import { WidgetContextProvider } from '../../contexts';
import { FieldElement, IWidgetContext } from '../../types';
import InputPassword from './InputPassword';

// The form-state HOC and value hooks are exercised elsewhere; stub them so this test
// focuses on the visibility-toggle aria-label behavior.
jest.mock('../../hooks', () => ({
  useAutoFocus: () => ({ current: null }),
  useValue: () => '',
  useFormFieldValidation: () => jest.fn(),
  useOnChange: () => jest.fn(),
}));

// Minimal stub mirroring Odyssey's PasswordField accessibility output: the input uses
// id={name}, and the show/hide toggle IconButton carries aria-controls={id} with a single
// hardcoded aria-label ("Show password") for every field — the behavior InputPassword overrides.
jest.mock('@okta/odyssey-react-mui', () => ({
  PasswordField: ({
    id,
    label,
    hasShowPassword,
  }: { id: string; label: string; hasShowPassword: boolean }) => (
    <div>
      <input id={id} aria-label={label} type="password" />
      {hasShowPassword ? (
        <button type="button" aria-controls={id} aria-label="Show password" aria-pressed="false">
          toggle
        </button>
      ) : null}
    </div>
  ),
}));

const buildUischema = (name: string, visibilityToggleLabel: string): FieldElement => ({
  type: 'Control',
  options: {
    inputMeta: { name, required: true, messages: {} },
    attributes: {},
  },
  translations: [
    { name: 'label', value: 'Password' },
    { name: 'visibilityToggleLabel', value: visibilityToggleLabel },
  ],
} as unknown as FieldElement);

const renderWithContext = (
  ui: h.JSX.Element,
  showPasswordToggleOnSignInPage = true,
) => {
  const widgetContext = {
    loading: false,
    widgetProps: { features: { showPasswordToggleOnSignInPage } },
  } as unknown as IWidgetContext;

  return render(<WidgetContextProvider value={widgetContext}>{ui}</WidgetContextProvider>);
};

describe('InputPassword visibility toggle aria-label', () => {
  it('applies the per-field label to the confirm-password toggle', () => {
    const { getByRole } = renderWithContext(
      <InputPassword uischema={buildUischema('confirmPassword', 'Show re-entered password')} />,
    );

    expect(getByRole('button', { name: 'Show re-entered password' })).toBeInTheDocument();
  });

  it('labels the new-password toggle "Show password"', () => {
    const { getByRole } = renderWithContext(
      <InputPassword uischema={buildUischema('credentials.passcode', 'Show password')} />,
    );

    expect(getByRole('button', { name: 'Show password' })).toBeInTheDocument();
  });

  it('gives two password toggles on the same page distinct accessible names (WCAG 2.4.6)', () => {
    const { getByRole } = renderWithContext(
      <div>
        <InputPassword uischema={buildUischema('credentials.passcode', 'Show password')} />
        <InputPassword uischema={buildUischema('confirmPassword', 'Show re-entered password')} />
      </div>,
    );

    // Distinct accessible names mean getByRole can resolve each toggle unambiguously.
    expect(getByRole('button', { name: 'Show password' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Show re-entered password' })).toBeInTheDocument();
  });

  it('does not render or touch a toggle when the show-password feature is disabled', () => {
    const { queryByRole } = renderWithContext(
      <InputPassword uischema={buildUischema('credentials.passcode', 'Show password')} />,
      false,
    );

    expect(queryByRole('button')).toBeNull();
  });
});
