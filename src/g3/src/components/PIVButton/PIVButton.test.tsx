/*
 * Copyright (c) 2022-present, Okta, Inc. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant
 * to the Apache License, Version 2.0 (the "License.")
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { render, waitFor } from '@testing-library/preact';
import { h } from 'preact';

import {
  PIVButtonElement,
  UISchemaElementComponentProps,
} from '../../types';
import PIVButton from './PIVButton';

const mockRedirectFn = jest.fn();
jest.mock('../../../../util/Util', () => ({ redirectWithFormGet: jest.fn().mockImplementation(() => mockRedirectFn()) }));

const setMessageMockFn = jest.fn();
const mockLoading = jest.fn().mockReturnValue(false);
jest.mock('../../contexts', () => ({
  useWidgetContext: () => ({
    setMessage: setMessageMockFn,
    loading: mockLoading(),
    idxTransaction: { nextStep: { href: 'https://localhost:8080/mtls' } },
  }),
}));

describe('PIVButton Tests', () => {
  let props: UISchemaElementComponentProps & { uischema: PIVButtonElement; };

  beforeEach(() => {
    mockLoading.mockReturnValue(false);
    props = {
      uischema: {
        type: 'PIVButton',
        translations: [{ name: 'label', value: 'Verify', i18nKey: 'some.key' }],
      },
    };
  });

  it('should render PIV button and trigger redirect with spinner visible', async () => {
    const { queryByTestId } = render(<PIVButton {...props} />);

    const button = queryByTestId('button');
    const spinner = queryByTestId('okta-spinner');

    expect(button).toBeNull();
    expect(spinner).toBeInTheDocument();

    await waitFor(() => {
      expect(setMessageMockFn).toBeCalled();
      expect(mockRedirectFn).toBeCalled();
    });
  });
});
