/*!
 * Copyright (c) 2015-2017, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import PrimaryAuthModel from 'models/PrimaryAuth';
import CookieUtil from 'util/CookieUtil';
import Enums from 'util/Enums';

export default PrimaryAuthModel.extend({
  props: function() {
    const cookieUsername = CookieUtil.getCookieUsername();
    const properties = this.getUsernameAndRemember(cookieUsername);

    return {
      username: ['string', true, properties.username],
      lastUsername: ['string', false, cookieUsername],
      context: ['object', false],
      remember: ['boolean', true, properties.remember],
    };
  },

  local: {},

  save: function() {
    const username = this.settings.transformUsername(this.get('username'), Enums.IDP_DISCOVERY);
    const remember = this.get('remember');
    const lastUsername = this.get('lastUsername');
    const resource = 'okta:acct:' + username;
    const requestContext = this.get('requestContext');

    this.setUsernameCookie(username, remember, lastUsername);

    //the 'save' event here is triggered and used in the BaseLoginController
    //to disable the primary button
    this.trigger('save');

    this.appState.trigger('loading', true);

    const webfingerArgs = {
      resource: resource,
      requestContext: requestContext,
    };
    const authClient = this.appState.settings.authClient;

    authClient
      .webfinger(webfingerArgs)
      .then(res => {
        if (res && res.links && res.links[0]) {
          if (res.links[0].properties['okta:idp:type'] === 'OKTA') {
            this.trigger('goToPrimaryAuth');
          } else if (res.links[0].href) {
            // Redirecting straight to the IDP URL is good for nothing because
            // it doesn't transmit tokens back the the client.

            return authClient.token.getWithRedirect({
              ...this.settings.options,
              // Unpack authParams
              ...this.settings.options.authParams,
              loginHint: username
            });
          }
        }
      })
      .catch(() => {
        this.trigger('error');
        // Specific event handled by the Header for the case where the security image is not
        // enabled and we want to show a spinner. (Triggered only here and handled only by Header).
        this.appState.trigger('removeLoading');
        CookieUtil.removeUsernameCookie();
      })
      .finally(() => {
        this.appState.trigger('loading', false);
      });
  },
});
