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
import { loc, View, createButton } from 'okta';
import hbs from 'handlebars-inline-precompile';
import Enums from '../../../util/Enums';
import Util from '../../../util/Util';


export function doChallenge(view) {
  const deviceChallenge = view.getDeviceChallengePayload();
  switch (deviceChallenge.challengeMethod) {
  case Enums.LOOPBACK_CHALLENGE:
    view.title = loc('deviceTrust.sso.redirectText', 'login');
    view.add(View.extend({
      className: 'loopback-content',
      template: hbs`<div class="spinner"></div>`
    }));
    view.doLoopback(deviceChallenge);
    break;
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
      title: loc('customUri.required.content.button', 'login'),
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
    view.customURI = deviceChallenge.href;
    view.doCustomURI();
    break;
  case Enums.UNIVERSAL_LINK_CHALLENGE:
    view.title = loc('universalLink.title', 'login');
    view.add(View.extend({
      className: 'universal-link-content',
      template: hbs`
            <div class="spinner"></div>
            {{{i18n code="universalLink.content" bundle="login"}}}
          `
    }));
    view.add(createButton({
      className: 'ul-button button button-wide button-primary',
      title: loc('oktaVerify.reopen.button', 'login'),
      click: () => {
        // only window.location.href can open universal link in iOS/MacOS
        // other methods won't do, ex, AJAX get or form get (Util.redirectWithFormGet)
        Util.redirect(deviceChallenge.href);
      }
    }));
    break;
  case Enums.APP_LINK_CHALLENGE:
    view.title = loc('appLink.title', 'login');
    view.add(View.extend({
      className: 'app-link-content',
      template: hbs`
            {{{i18n code="appLink.content" bundle="login"}}}
          `
    }));
    view.add(createButton({
      className: 'al-button button button-wide button-primary',
      title: loc('oktaVerify.open.button', 'login'),
      click: () => {
        // only window.location.href can open app link in Android
        // other methods won't do, ex, AJAX get or form get (Util.redirectWithFormGet)
        Util.redirect(deviceChallenge.href, window, true);
      }
    }));
    break;
  }
}
