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

import '@testing-library/jest-dom';

import {
  fireEvent,
  render,
} from '@testing-library/preact';
import { h } from 'preact';
import { ControlPropsAndContext } from 'src/types';

import PhoneAuthenticatorControl from './PhoneAuthenticatorControl';

const getComponentProps = (
  methodType: string,
  mockFn: jest.Mock<any, any>,
): ControlPropsAndContext => ({
  ctx: {
    core: {
      schema: {},
      uischema: {
        type: 'Control',
      },
      data: { methodType },
    },
  },
  props: {
    label: 'Phone Number',
    uischema: {
      type: 'Control',
      scope: '',
      options: {
        targetKey: 'methodType',
        showExt: true,
      },
    },
    data: {},
    errors: '',
    rootSchema: {},
    id: '',
    schema: {},
    enabled: true,
    visible: true,
    path: '',
    handleChange: mockFn,
  },
});

jest.mock('../../../lib/okta-i18n', () => ({
  useTranslation: () => ({
    t: jest.fn()
      .mockReturnValueOnce('Phone Number')
      .mockReturnValueOnce('Country')
      .mockReturnValueOnce('Extension'),
  }),
}));

describe('PhoneAuthenticator tests', () => {
  let props: ControlPropsAndContext;
  const mockHandleFunction = jest.fn();

  it('should format phoneNumber correctly when field is changed for SMS methodType', async () => {
    props = getComponentProps('sms', mockHandleFunction);
    const { findByLabelText } = render(<PhoneAuthenticatorControl {...props} />);
    const countrySelect = await findByLabelText(/Country/);
    const phoneInput = await findByLabelText(/Phone Number/);

    expect(countrySelect).toBeInTheDocument();
    expect(phoneInput.tagName).toMatch(/^input$/i);

    fireEvent.change(countrySelect, { value: 'US' });
    fireEvent.change(phoneInput, { value: '2165552211' });

    expect(mockHandleFunction).toBeCalled();
  });

  it('should format phoneNumber correctly when field is changed for voice methodType', async () => {
    props = getComponentProps('voice', mockHandleFunction);
    const { findByLabelText } = render(<PhoneAuthenticatorControl {...props} />);
    const countrySelect = await findByLabelText(/Country/);
    const phoneInput = await findByLabelText(/Phone Number/);
    const extInput = await findByLabelText(/Extension/);

    expect(countrySelect).toBeInTheDocument();
    expect(phoneInput.tagName).toMatch(/^input$/i);

    fireEvent.change(countrySelect, { value: 'US' });
    fireEvent.change(extInput, { value: '4321' });
    fireEvent.change(phoneInput, { value: '2165552211' });

    expect(mockHandleFunction).toBeCalled();
  });
});
