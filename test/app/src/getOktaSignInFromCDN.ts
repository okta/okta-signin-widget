import type { OktaSignIn, RenderError, WidgetOptions } from '@okta/okta-signin-widget';
import type { OktaPluginSentry } from '../../../src/plugins/OktaPluginSentry';

declare global {
  interface Window {
    OktaSignIn: typeof OktaSignIn;
    OktaPluginSentry: OktaPluginSentry;
  }
}

function getOktaSignIn(options: WidgetOptions): OktaSignIn {
  return new window.OktaSignIn(options);
}

export async function initSentry(widget?: OktaSignIn) {
  await window.OktaPluginSentry?.initSentry?.(widget, {
    sendReportOnStart: true
  });
}

export function stopSentry() {
  window.OktaPluginSentry?.stopSentry?.();
}

export async function setWidgetForSentry(widget: OktaSignIn) {
  await window.OktaPluginSentry?.setWidgetForSentry?.(widget);
}

export function captureWidgetError(err: RenderError) {
  window.OktaPluginSentry?.captureWidgetError?.(err);
}

export default getOktaSignIn;
