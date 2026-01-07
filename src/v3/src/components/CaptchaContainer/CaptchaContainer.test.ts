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

const mockOnSubmit = jest.fn();
jest.mock('../../hooks', () => ({
  useOnSubmit: () => mockOnSubmit,
}));

/**
 * Mock custom element for altcha-widget that properly captures the `customfetch` property.
 *
 * When Preact renders `<altcha-widget customfetch={fn} />`, it sets the property directly
 * on the DOM element (e.g., `element.customfetch = fn`). A plain HTMLElement doesn't have
 * this property defined, so we need a custom class with an explicit getter/setter to:
 * 1. Allow Preact to set the function via the setter
 * 2. Allow tests to retrieve and invoke it via the getter
 */
class MockAltchaWidget extends HTMLElement {
  private mockCustomFetch?: typeof window.fetch;

  get customfetch() {
    return this.mockCustomFetch;
  }

  set customfetch(value: typeof window.fetch | undefined) {
    this.mockCustomFetch = value;
  }
}

const mockLoadAltchaWidget = () => {
  jest.mock(
    'altcha',
    () => {
      window.customElements.define('altcha-widget', MockAltchaWidget);
      return {};
    },
  );
};

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
    widgetProps: {
      baseUrl: 'https://base.okta.com',
    },
    recaptchaOptions: undefined,
  }),
}));

const altchaUischema = {
  type: 'CaptchaContainer',
  options: {
    type: 'ALTCHA',
    siteKey: 'test-site-key',
    captchaId: 'altcha-captcha-id',
    stateHandle: 'test-state-handle',
  },
} as any;

const altchaUischemaWithChallengeUrl = {
  type: 'CaptchaContainer',
  options: {
    ...altchaUischema.options,
    challengeUrlForm: {
      href: 'https://custom.okta.com/custom/altcha/challenge',
      method: 'POST',
      accepts: 'application/json',
      value: [{ name: 'stateHandle' }],
    },
  },
} as any;

const recaptchaUischema = {
  type: 'CaptchaContainer',
  options: {
    type: 'RECAPTCHA_V2',
    siteKey: 'site-key',
    captchaId: 'test-id',
    stateHandle: 'test-state-handle',
  },
} as any;

