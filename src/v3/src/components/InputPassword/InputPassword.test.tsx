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

import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { FieldElement, UISchemaElement } from 'src/types';

import { useWidgetContext } from '../../contexts';
import { useFormFieldValidation, useValue } from '../../hooks';
import InputPassword from './InputPassword';

// Mock the useWidgetContext hook
jest.mock('../../contexts', () => ({
  useWidgetContext: jest.fn(),
}));

// Mock the hooks except useAutoFocus
jest.mock('../../hooks', () => {
  const actualHooks = jest.requireActual('../../hooks');
  return {
    ...actualHooks,
    useValue: jest.fn(),
    useFormFieldValidation: jest.fn(),
  };
});

describe('InputPassword', () => {
  const mockOnValidateHandler = jest.fn();

  const defaultProps = {
    uischema: {
      translations: [{ name: 'label', value: 'MockPasswordField' }],
      focus: true,
      parserOptions: {},
      noTranslate: false,
      options: {
        attributes: {},
        inputMeta: { name: 'password', required: true },
      },
    } as unknown as UISchemaElement & FieldElement,
    errors: [],
    describedByIds: 'test-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useWidgetContext as jest.Mock).mockReturnValue({
      loading: false,
      widgetProps: {
        features: {
          showPasswordToggleOnSignInPage: true,
          autoFocus: true,
        },
      },
    });
    (useValue as jest.Mock).mockReturnValue('');
    (useFormFieldValidation as jest.Mock).mockReturnValue(mockOnValidateHandler);
  });

  it('should call handleBlur when onBlur event is triggered', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByTestId } = render(
      <div>
        <InputPassword {...defaultProps} />
        <div data-se="outside-element">Outside Element</div>
      </div>,
    );
    const input = getByLabelText('MockPasswordField');
    const outsideElement = getByTestId('outside-element');

    expect(input).toHaveFocus();

    // click outside element to trigger input blur event
    await user.click(outsideElement);

    // Verify the onBlur event is fired
    expect(mockOnValidateHandler).toHaveBeenCalled();
  });

  it('should not call handleBlur when onBlur event is triggered by a link button', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByTestId } = render(
      <div>
        <InputPassword {...defaultProps} />
        <button data-se="forgot-pass" type="button" role="link">Forgot password</button>
      </div>,
    );
    const input = getByLabelText('MockPasswordField');
    const button = getByTestId('forgot-pass');

    expect(input).toHaveFocus();

    // click outside element to trigger input blur event
    await user.click(button);

    expect(mockOnValidateHandler).not.toHaveBeenCalled();
  });

  it('should call handleBlur when onBlur event is triggered by a non-link button', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByTestId } = render(
      <div>
        <InputPassword {...defaultProps} />
        <button data-se="show-pass" type="button">Show password</button>
      </div>,
    );
    const input = getByLabelText('MockPasswordField');
    const button = getByTestId('show-pass');

    expect(input).toHaveFocus();

    // click outside element to trigger input blur event
    await user.click(button);

    expect(mockOnValidateHandler).toHaveBeenCalled();
  });
});
