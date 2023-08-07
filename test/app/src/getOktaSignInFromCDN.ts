import type { OktaSignIn, WidgetOptions } from '@okta/okta-signin-widget';
import type { SentryOptions } from '../../../src/plugins/OktaPluginSentry';

declare global {
  interface Window {
    OktaSignIn: typeof OktaSignIn;
    OktaPluginSentry: {
      initSentry: (widget?: OktaSignIn, options?: SentryOptions) => void,
      setWidgetForSentry: (widget: OktaSignIn) => void,
      stopSentry: () => void,
    };
  }
}

function getOktaSignIn(options: WidgetOptions): OktaSignIn {
  return new window.OktaSignIn(options);
}

export function initSentry(widget?: OktaSignIn) {
  setTimeout(function() {
    window.OktaPluginSentry?.initSentry?.(widget, {
      sendReportOnStart: true
    });
  }, 0);
}

export function stopSentry() {
  window.OktaPluginSentry?.stopSentry?.();
}

export function setWidgetForSentry(widget: OktaSignIn) {
  setTimeout(function() {
    window.OktaPluginSentry?.setWidgetForSentry?.(widget);
  }, 0);
}

export default getOktaSignIn;