describe('CaptchaContainer dynamic altcha import', () => {
  beforeEach(() => {
    (Logger.error as jest.Mock).mockClear();
    mockOnSubmit.mockClear();
  });

  it('logs error when dynamic import of altcha fails', async () => {
    jest.doMock(
      'altcha',
      () => {
        throw new Error('dynamic import failed');
      },
      { virtual: true },
    );

    render(h(CaptchaContainer, { uischema: altchaUischema }));

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

    const { container } = render(h(CaptchaContainer, { uischema: recaptchaUischema }));

    await waitFor(() => {
      expect(container.querySelector('altcha-widget')).toBeNull();
      expect(Logger.error).toHaveBeenCalledTimes(0);
    });
  });

  it('imports altcha when captchaType is ALTCHA', async () => {
    mockLoadAltchaWidget();

    const { container } = render(h(CaptchaContainer, { uischema: altchaUischema }));

    await waitFor(() => {
      expect(container.querySelector('altcha-widget')).not.toBeNull();
      expect(Logger.error).toHaveBeenCalledTimes(0);
    });
  });

  it('renders ALTCHA widget with correct attributes using default challenge path', async () => {
    mockLoadAltchaWidget();

    const { container } = render(h(CaptchaContainer, { uischema: altchaUischema }));

    await waitFor(() => {
      const altchaWidget = container.querySelector('altcha-widget');
      expect(altchaWidget).not.toBeNull();
      expect(altchaWidget?.getAttribute('floating')).toBe('true');
      expect(altchaWidget?.getAttribute('hidefooter')).toBe('true');
      expect(altchaWidget?.getAttribute('hidelogo')).toBe('true');
      expect(altchaWidget?.getAttribute('challengeurl')).toBe('https://base.okta.com/api/v1/altcha');
    });
  });

  it('renders ALTCHA widget with custom challengeUrlForm.href when provided', async () => {
    mockLoadAltchaWidget();

    const { container } = render(h(CaptchaContainer, { uischema: altchaUischemaWithChallengeUrl }));

    await waitFor(() => {
      const altchaWidget = container.querySelector('altcha-widget');
      expect(altchaWidget).not.toBeNull();
      expect(altchaWidget?.getAttribute('challengeurl')).toBe('https://custom.okta.com/custom/altcha/challenge');
    });
  });

  it('renders ALTCHA widget with localized strings', async () => {
    mockLoadAltchaWidget();

    const { container } = render(h(CaptchaContainer, { uischema: altchaUischema }));

    await waitFor(() => {
      const altchaWidget = container.querySelector('altcha-widget');
      expect(altchaWidget).not.toBeNull();
      const stringsAttr = altchaWidget?.getAttribute('strings');
      expect(stringsAttr).not.toBeNull();
      const strings = JSON.parse(stringsAttr!);
      expect(strings).toHaveProperty('error');
      expect(strings).toHaveProperty('expired');
      expect(strings).toHaveProperty('label');
      expect(strings).toHaveProperty('loading');
      expect(strings).toHaveProperty('reload');
      expect(strings).toHaveProperty('verify');
      expect(strings).toHaveProperty('verificationRequired');
      expect(strings).toHaveProperty('verified');
      expect(strings).toHaveProperty('verifying');
      expect(strings).toHaveProperty('waitAlert');
    });
  });

  it('calls onSubmit with correct params when ALTCHA is verified', async () => {
    mockLoadAltchaWidget();

    const { container } = render(h(CaptchaContainer, { uischema: altchaUischema }));

    await waitFor(() => {
      const altchaWidget = container.querySelector('altcha-widget');
      expect(altchaWidget).not.toBeNull();
    });

    const altchaWidget = container.querySelector('altcha-widget');
    const verifyEvent = new CustomEvent('verified', {
      detail: { payload: 'test-altcha-token' },
    });
    altchaWidget?.dispatchEvent(verifyEvent);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      includeData: true,
      includeImmutableData: false,
      params: {
        captchaVerify: {
          captchaToken: 'test-altcha-token',
          captchaId: 'altcha',
        },
      },
      step: 'test-step',
    });
  });

  it('does not render ALTCHA widget before script is loaded', () => {
    // Delay the import to simulate loading state
    jest.mock(
      'altcha',
      () => new Promise(() => {}),
    );

    const { container } = render(h(CaptchaContainer, { uischema: altchaUischema }));

    // Initially, the widget should not be rendered
    expect(container.querySelector('altcha-widget')).toBeNull();
  });

  it('ALTCHA customfetch calls window.fetch directly when challengeUrlForm is not provided', async () => {
    mockLoadAltchaWidget();

    const { container } = render(h(CaptchaContainer, { uischema: altchaUischema }));

    await waitFor(() => {
      const altchaWidget = container.querySelector('altcha-widget');
      expect(altchaWidget).not.toBeNull();
    });

    const altchaWidget = container.querySelector('altcha-widget') as MockAltchaWidget;
    const mockFetch = jest.spyOn(window, 'fetch').mockResolvedValue(new Response('{}'));

    const testUrl = '/api/v1/altcha';
    const testInit = { method: 'GET' };
    await altchaWidget.customfetch!(testUrl, testInit);

    expect(mockFetch).toHaveBeenCalledWith(testUrl, testInit);
    mockFetch.mockRestore();
  });

  it('ALTCHA customfetch sets Content-Type header from challengeUrlForm.accepts', async () => {
    mockLoadAltchaWidget();

    const { container } = render(h(CaptchaContainer, { uischema: altchaUischemaWithChallengeUrl }));

    await waitFor(() => {
      const altchaWidget = container.querySelector('altcha-widget');
      expect(altchaWidget).not.toBeNull();
    });

    const altchaWidget = container.querySelector('altcha-widget') as MockAltchaWidget;
    const mockFetch = jest.spyOn(window, 'fetch').mockResolvedValue(new Response('{}'));

    const testUrl = 'https://custom.okta.com/custom/altcha/challenge';
    await altchaWidget.customfetch!(testUrl, {});

    expect(mockFetch).toHaveBeenCalledWith(testUrl, expect.objectContaining({
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
      }),
    }));
    mockFetch.mockRestore();
  });

  it('ALTCHA customfetch sets HTTP method from challengeUrlForm.method', async () => {
    mockLoadAltchaWidget();

    const { container } = render(h(CaptchaContainer, { uischema: altchaUischemaWithChallengeUrl }));

    await waitFor(() => {
      const altchaWidget = container.querySelector('altcha-widget');
      expect(altchaWidget).not.toBeNull();
    });

    const altchaWidget = container.querySelector('altcha-widget') as MockAltchaWidget;
    const mockFetch = jest.spyOn(window, 'fetch').mockResolvedValue(new Response('{}'));

    const testUrl = 'https://custom.okta.com/custom/altcha/challenge';
    await altchaWidget.customfetch!(testUrl, {});

    expect(mockFetch).toHaveBeenCalledWith(testUrl, expect.objectContaining({
      method: 'POST',
    }));
    mockFetch.mockRestore();
  });

  it('ALTCHA customfetch includes stateHandle in body when value contains stateHandle field', async () => {
    mockLoadAltchaWidget();

    const { container } = render(h(CaptchaContainer, { uischema: altchaUischemaWithChallengeUrl }));

    await waitFor(() => {
      const altchaWidget = container.querySelector('altcha-widget');
      expect(altchaWidget).not.toBeNull();
    });

    const altchaWidget = container.querySelector('altcha-widget') as MockAltchaWidget;
    const mockFetch = jest.spyOn(window, 'fetch').mockResolvedValue(new Response('{}'));

    const testUrl = 'https://custom.okta.com/custom/altcha/challenge';
    await altchaWidget.customfetch!(testUrl, {});

    expect(mockFetch).toHaveBeenCalledWith(testUrl, expect.objectContaining({
      body: JSON.stringify({ stateHandle: 'test-state-handle' }),
    }));
    mockFetch.mockRestore();
  });
});
