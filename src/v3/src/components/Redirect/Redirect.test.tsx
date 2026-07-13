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

import { fireEvent, render } from '@testing-library/preact';
import { h } from 'preact';

import { RedirectElement } from '../../types';
import Redirect from './Redirect';

const mockChangeLocation = jest.fn();
const mockExecuteOnVisiblePage = jest.fn((cb: () => void) => cb());
jest.mock('../../../../util/Util', () => ({
  changeLocation: (url: string) => mockChangeLocation(url),
  executeOnVisiblePage: (cb: () => void) => mockExecuteOnVisiblePage(cb),
}));

// Stub the Button component so we don't need to wire up WidgetContext / theme just to
// test that Redirect renders a Continue button and its click reaches Util.changeLocation.
jest.mock('../Button', () => ({
  __esModule: true,
  default: ({ uischema }: { uischema: { label: string; options: { onClick: () => void } } }) => (
    <button
      type="button"
      data-se="applink-continue"
      onClick={uischema.options.onClick}
    >
      {uischema.label}
    </button>
  ),
}));

describe('Redirect component', () => {
  const REDIRECT_URL = 'https://example.okta.com/redirect';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('auto-redirects and renders nothing when priorVerification is absent', () => {
    const uischema: RedirectElement = {
      type: 'Redirect',
      options: { url: REDIRECT_URL },
    };
    const { container } = render(<Redirect uischema={uischema} />);

    expect(container.firstChild).toBeNull();
    expect(mockExecuteOnVisiblePage).toHaveBeenCalledTimes(1);
    expect(mockChangeLocation).toHaveBeenCalledTimes(1);
    expect(mockChangeLocation).toHaveBeenCalledWith(REDIRECT_URL);
  });

  it('renders Continue button and does NOT auto-redirect when APP_LINK verification succeeded', () => {
    const uischema: RedirectElement = {
      type: 'Redirect',
      options: {
        url: REDIRECT_URL,
        priorVerification: { method: 'APP_LINK', success: true },
      },
    };
    const { queryByTestId } = render(<Redirect uischema={uischema} />);

    const button = queryByTestId('applink-continue');
    expect(button).not.toBeNull();
    // loc() returns the raw i18n key in tests; the key resolves to "Continue" at runtime.
    expect(button?.textContent).toBe('oie.optional.authenticator.button.title');
    expect(mockChangeLocation).not.toHaveBeenCalled();
  });

  it('clicking the Continue button calls Util.changeLocation with the redirect url', () => {
    const uischema: RedirectElement = {
      type: 'Redirect',
      options: {
        url: REDIRECT_URL,
        priorVerification: { method: 'APP_LINK', success: true },
      },
    };
    const { getByTestId } = render(<Redirect uischema={uischema} />);

    fireEvent.click(getByTestId('applink-continue'));

    expect(mockChangeLocation).toHaveBeenCalledTimes(1);
    expect(mockChangeLocation).toHaveBeenCalledWith(REDIRECT_URL);
  });

  it('auto-redirects when method is APP_LINK but success is false', () => {
    const uischema: RedirectElement = {
      type: 'Redirect',
      options: {
        url: REDIRECT_URL,
        priorVerification: { method: 'APP_LINK', success: false },
      },
    };
    const { container } = render(<Redirect uischema={uischema} />);

    expect(container.firstChild).toBeNull();
    expect(mockChangeLocation).toHaveBeenCalledWith(REDIRECT_URL);
  });

  it('auto-redirects when method is not APP_LINK', () => {
    const uischema: RedirectElement = {
      type: 'Redirect',
      options: {
        url: REDIRECT_URL,
        priorVerification: { method: 'LOOPBACK', success: true },
      },
    };
    const { container } = render(<Redirect uischema={uischema} />);

    expect(container.firstChild).toBeNull();
    expect(mockChangeLocation).toHaveBeenCalledWith(REDIRECT_URL);
  });

  it('renders nothing when url is missing even with priorVerification present', () => {
    const uischema: RedirectElement = {
      type: 'Redirect',
      // @ts-expect-error deliberately missing url to exercise the !options.url guard.
      options: {
        priorVerification: { method: 'APP_LINK', success: true },
      },
    };
    const { container } = render(<Redirect uischema={uischema} />);

    expect(container.firstChild).toBeNull();
    expect(mockChangeLocation).not.toHaveBeenCalled();
  });
});
