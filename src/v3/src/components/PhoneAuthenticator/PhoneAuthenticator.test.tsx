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
import { UserEvent } from '@testing-library/user-event/dist/types/setup';
import { h, JSX } from 'preact';
import { FieldElement, UISchemaElementComponentProps } from 'src/types';

import PhoneAuthenticatorControl from './PhoneAuthenticator';

function setup(jsx: JSX.Element): RenderResult & { user: UserEvent } {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}

const getComponentProps = (
  options: Record<string, unknown>,
): UISchemaElementComponentProps & { uischema: FieldElement; } => ({
  uischema: {
    type: 'Control',
    label: 'Phone Number',
    name: 'phoneNumber',
    options: { inputMeta: { name: 'phoneNumber' }, ...options },
  },
});

jest.mock('../../lib/okta-i18n', () => ({
  useTranslation: () => ({
    t: jest.fn()
      .mockReturnValueOnce('Phone Number')
      .mockReturnValueOnce('Country')
      .mockReturnValueOnce('Extension'),
  }),
}));

let mockData: Record<string, unknown>;
jest.mock('../../contexts', () => ({
  useWidgetContext: jest.fn().mockImplementation(
    () => ({ data: mockData }),
  ),
}));

let mockHandleFunction = jest.fn().mockImplementation(() => ({}));
jest.mock('../../hooks', () => ({
  useOnChange: () => mockHandleFunction,
}));

describe('PhoneAuthenticator tests', () => {
  let props: UISchemaElementComponentProps & { uischema: FieldElement; };

  beforeEach(() => {
    mockHandleFunction = jest.fn();
  });

  it('should format phoneNumber correctly when field is changed for SMS methodType', async () => {
    mockData = { methodType: 'sms' };
    props = getComponentProps({ targetKey: 'methodType' });
    const { findByLabelText, user } = setup(<PhoneAuthenticatorControl {...props} />);

    await findByLabelText(/Country/);
    const phoneInput = await findByLabelText(/Phone Number/);
    const autocomplete = phoneInput?.getAttribute('autocomplete');

    expect(phoneInput.tagName).toMatch(/^input$/i);
    expect(autocomplete).toBeNull();

    await user.type(phoneInput, '2165552211');

    await waitFor(() => {
      expect(mockHandleFunction).lastCalledWith('+12165552211');
    });
  });

  it('should format phoneNumber correctly when field is changed for voice methodType', async () => {
    mockData = { methodType: 'voice' };
    props = getComponentProps({ targetKey: 'methodType' });
    const { findByLabelText, user } = setup(<PhoneAuthenticatorControl {...props} />);

    await findByLabelText(/Country/);
    const phoneInput = await findByLabelText(/Phone Number/);
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

  it('should render input control with custom attributes when provided in uischema', async () => {
    mockData = { methodType: 'sms' };
    props = getComponentProps({ attributes: { autocomplete: 'one-time-code' } });
    const { findByLabelText } = render(<PhoneAuthenticatorControl {...props} />);

    const phoneInput = await findByLabelText(/Phone Number/);

    const autocomplete = phoneInput?.getAttribute('autocomplete');

    expect(autocomplete).toBe('one-time-code');
  });
});
