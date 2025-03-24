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

import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';

import { useFormFieldValidation, useOnChange } from '../../hooks';
import { FieldElement, UISchemaElementComponent, UISchemaElementComponentWithValidationProps } from '../../types';
import { withFormValidationState } from './withFormValidationState';

// Mock the hooks
jest.mock('../../hooks', () => ({
  useFormFieldValidation: jest.fn(),
  useOnChange: jest.fn(),
}));

describe('withFormValidationState', () => {
  const mockOnValidateHandler = jest.fn();
  const mockOnChangeHandler = jest.fn();

  const defaultProps = {
    uischema: {
      options: {
        inputMeta: { name: 'testField', required: true },
      },
    } as FieldElement,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useFormFieldValidation as jest.Mock).mockReturnValue(mockOnValidateHandler);
    (useOnChange as jest.Mock).mockReturnValue(mockOnChangeHandler);
  });

  const TestComponent: UISchemaElementComponent<{ uischema: FieldElement }> = ({
    handleBlur,
    handleChange,
    errors,
  }: UISchemaElementComponentWithValidationProps) => {
    const message = errors?.[0].message;
    return (
      <>
        <input
          data-se="test-input"
          name="testField"
          onBlur={(e) => {
            handleBlur?.(e.currentTarget.value, e);
          }}
          onChange={(e) => handleChange?.(e.currentTarget.value)}
        />
        {message && <span>{message}</span>}
      </>
    );
  }

  const WrappedComponent = withFormValidationState(TestComponent);

  it('should call handleBlur when onBlur event is triggered', async () => {
    const user = userEvent.setup();
    const { getByTestId } = render(
      <div>
        <WrappedComponent {...defaultProps} />
        <div data-se="outside-element">Outside Element</div>
      </div>,
    );
    const input = getByTestId('test-input');
    const button = getByTestId('outside-element');

    await user.click(input);
    await user.type(input, 'test value');
    expect(input).toHaveFocus();

    await user.click(button);
    expect(input).not.toHaveFocus();

    expect(mockOnValidateHandler).toHaveBeenCalledWith(expect.any(Function), 'test value');
  });

  it('should not call handleBlur when onBlur event is triggered by a link button', async () => {
    const user = userEvent.setup();
    const { getByTestId } = render(
      <div>
        <WrappedComponent {...defaultProps} />
        <button data-se="outside-element" type="button" role="link">Link Button</button>
      </div>,
    );

    const input = getByTestId('test-input');
    const button = getByTestId('outside-element');

    await user.click(input);
    expect(input).toHaveFocus();

    await user.click(button);
    expect(input).not.toHaveFocus();

    expect(mockOnValidateHandler).not.toHaveBeenCalled();
  });

  it('should call handleBlur when onBlur event is triggered by a non-link non-submit button', async () => {
    const user = userEvent.setup();
    const { getByTestId } = render(
      <div>
        <WrappedComponent {...defaultProps} />
        <button data-se="outside-element" type="button">Link Button</button>
      </div>,
    );

    const input = getByTestId('test-input');
    const button = getByTestId('outside-element');

    await user.click(input);
    await user.type(input, 'test value');
    expect(input).toHaveFocus();

    await user.click(button);
    expect(input).not.toHaveFocus();

    expect(mockOnValidateHandler).toHaveBeenCalledWith(expect.any(Function), 'test value');
  });

  it('should call onValidateHandler when handleChange is triggered', async () => {
    const user = userEvent.setup();
    const { getByTestId } = render(<WrappedComponent {...defaultProps} />);
    const input = getByTestId('test-input');

    await user.type(input, 'test value');
    expect(mockOnChangeHandler).toHaveBeenCalledWith('test value');
    expect(mockOnValidateHandler).toHaveBeenCalledWith(expect.any(Function), 'test value');
  });

  it('should render server-side error message and persist after user interaction', async () => {
    const user = userEvent.setup();
    const { getByTestId, getByText } = render(
      <div>
        <WrappedComponent
          {...defaultProps}
          uischema={{
            ...defaultProps.uischema,
            options: {
              inputMeta: {
                // @ts-expect-error OKTA-539834 - messages missing from type
                messages: {
                  value: [
                    {
                      "message": "A user with this Email already exists",
                      "class": "ERROR"
                    }
                  ]
                }
              }
            }
          }}
        />
        <button data-se="outside-element" type="button">Link Button</button>
      </div>
    );

    // Verify if message is rendered
    expect(getByText('A user with this Email already exists')).toBeInTheDocument();

    const input = getByTestId('test-input');
    await user.click(input);
    expect(input).toHaveFocus();

    const button = getByTestId('outside-element');
    await user.click(button);
    expect(input).not.toHaveFocus();

    // Validate message still there
    expect(getByText('A user with this Email already exists')).toBeInTheDocument();
  });
});
