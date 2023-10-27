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
  waitFor,
} from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import { h, JSX } from 'preact';
import { FieldElement, UISchemaElementComponentProps, WidgetProps } from 'src/types';

import PhoneAuthenticatorControl from './PhoneAuthenticator';

function setup(jsx: JSX.Element): RenderResult & { user: UserEvent } {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

const getComponentProps = (
  options?: Record<string, unknown>,
): UISchemaElementComponentProps & { uischema: FieldElement; } => ({
  uischema: {
    type: 'Field',
    key: 'phoneNumber',
    translations: [
      { name: 'label', i18nKey: 'label', value: 'Phone number' },
      { name: 'country', i18nKey: 'country.label', value: 'Country' },
      { name: 'extension', i18nKey: 'extension.label', value: 'Extension' },
    ],
    options: {
      inputMeta: { name: 'phoneNumber' },
      ...options,
    },
  },
});

jest.mock('../../../../v2/ion/i18nUtils', () => ({
  getMessage: jest.fn().mockImplementation(
    (message) => jest.fn().mockReturnValue(message?.message),
  ),
}));

let mockData: Record<string, unknown>;
const mockDataSchemaRef = { current: { phoneNumber: { validate: jest.fn() } } };
const mockLoading = jest.fn().mockReturnValue(false);
let widgetProps: WidgetProps = {};
jest.mock('../../contexts', () => ({
  useWidgetContext: jest.fn().mockImplementation(
    () => ({
      data: mockData,
      dataSchemaRef: mockDataSchemaRef,
      loading: mockLoading(),
      widgetProps,
    }),
  ),
}));

let mockHandleFunction = jest.fn().mockImplementation(() => ({}));
jest.mock('../../hooks', () => ({
  useOnChange: () => mockHandleFunction,
  useFormFieldValidation: () => jest.fn().mockImplementation(() => { }),
  useAutoFocus: () => jest.fn(),
}));

describe('PhoneAuthenticator tests', () => {
  let props: UISchemaElementComponentProps & { uischema: FieldElement; };

  beforeEach(() => {
    mockHandleFunction = jest.fn();
    mockLoading.mockReturnValue(false);
    widgetProps = {};
  });

  it('should format phoneNumber correctly when field is changed for SMS methodType', async () => {
    mockData = { 'authenticator.methodType': 'sms' };
    props = getComponentProps();
    const { findByLabelText, user } = setup(<PhoneAuthenticatorControl {...props} />);

    await findByLabelText(/Country/);
    const phoneInput = await findByLabelText(/Phone number/);
    const autocomplete = phoneInput?.getAttribute('autocomplete');

    expect(phoneInput.tagName).toMatch(/^input$/i);
    expect(autocomplete).toBeNull();

    await user.type(phoneInput, '2165552211');

    await waitFor(() => {
      expect(mockHandleFunction).lastCalledWith('+12165552211');
    });
  });

  it('should display disabled fields when there is a pending request for SMS methodType', async () => {
    mockData = { 'authenticator.methodType': 'sms' };
    mockLoading.mockReturnValue(true);
    props = getComponentProps();
    const { findByLabelText } = setup(<PhoneAuthenticatorControl {...props} />);

    const countrySelect = await findByLabelText(/Country/) as HTMLSelectElement;
    const phoneInput = await findByLabelText(/Phone number/) as HTMLInputElement;

    expect(phoneInput.getAttribute('disabled')).toBe('');
    expect(countrySelect.getAttribute('disabled')).toBe('');
  });

  it('should format phoneNumber correctly when field is changed for voice methodType', async () => {
    mockData = { 'authenticator.methodType': 'voice' };
    props = getComponentProps();
    const { findByLabelText, user } = setup(<PhoneAuthenticatorControl {...props} />);

    await findByLabelText(/Country/);
    const phoneInput = await findByLabelText(/Phone number/);
    const extInput = await findByLabelText(/Extension/);
    const autocomplete = phoneInput?.getAttribute('autocomplete');

    expect(phoneInput.tagName).toMatch(/^input$/i);
    expect(autocomplete).toBeNull();

    await user.type(phoneInput, '2165552211');
    await user.type(extInput, '4321');

    await waitFor(() => {
      expect(mockHandleFunction).lastCalledWith('+12165552211x4321');
    });
  });

  it('should display disabled fields when there is a pending request for voice methodType', async () => {
    mockData = { 'authenticator.methodType': 'voice' };
    mockLoading.mockReturnValue(true);
    props = getComponentProps();
    const { findByLabelText } = setup(<PhoneAuthenticatorControl {...props} />);

    const countrySelect = await findByLabelText(/Country/) as HTMLSelectElement;
    const phoneInput = await findByLabelText(/Phone number/) as HTMLInputElement;
    const extInput = await findByLabelText(/Extension/) as HTMLInputElement;

    expect(phoneInput.getAttribute('disabled')).toBe('');
    expect(countrySelect.getAttribute('disabled')).toBe('');
    expect(extInput.getAttribute('disabled')).toBe('');
  });

  it('should render input control with custom attributes when provided in uischema', async () => {
    mockData = { 'authenticator.methodType': 'sms' };
    props = getComponentProps({ attributes: { autocomplete: 'tel-national' } });
    const { findByLabelText } = render(<PhoneAuthenticatorControl {...props} />);

    const phoneInput = await findByLabelText(/Phone number/);

    const autocomplete = phoneInput?.getAttribute('autocomplete');

    expect(autocomplete).toBe('tel-national');
  });

  it('should render voice input control with custom attributes when provided in uischema', async () => {
    mockData = { 'authenticator.methodType': 'voice' };
    props = getComponentProps({ attributes: { autocomplete: 'tel-national' } });
    const { findByLabelText } = render(<PhoneAuthenticatorControl {...props} />);

    const phoneInput = await findByLabelText(/Phone number/);
    const extensionInput = await findByLabelText(/Extension/);
    const countryInput = await findByLabelText(/Country/);

    const autocomplete = phoneInput?.getAttribute('autocomplete');
    const extensionAutocomplete = extensionInput?.getAttribute('autocomplete');
    const countryAutocomplete = countryInput?.getAttribute('autocomplete');

    expect(autocomplete).toBe('tel-national');
    expect(extensionAutocomplete).toBe('tel-extension');
    expect(countryAutocomplete).toBe('tel-country-code');
  });

  it('should render input control with autocomplete set to "off" when disableAutocomplete feature is true', async () => {
    widgetProps = { features: { disableAutocomplete: true } };
    mockData = { 'authenticator.methodType': 'sms' };
    props = getComponentProps({ attributes: { autocomplete: 'off' } });
    const { findByLabelText } = render(<PhoneAuthenticatorControl {...props} />);

    const phoneInput = await findByLabelText(/Phone number/);

    const phoneAutocomplete = phoneInput?.getAttribute('autocomplete');

    expect(phoneAutocomplete).toBe('off');
  });

  it('should render voice input control with autocomplete set to "off" when disableAutocomplete feature is true', async () => {
    widgetProps = { features: { disableAutocomplete: true } };
    mockData = { 'authenticator.methodType': 'voice' };
    props = getComponentProps({ attributes: { autocomplete: 'off' } });
    const { findByLabelText } = render(<PhoneAuthenticatorControl {...props} />);

    const phoneInput = await findByLabelText(/Phone number/);
    const extensionInput = await findByLabelText(/Extension/);
    const countryInput = await findByLabelText(/Country/);

    const phoneAutocomplete = phoneInput?.getAttribute('autocomplete');
    const extensionAutocomplete = extensionInput?.getAttribute('autocomplete');
    const countryAutocomplete = countryInput?.getAttribute('autocomplete');

    expect(phoneAutocomplete).toBe('off');
    expect(extensionAutocomplete).toBe('off');
    expect(countryAutocomplete).toBe('off');
  });

  describe('Overwritten validation function tests', () => {
    beforeEach(() => {
      mockDataSchemaRef.current.phoneNumber = { validate: jest.fn() };
    });

    it('should return undefined when phone number field has been set', async () => {
      mockData = { 'authenticator.methodType': 'sms' };
      props = getComponentProps();
      const { findByLabelText, user } = setup(<PhoneAuthenticatorControl {...props} />);

      const phoneInput = await findByLabelText(/Phone number/);

      await user.type(phoneInput, '2165552211');
      await waitFor(() => {
        expect(mockHandleFunction).lastCalledWith('+12165552211');
        expect(mockDataSchemaRef.current.phoneNumber.validate({ phoneNumber: '+12165552211' })).toBeUndefined();
      });
    });

    it('should return an error message when phone number field is empty and only country code is set', async () => {
      mockData = { 'authenticator.methodType': 'sms' };
      props = getComponentProps();
      const { findByLabelText } = setup(<PhoneAuthenticatorControl {...props} />);

      const countryEle = await findByLabelText(/Country/) as HTMLSelectElement;

      expect(countryEle.value).toBe('US');
      await waitFor(() => {
        expect(mockDataSchemaRef.current.phoneNumber.validate({ phoneNumber: '+1' })).toEqual([{
          class: 'ERROR',
          message: '',
          i18n: { key: 'model.validation.field.blank' },
        }]);
      });
    });

    it('should return an error message when phone number field is empty but extension is set', async () => {
      mockData = { 'authenticator.methodType': 'voice' };
      props = getComponentProps();
      const {
        findByLabelText, findByTestId, user,
      } = setup(<PhoneAuthenticatorControl {...props} />);

      const countryEle = await findByLabelText(/Country/) as HTMLSelectElement;
      const extensionEle = await findByTestId('extension') as HTMLInputElement;

      expect(countryEle.value).toBe('US');
      await user.type(extensionEle, '3445');
      await waitFor(() => {
        expect(mockDataSchemaRef.current.phoneNumber.validate({ phoneNumber: '+1x3445' })).toEqual([{
          class: 'ERROR',
          message: '',
          i18n: { key: 'model.validation.field.blank' },
        }]);
      });
    });
  });
});
