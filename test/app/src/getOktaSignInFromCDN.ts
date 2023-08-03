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

  console.log('??? init sentry', widget, widget.options.baseUrl, window.OktaPluginSentry?.initSentry)

  window.OktaPluginSentry?.initSentry?.(widget);

  setTimeout(function() {
    throw new Error('gggg');
  }, 3000);


}

export function stopSentry() {
  console.log('??? stop sentry')
  window.OktaPluginSentry?.stopSentry?.();
}

export default getOktaSignIn;
