import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { useFormFieldValidation, useOnChange } from '../../hooks';
import { FieldElement, UISchemaElementComponent } from '../../types';
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
  }) => (
    <input
      data-se="test-input"
      name="testField"
      onBlur={(e) => {
        handleBlur?.(e.currentTarget.value, e)
      }}
      onChange={(e) => handleChange?.(e.currentTarget.value)}
    />
  );

  const WrappedComponent = withFormValidationState(TestComponent);

  it('should call handleBlur when onBlur event is triggered', async () => {
    const user = userEvent.setup();
    const { getByTestId } = render(
      <div>
        <WrappedComponent {...defaultProps} />
        <div data-se="outside-element">Outside Element</div>
      </div>
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
      </div>
    );

    const input = getByTestId('test-input');
    const button = getByTestId('outside-element');
    
    await user.click(input);
    await user.type(input, 'test value');
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
      </div>
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
});
