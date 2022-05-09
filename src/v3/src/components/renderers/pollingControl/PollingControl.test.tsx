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

import { CellProps } from '@jsonforms/core';
import { render } from '@testing-library/preact';
import { h } from 'preact';
import { act } from 'preact/test-utils';

import PollingControl from './PollingControl';

jest.useFakeTimers();

describe('PollingControl Tests', () => {
  const REFRESH_TIME = 4000;
  const mockProceed = jest.fn();
  let props: CellProps;

  beforeEach(() => {
    props = {
      uischema: {
        type: 'Control',
        scope: '',
        options: {
          refresh: REFRESH_TIME,
          idxMethod: 'proceed',
          skipValidation: true,
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
      handleChange: () => {},
      config: {
        proceed: mockProceed,
        isPendingRequest: false,
      },
      isValid: false,
    };
  });

  it('should not poll proceed when element is not visible', async () => {
    props.visible = false;
    const { container } = render(<PollingControl {...props} />);

    expect(container.firstChild).toBeNull();

    act(() => {
      jest.advanceTimersByTime(REFRESH_TIME);
    });

    expect(mockProceed).not.toHaveBeenCalled();
  });

  it('should not poll proceed when there is a pending request in the Widget', async () => {
    props.config.isPendingRequest = true;
    const { container } = render(<PollingControl {...props} />);

    expect(container.firstChild).toBeNull();

    act(() => {
      jest.advanceTimersByTime(REFRESH_TIME);
    });

    expect(mockProceed).not.toHaveBeenCalled();
  });

  it('should poll the proceed function 5 times in 22 seconds based on the provided refresh time', async () => {
    const { container } = render(<PollingControl {...props} />);

    expect(container.firstChild).toBeNull();

    act(() => {
      jest.advanceTimersByTime(REFRESH_TIME * 5);
    });

    expect(mockProceed).toHaveBeenCalledTimes(5);
    expect(mockProceed).toHaveBeenCalledWith({
      idxMethod: 'proceed',
      params: { refresh: REFRESH_TIME },
      skipValidation: true,
    });
  });
});
