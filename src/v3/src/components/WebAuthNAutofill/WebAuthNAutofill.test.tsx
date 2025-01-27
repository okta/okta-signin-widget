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

import { cleanup, render } from '@testing-library/preact';

import {
  ABORT_REASON_CLEANUP,
  ABORT_REASON_WEBAUTHN_AUTOFILLUI_STEP_NOT_FOUND,
} from '../../constants';
import { useWidgetContext } from '../../contexts';
import { useOnSubmit } from '../../hooks';
import { WebAuthNAutofillElement } from '../../types';
import WebAuthNAutofill from './WebAuthNAutofill';

jest.mock('../../hooks');
jest.mock('../../contexts');

jest.mock('../../util', () => ({
  isPasskeyAutofillAvailable: jest.fn().mockResolvedValue(true),
  loc: jest.fn().mockReturnValue('translatedMessage'),
}));

describe('WebAuthNAutofill', () => {
  const uischema: WebAuthNAutofillElement = {
    type: 'WebAuthNAutofill',
    options: {
      step: 'challenge-webauthn-autofillui-authenticator',
      getCredentials: jest.fn().mockReturnValue({}),
    },
  };

  const mockWidgetContext = {
    setAbortController: jest.fn(),
    setMessage: jest.fn(),
  };

  beforeEach(() => {
    (useWidgetContext as jest.Mock).mockReturnValue(mockWidgetContext);
    (useOnSubmit as jest.Mock).mockReturnValue(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it('should render the empty WebAuthNAutofill component', () => {
    const { container } = render(<WebAuthNAutofill uischema={uischema} />);
    expect(container).toMatchInlineSnapshot('<div />');
  });

  it('should call the setMessage method when getCredentials throws', async () => {
    const setMessageSpy = jest.spyOn(mockWidgetContext, 'setMessage');
    const uischemaWithError: WebAuthNAutofillElement = {
      ...uischema,
      options: {
        ...uischema.options,
        getCredentials: jest.fn().mockRejectedValue('TEST'),
      },
    };
    render(<WebAuthNAutofill uischema={uischemaWithError} />);
    await new Promise(process.nextTick);

    expect(setMessageSpy).toHaveBeenCalledWith({
      class: 'ERROR',
      i18n: { key: 'oie.webauthn.error.invalidPasskey' },
      message: 'translatedMessage',
    });
  });

  it.each([ABORT_REASON_CLEANUP, ABORT_REASON_WEBAUTHN_AUTOFILLUI_STEP_NOT_FOUND, {}])('should not call the setMessage method for ignored error "%s"', async (err) => {
    const setMessageSpy = jest.spyOn(mockWidgetContext, 'setMessage');
    const uischemaWithError: WebAuthNAutofillElement = {
      ...uischema,
      options: {
        ...uischema.options,
        getCredentials: jest.fn().mockRejectedValue(err),
      },
    };
    render(<WebAuthNAutofill uischema={uischemaWithError} />);
    await new Promise(process.nextTick);

    expect(setMessageSpy).not.toHaveBeenCalled();
  });
});
