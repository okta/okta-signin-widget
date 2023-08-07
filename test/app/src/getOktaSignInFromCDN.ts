import type { OktaSignIn, WidgetOptions } from '@okta/okta-signin-widget';
import type { SentryOptions } from '../../../src/plugins/OktaPluginSentry';

declare global {
  interface Window {
    OktaSignIn: typeof OktaSignIn;
    OktaPluginSentry: {
      initSentry: (widget: OktaSignIn, options?: SentryOptions) => void,
      stopSentry: () => void,
    };
  }
}

function getOktaSignIn(options: WidgetOptions): OktaSignIn {
  return new window.OktaSignIn(options);
}

export function initSentry(widget: OktaSignIn) {
  setTimeout(function() {
    window.OktaPluginSentry?.initSentry?.(widget, {
      sendReportOnStart: true
    });
  }, 0);
}

export function stopSentry() {
  console.log('??? stop sentry')
  window.OktaPluginSentry?.stopSentry?.();
}

export default getOktaSignIn;
