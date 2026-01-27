/*!
 * Copyright (c) 2020, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
import { loc, View, createButton, createCallout, _ } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import Enums from 'util/Enums';
import { ChromeLNADeniedError } from 'util/Errors';
import Util from 'util/Util';
import {
  FASTPASS_FALLBACK_SPINNER_TIMEOUT,
  IDENTIFIER_FLOW,
  LOOPBACK_RESPONSE_STATUS_CODE,
  OV_UV_ENABLE_BIOMETRICS_FASTPASS_DESKTOP, 
  OV_UV_ENABLE_BIOMETRICS_FASTPASS_MOBILE,
  REQUEST_PARAM_AUTHENTICATION_CANCEL_REASON,
} from '../utils/Constants';
import BrowserFeatures from '../../../util/BrowserFeatures';

export function appendLoginHint(deviceChallengeUrl, loginHint) {
  if (deviceChallengeUrl && loginHint) {
    deviceChallengeUrl += '&login_hint=' + loginHint;
  }

  return deviceChallengeUrl;
}

const LNAErrorViewContent = View.extend({
  template: hbs`
  {{i18n code="chrome.lna.error.description.intro" bundle="login"}}
  <ol class="chrome-lna-error-steps">
    <li>{{i18n code="chrome.lna.error.description.step1" bundle="login"}}</li>
    <li>{{i18n code="chrome.lna.error.description.step2" bundle="login"}}</li>
    <li>{{i18n code="chrome.lna.error.description.step3" bundle="login"}}</li>
  </ol>
  {{i18n code="chrome.lna.error.description.more.information" bundle="login"
    $1="<a href='#' target='_blank' rel='noopener noreferrer' class='chrome-lna-help-link'>$1</a>"}}
  `,
  getTemplateData() {
    this.chromeLNAHelpLink = this.options.chromeLNAHelpLink;
  },
  render() {
    View.prototype.render.apply(this, arguments);
    if (this.chromeLNAHelpLink) {
      this.$el.find('.chrome-lna-help-link').attr('href', this.chromeLNAHelpLink);
    }
  },
});

function addLNAErrorView(view, chromeLNAHelpLink) {
  view.add(createCallout({
    title: loc('chrome.lna.error.title', 'login'),
    content: new LNAErrorViewContent({ chromeLNAHelpLink }),
    type: 'error'
  }));
}

function addLoopbackView(view, deviceChallenge) {
  view.add(View.extend({
    className: 'loopback-content',
    template: hbs`<div class="spinner"></div>`
  }));
  view.doLoopback(deviceChallenge);
}

function updateChromeLNATitle(view, newTitle) {
  view.title = newTitle;
  if (view.$ && view.$('.okta-form-title').length) {
    view.$('.okta-form-title').text(newTitle);
  }
}

function handlePermissionState(view, currPermissionState, deviceChallenge) {
  view.removeChildren();
  switch(currPermissionState) {
  case 'prompt':
  case 'granted':
    updateChromeLNATitle(view, loc('deviceTrust.sso.redirectText', 'login'));
    addLoopbackView(view, deviceChallenge);
    break;
  case 'denied': {
    // If there is no previous form name, it is a silent probe triggered by the registered condition
    const isRegisteredConditionSilentProbe = view.options?.appState?.get('previousFormName') === undefined;
    if (isRegisteredConditionSilentProbe) {
      updateChromeLNATitle(view, loc('deviceTrust.sso.redirectText', 'login'));
      addLoopbackView(view, deviceChallenge);
    } else {
      updateChromeLNATitle(view, loc('chrome.lna.fastpass.requires.permission.title', 'login'));
      addLNAErrorView(view, deviceChallenge.chromeLocalNetworkAccessDetails?.chromeLNAHelpLink);
      // Log error for Sentry monitoring
      throw new ChromeLNADeniedError('Chrome Local Network Access permission was denied for FastPass.');
    }
    break;
  }
  default:
    updateChromeLNATitle(view, loc('deviceTrust.sso.redirectText', 'login'));
    addLoopbackView(view, deviceChallenge);
    break;
  }
}

export function doChallenge(view, fromView) {
  const deviceChallenge = view.getDeviceChallengePayload();
  const { chromeLocalNetworkAccessDetails } = deviceChallenge || {};
  const loginHint = view.options?.settings?.get('identifier');
  const HIDE_CLASS = 'hide';
  switch (deviceChallenge.challengeMethod) {
  case Enums.LOOPBACK_CHALLENGE: {
    view.title = loc('deviceTrust.sso.redirectText', 'login');
    if (chromeLocalNetworkAccessDetails) {
      BrowserFeatures.getChromeLNAPermissionState(
        (currPermissionState) => handlePermissionState(view, currPermissionState, deviceChallenge)
      );
    } else {
      addLoopbackView(view, deviceChallenge);
    }
    break;
  }
  case Enums.CUSTOM_URI_CHALLENGE:
    view.title = loc('customUri.title', 'login');
    view.add(View.extend({
      className: 'skinny-content',
      template: hbs`
            <p>
              {{i18n code="customUri.required.content.prompt" bundle="login"}}
            </p>
          `,
    }));
    view.add(createButton({
      className: 'ul-button button button-wide button-primary',
      title: loc('oktaVerify.open.button', 'login'),
      id: 'launch-ov',
      click: () => {
        view.doCustomURI();
      }
    }));
    view.add(View.extend({
      className: 'skinny-content',
      template: hbs`
          <p>
            {{i18n code="customUri.required.content.download.title" bundle="login"}}
          </p>
          <p>
            <a href="{{downloadOVLink}}" target="_blank" id="download-ov" class="link">
              {{i18n code="customUri.required.content.download.linkText" bundle="login"}}
            </a>
          </p>
          `,
      getTemplateData() {
        return {
          downloadOVLink: deviceChallenge.downloadHref
        };
      },
    }));
    view.customURI = appendLoginHint(deviceChallenge.href, loginHint);
    view.doCustomURI();
    break;
  case Enums.UNIVERSAL_LINK_CHALLENGE:
    view.title = loc('universalLink.title', 'login');
    view.add(View.extend({
      className: 'universal-link-content',
      template: hbs`
            <div class="spinner"></div>
            {{i18n code="universalLink.content" bundle="login"}}
          `
    }));
    view.add(createButton({
      className: 'ul-button button button-wide button-primary',
      title: loc('oktaVerify.open.button', 'login'),
      click: () => {
        // only window.location.href can open universal link in iOS/MacOS
        // other methods won't do, ex, AJAX get or form get (Util.redirectWithFormGet)
        let deviceChallengeUrl = appendLoginHint(deviceChallenge.href, loginHint);
        Util.redirect(deviceChallengeUrl);
      }
    }));
    break;
  case Enums.APP_LINK_CHALLENGE:
    view.title = loc('appLink.title', 'login');
    view.add(View.extend({
      className: 'app-link-content',
      template: hbs`
        <div class="spinner {{hideClass}}"></div>
        <div class="appLinkContent {{hideClass}}">{{i18n code="appLink.content" bundle="login"}}</div>
      `,
      getTemplateData() {
        return { hideClass: HIDE_CLASS };
      },
      postRender() {
        if (fromView === IDENTIFIER_FLOW) {
          this.$('.spinner').removeClass(HIDE_CLASS);
          setTimeout(_.bind(()=> {
            const data = { label: loc('goback', 'login') };
            this.options.appState.trigger('updateFooterLink', data);
            this.$('.spinner').addClass(HIDE_CLASS);
            this.$('.appLinkContent').removeClass(HIDE_CLASS);
          }, this), FASTPASS_FALLBACK_SPINNER_TIMEOUT);
        } else {
          this.$('.appLinkContent').removeClass(HIDE_CLASS);
        }
      },
    }));
    view.add(createButton({
      className: `${HIDE_CLASS} al-button button button-wide button-primary`,
      title: loc('oktaVerify.open.button', 'login'),
      click: () => {
        // only window.location.href can open app link in Android
        // other methods won't do, ex, AJAX get or form get (Util.redirectWithFormGet)
        let deviceChallengeUrl = appendLoginHint(deviceChallenge.href, loginHint);
        Util.redirect(deviceChallengeUrl, window, true);
      },
      postRender() {
        if (fromView === IDENTIFIER_FLOW) {
          setTimeout(_.bind(()=> {
            this.$el.removeClass(HIDE_CLASS);
          }, this), FASTPASS_FALLBACK_SPINNER_TIMEOUT);
        } else {
          this.$el.removeClass(HIDE_CLASS);
        }
      }
    }));
    break;
  case Enums.CHROME_DTC:
    // reusing the existing message for Chrome DTC
    view.title = loc('deviceTrust.sso.redirectText', 'login');
    view.add(View.extend({
      className: 'chrome-dtc-content',
      template: hbs`
            <div class="spinner"></div>
          `
    }));
    view.doChromeDTC(deviceChallenge);
    break;
  }
}

export function cancelPollingWithParams(appState, pollingCancelAction, cancelReason, statusCode, showFormErrors) {
  const actionParams = {};
  actionParams[REQUEST_PARAM_AUTHENTICATION_CANCEL_REASON] = cancelReason;
  actionParams[LOOPBACK_RESPONSE_STATUS_CODE] = statusCode;
  appState.trigger('invokeAction', pollingCancelAction, actionParams, showFormErrors);
}

export function getBiometricsErrorOptions(error, isMessageObj) {
  let errorSummaryKeys;
  if (isMessageObj) {
    errorSummaryKeys  = Object.values(error?.value[0]?.i18n);
  } else {
    errorSummaryKeys = error?.responseJSON?.errorSummaryKeys;
  }

  const isBiometricsRequiredMobile = errorSummaryKeys 
      && errorSummaryKeys.includes(OV_UV_ENABLE_BIOMETRICS_FASTPASS_MOBILE);
  const isBiometricsRequiredDesktop = errorSummaryKeys 
      && errorSummaryKeys.includes(OV_UV_ENABLE_BIOMETRICS_FASTPASS_DESKTOP);
  let options = [];

  if (!isBiometricsRequiredMobile && !isBiometricsRequiredDesktop) {
    return options;
  }

  const bulletPoints = [
    loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point1', 'login'),
    loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point2', 'login'),
    loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point3', 'login')
  ];

  // Add an additional bullet point for desktop devices
  if (isBiometricsRequiredDesktop) {
    bulletPoints.push(
      loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.point4', 'login')
    );
  }

  options = {
    type: 'error',
    className: 'okta-verify-uv-callout-content',
    title: loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.title', 'login'),
    subtitle: loc('oie.authenticator.oktaverify.method.fastpass.verify.enable.biometrics.description', 'login'),
    bullets: bulletPoints,
  };

  return options;
}

export function createInvisibleIFrame(iFrameId, iFrameSrc) {
  const iFrameView = View.extend({
    tagName: 'iframe',
    id: iFrameId,
    attributes: {
      src: iFrameSrc,
    },
    initialize() {
      this.el.style.display = 'none';
    }
  });
  return iFrameView;
}
