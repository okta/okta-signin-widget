/*
 * Copyright (c) 2025-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { render, waitFor } from '@testing-library/preact';
import { h } from 'preact';

import Logger from '../../../../util/Logger';
import CaptchaContainer from './CaptchaContainer';

jest.mock('../../../../util/Logger', () => ({
  error: jest.fn(),
}));

jest.mock('../../contexts', () => ({
  useWidgetContext: () => ({
    dataSchemaRef: {
      current: {
        submit: {
          actionParams: {},
          step: 'test-step',
          includeImmutableData: false,
        },
      },
    },
    widgetProps: {},
    recaptchaOptions: undefined,
  }),
}));

describe('CaptchaContainer dynamic altcha import', () => {
  beforeEach(() => {
    (Logger.error as jest.Mock).mockClear();
  });

  it('logs error when dynamic import of altcha fails', async () => {
    jest.doMock(
      'altcha',
      () => {
        throw new Error('dynamic import failed');
      },
      { virtual: true },
    );

    const uischema = {
      type: 'CaptchaContainer',
      options: {
        type: 'ALTCHA',
        siteKey: 'site-key',
        captchaId: 'alt_id',
      },
    } as any;

    render(h(CaptchaContainer, { uischema }));

    await waitFor(() => {
      expect(Logger.error).toHaveBeenCalledTimes(1);
      expect(Logger.error).toHaveBeenCalledWith(
        'Failed to load ALTCHA script',
        expect.any(Error),
      );
    });
  });

  it('does not import altcha when captchaType is not ALTCHA', async () => {
    jest.doMock(
      'altcha',
      () => {
        throw new Error('should not load');
      },
      { virtual: true },
    );

    const uischema = {
      type: 'CaptchaContainer',
      options: {
        type: 'RECAPTCHA_V2',
        siteKey: 'site-key',
        captchaId: 'test-id',
      },
    } as any;

    const { container } = render(h(CaptchaContainer, { uischema }));

    await waitFor(() => {
      expect(container.querySelector('altcha-widget')).toBeNull();
      expect(Logger.error).toHaveBeenCalledTimes(0);
    });
  });

  it('imports altcha when captchaType is ALTCHA', async () => {
    jest.doMock(
      'altcha',
      () => {
        if (
          typeof window !== 'undefined'
          && window.customElements
          && !window.customElements.get('altcha-widget')
        ) {
          class AltchaEl extends HTMLElement {}
          window.customElements.define('altcha-widget', AltchaEl);
        }
        return {};
      },
      { virtual: true },
    );

    const uischema = {
      type: 'CaptchaContainer',
      options: {
        type: 'ALTCHA',
        siteKey: 'site-key',
        captchaId: 'alt_id',
      },
    } as any;

    const { container } = render(h(CaptchaContainer, { uischema }));

    await waitFor(() => {
      expect(container.querySelector('altcha-widget')).not.toBeNull();
      expect(Logger.error).toHaveBeenCalledTimes(0);
    });
  });
});
