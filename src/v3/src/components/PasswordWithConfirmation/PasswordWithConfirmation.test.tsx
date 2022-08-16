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

import { FieldElement, PasswordWithConfirmationElement, UISchemaElementComponentProps } from '../../types';
import PasswordWithConfirmation from './PasswordWithConfirmation';

function setup(jsx: JSX.Element): RenderResult & { user: UserEvent } {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

const useValueHook = jest.fn().mockReturnValue('');
jest.mock('../../hooks', () => ({
  useValue: () => useValueHook(),
  useOnChange: () => jest.fn().mockImplementation(() => {}),
  useFormFieldValidation: () => jest.fn().mockImplementation(() => {}),
}));

const mockMessage = jest.fn().mockReturnValue('');
jest.mock('../../../../v2/ion/i18nTransformer', () => ({
  getMessage: () => mockMessage(),
}));

describe('PasswordWithConfirmation tests', () => {
  let props: UISchemaElementComponentProps & { uischema: PasswordWithConfirmationElement; };
  let newPasswordElement: FieldElement;
  let confirmPasswordElement: FieldElement;

  beforeEach(() => {
    newPasswordElement = {
      type: 'Field',
      translations: [{
        name: 'label',
        value: 'New password',
        i18nKey: 'fake-key',
      }],
      options: {
        inputMeta: { name: 'credentials.passcode', secret: true },
        attributes: { autocomplete: 'new-password' },
      },
    };
    confirmPasswordElement = {
      type: 'Field',
      translations: [{
        name: 'label',
        value: 'Re-enter password',
        i18nKey: 'fake-key',
      }],
      options: {
        inputMeta: { name: 'confirmPassword', secret: true },
        attributes: { autocomplete: 'new-password' },
      },
    };
    props = {
      uischema: {
        type: 'PasswordWithConfirmation',
        label: 'Re-enter password',
        options: {
          newPasswordElement,
          confirmPasswordElement,
        },
      },
    };
  });

  it('should display field level errors when new password and confirmPassword fields contain different values', async () => {
    mockMessage.mockReturnValue('New passwords must match');
    confirmPasswordElement.options.inputMeta = {
      ...confirmPasswordElement.options.inputMeta,
      // @ts-ignore messages missing from Input type
      messages: {
        value: [{ name: 'confirmPassword', i18n: { key: 'password.error.match' } }],
      },
    };
    const { findByLabelText, findByTestId } = setup(<PasswordWithConfirmation {...props} />);

    const newPasswordInput = await findByLabelText(/New password/);
    const confirmPasswordInput = await findByLabelText(/Re-enter password/);
    const newPasswordAutocomplete = newPasswordInput?.getAttribute('autocomplete');
    const confirmAutocomplete = confirmPasswordInput?.getAttribute('autocomplete');
    const confirmPasswordError = await findByTestId('confirmPassword-error');

    expect(newPasswordAutocomplete).toBe('new-password');
    expect(confirmAutocomplete).toBe('new-password');
    expect(confirmPasswordError.innerHTML).toBe('New passwords must match');
  });

  it('should display field level errors when new password and confirmPassword fields are both empty', async () => {
    mockMessage.mockReturnValue('This field cannot be left blank');
    newPasswordElement.options.inputMeta = {
      ...newPasswordElement.options.inputMeta,
      // @ts-ignore messages missing from Input type
      messages: {
        value: [{ name: 'credentials.passcode', i18n: { key: 'model.validation.field.blank' } }],
      },
    };
    confirmPasswordElement.options.inputMeta = {
      ...confirmPasswordElement.options.inputMeta,
      // @ts-ignore messages missing from Input type
      messages: {
        value: [{ name: 'confirmPassword', i18n: { key: 'model.validation.field.blank' } }],
      },
    };
    const { findByLabelText, findByTestId } = setup(<PasswordWithConfirmation {...props} />);

    const newPasswordInput = await findByLabelText(/New password/);
    const confirmPasswordInput = await findByLabelText(/Re-enter password/);
    const newPasswordAutocomplete = newPasswordInput?.getAttribute('autocomplete');
    const confirmAutocomplete = confirmPasswordInput?.getAttribute('autocomplete');

    const newPasswordError = await findByTestId('credentials.passcode-error');
    const confirmPasswordError = await findByTestId('confirmPassword-error');

    expect(newPasswordAutocomplete).toBe('new-password');
    expect(confirmAutocomplete).toBe('new-password');
    expect(newPasswordError.innerHTML).toBe('This field cannot be left blank');
    expect(confirmPasswordError.innerHTML).toBe('This field cannot be left blank');
  });
});
