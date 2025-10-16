import { waitFor, render } from '@testing-library/preact';
import { h } from 'preact';
import Logger from '../../../../util/Logger';

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

import CaptchaContainer from './CaptchaContainer';

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
          typeof window !== 'undefined' &&
          window.customElements &&
          !window.customElements.get('altcha-widget')
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
