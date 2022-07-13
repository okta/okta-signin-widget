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

import {
  render,
  RenderResult,
} from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup';
import { h, JSX } from 'preact';
import { PasswordEnrollmentElement, UISchemaElementComponentProps } from '../../types';

import PasswordEnrollment from './PasswordEnrollment';

function setup(jsx: JSX.Element): RenderResult & { user: UserEvent } {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

const mockSubmitHook = jest.fn().mockImplementation(() => ({}));
jest.mock('../../hooks', () => ({
  useOnSubmit: () => mockSubmitHook,
  useValue: (val: string) => val,
  useOnChange: () => jest.fn().mockImplementation(() => {}),
}));

describe('PasswordEnrollment tests', () => {
  let props: UISchemaElementComponentProps & { uischema: PasswordEnrollmentElement; };

  beforeEach(() => {
    props = {
      uischema: {
        type: 'PasswordEnrollment',
        options: {
          ctaLabel: 'Change password',
          input: {
            type: 'Control',
            name: 'credentials.passcode',
            label: 'New password',
            options: {
              inputMeta: { name: 'credentials.passcode', secret: true },
              attributes: { autocomplete: 'new-password' },
            },
          },
        },
      },
    };
  });

  it('should display field level errors and not submit form when fields are empty', async () => {
    // mockUseValueHook.mockReturnValue('');
    const {
      findByLabelText, findByTestId, findByText, user,
    } = setup(<PasswordEnrollment {...props} />);

    const newPasswordInput = await findByLabelText(/New password/);
    await findByLabelText(/Re-enter password/);
    const submitBtn = await findByTestId('#/properties/submit');
    const autocomplete = newPasswordInput?.getAttribute('autocomplete');

    expect(autocomplete).toBe('new-password');

    await user.click(submitBtn);

    expect(mockSubmitHook).not.toHaveBeenCalled();

    await findByText(/This field cannot be left blank/);
  });

  it('should display field level error and not submit form when confirm password field is left empty', async () => {
    // mockUseValueHook.mockReturnValue('abc123!');
    const {
      findByLabelText, findByText, findByTestId, user,
    } = setup(<PasswordEnrollment {...props} />);

    const newPasswordInput = await findByLabelText(/New password/);
    await findByLabelText(/Re-enter password/);
    const submitBtn = await findByTestId('#/properties/submit');
    const autocomplete = newPasswordInput?.getAttribute('autocomplete');

    expect(autocomplete).toBe('new-password');

    await user.type(newPasswordInput, 'abc123!')

    await user.click(submitBtn);

    expect(mockSubmitHook).not.toHaveBeenCalled();

    await findByText(/This field cannot be left blank/);
  });

  it('should display field level errors when field values do not match', async () => {
    // mockUseValueHook.mockReturnValue('abc123!');
    const { findByLabelText, findByText, user } = setup(<PasswordEnrollment {...props} />);

    const newPasswordInput = await findByLabelText(/New password/);
    const confirmPasswordInput = await findByLabelText(/Re-enter password/);
    const autocomplete = newPasswordInput?.getAttribute('autocomplete');

    expect(autocomplete).toBe('new-password');

    await user.type(newPasswordInput, 'abc123!')
    await user.type(confirmPasswordInput, '123456');

    expect(mockSubmitHook).not.toHaveBeenCalled();

    await findByText(/New passwords must match/);
  });

  it('should display field level errors and not submit form when field values do not match', async () => {
    // mockUseValueHook.mockReturnValue('abc123!');
    const {
      findByLabelText, findByText, findByTestId, user,
    } = setup(<PasswordEnrollment {...props} />);

    const newPasswordInput = await findByLabelText(/New password/);
    const confirmPasswordInput = await findByLabelText(/Re-enter password/);
    const submitBtn = await findByTestId('#/properties/submit');
    const autocomplete = newPasswordInput?.getAttribute('autocomplete');

    expect(autocomplete).toBe('new-password');

    await user.type(newPasswordInput, 'abc123!')
    await user.type(confirmPasswordInput, '123456');

    await user.click(submitBtn);

    expect(mockSubmitHook).not.toHaveBeenCalled();

    await findByText(/New passwords must match/);
  });

  it('should submit form when field values match', async () => {
    
    // mockUseValueHook.mockReturnValue(password);
    const {
      findByLabelText, findByTestId, user,
    } = setup(<PasswordEnrollment {...props} />);

    const newPasswordInput = await findByLabelText(/New password/);
    const confirmPasswordInput = await findByLabelText(/Re-enter password/);
    const submitBtn = await findByTestId('#/properties/submit');
    const autocomplete = newPasswordInput?.getAttribute('autocomplete');

    expect(autocomplete).toBe('new-password');

    const password = 'abc123!';
    await user.type(newPasswordInput, password)
    await user.type(confirmPasswordInput, password);

    await user.click(submitBtn);

    expect(mockSubmitHook).toHaveBeenCalled();
  });
});
