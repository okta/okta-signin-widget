import { OktaSignIn, WidgetOptions } from '@okta/okta-signin-widget';
import * as OktaPluginSentry from '@okta/okta-signin-widget/sentry';
import '@okta/okta-signin-widget/css/okta-sign-in.min.css';

const getOktaSignIn = (options: WidgetOptions): OktaSignIn => {
  return new OktaSignIn(options);
};

export async function initSentry(widget?: OktaSignIn) {
  await OktaPluginSentry.initSentry?.(widget, {
    sendReportOnStart: true
  });
}

export function stopSentry() {
  OktaPluginSentry.stopSentry?.();
}

export async function setWidgetForSentry(widget: OktaSignIn) {
  await OktaPluginSentry.setWidgetForSentry?.(widget);
}

export default getOktaSignIn;
