import { h } from 'preact';
import { render, fireEvent, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { PasswordField } from '@okta/odyssey-react-mui';
import { useWidgetContext } from '../../contexts';
import { useValue, useFormFieldValidation, useOnChange } from '../../hooks';
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
  }
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
    },
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
        } 
      },
    });
    (useValue as jest.Mock).mockReturnValue('');
    (useFormFieldValidation as jest.Mock).mockReturnValue(mockOnValidateHandler)
  });

  it('should call handleBlur when onBlur event is triggered', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByTestId } = render(
      <div>
        <InputPassword {...defaultProps} />
        <div data-se="outside-element">Outside Element</div>
      </div>
    );
    const input = getByLabelText('MockPasswordField');
    const outsideElement = getByTestId('outside-element');

    // click outside element to trigger input blur event
    await user.click(outsideElement);

    // Verify the onBlur event is fired
    expect(mockOnValidateHandler).toHaveBeenCalled();
  });

  it('should not call handleBlur when onBlur event is triggered by a button', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByTestId } = render(
      <div>
        <InputPassword {...defaultProps} />
        <button data-se="forgot-pass">Forgot password</button>
      </div>
    );
    const input = getByLabelText('MockPasswordField');
    const button = getByTestId('forgot-pass');

    // click outside element to trigger input blur event
    await user.click(button);

    expect(mockOnValidateHandler).not.toHaveBeenCalled();
  });
});
