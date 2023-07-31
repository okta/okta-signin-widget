import type { OktaSignIn, WidgetOptions } from '@okta/okta-signin-widget';

declare global {
  interface Window {
    OktaSignIn: typeof OktaSignIn;
    OktaPluginSentry: {
      initSentry: (widget: OktaSignIn) => void,
      stopSentry: () => void,
    };
  }
}

function getOktaSignIn(options: WidgetOptions): OktaSignIn {
  return new window.OktaSignIn(options);
}

export function initSentry(widget: OktaSignIn) {
  window.OktaPluginSentry?.initSentry?.(widget);
}

export function stopSentry() {
  window.OktaPluginSentry?.stopSentry?.();
}

export default getOktaSignIn;
