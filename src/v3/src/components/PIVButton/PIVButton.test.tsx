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

import { IdxTransaction } from '@okta/okta-auth-js';
import { render, waitFor } from '@testing-library/preact';
import { h } from 'preact';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';

import {
  PIVButtonElement,
  UISchemaElementComponentProps,
} from '../../types';
import PIVButton from './PIVButton';

const mockRedirectFn = jest.fn();
jest.mock('../../../../util/Util', () => ({ redirectWithFormGet: jest.fn().mockImplementation(() => mockRedirectFn()) }));

const setMessageMockFn = jest.fn();
const mockLoading = jest.fn().mockReturnValue(false);
const mockTransaction: IdxTransaction = getStubTransactionWithNextStep();
mockTransaction.nextStep!.href = 'https://localhost:8080/mtls';
jest.mock('../../contexts', () => ({
  useWidgetContext: () => ({
    setMessage: setMessageMockFn,
    loading: mockLoading(),
    idxTransaction: mockTransaction,
  }),
}));

describe('PIVButton Tests', () => {
  let props: UISchemaElementComponentProps & { uischema: PIVButtonElement; };

  beforeEach(() => {
    mockLoading.mockReturnValue(false);
    mockTransaction.messages = undefined;
    props = {
      uischema: {
        type: 'PIVButton',
        translations: [{ name: 'label', value: 'Verify', i18nKey: 'some.key' }],
      },
    };
  });

  it('should render PIV retry button w/o spinner when an error message exists in transaction', async () => {
    mockTransaction.messages = [{ message: 'Unable to sign in', class: 'ERROR', i18n: { key: 'some.key' } }];
    const { queryByTestId } = render(<PIVButton {...props} />);

    const button = queryByTestId('button');
    const spinner = queryByTestId('okta-spinner');

    expect(button).toBeInTheDocument();
    expect(spinner).toBeNull();

    await waitFor(() => {
      expect(setMessageMockFn).not.toBeCalled();
      expect(mockRedirectFn).not.toBeCalled();
    });
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
