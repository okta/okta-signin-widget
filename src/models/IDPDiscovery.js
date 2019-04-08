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

define([
  'okta',
  'models/PrimaryAuth',
  'util/CookieUtil',
  'util/Enums'
],
function (Okta, PrimaryAuthModel, CookieUtil, Enums) {

  var { Util: CourageUtil } = Okta.internal.util;
  var _ = Okta._;

  return PrimaryAuthModel.extend({

    props: function () {
      var cookieUsername = CookieUtil.getCookieUsername(),
          properties = this.getUsernameAndRemember(cookieUsername);

      return {
        username: ['string', true, properties.username],
        lastUsername: ['string', false, cookieUsername],
        context: ['object', false],
        remember: ['boolean', true, properties.remember]
      };
    },

    local: {},

    save: function () {
      var username = this.settings.transformUsername(this.get('username'), Enums.IDP_DISCOVERY),
          remember = this.get('remember'),
          lastUsername = this.get('lastUsername'),
          resource = 'okta:acct:' + username;

      this.setUsernameCookie(username, remember, lastUsername);

      //the 'save' event here is triggered and used in the BaseLoginController
      //to disable the primary button
      this.trigger('save');

      this.appState.trigger('loading', true);

      var webfingerArgs = {
        resource: resource
      };

      var authClient = this.appState.settings.authClient;

      authClient.webfinger(webfingerArgs)
        .then(_.bind(function (res) {
          if(res) {
            if(res.links && res.links[0] && res.links[0].properties['okta:idp:type'] === 'OKTA') {
              this.trigger('goToPrimaryAuth');
            }
            else {
              var redirectFn = this.settings.get('redirectUtilFn');

              var successData = {
                idpDiscovery: {
                  redirectToIdp: function (redirectUrl) {
                    if(res.links && res.links[0] && res.links[0].href) {
                      var queryParams = {fromURI: redirectUrl};
                      queryParams['login_hint'] = username;
                      var url = res.links[0].href + CourageUtil.getUrlQueryString(queryParams);
                      redirectFn(url);
                    }
                  }
                }
              };
              this.settings.callGlobalSuccess(Enums.IDP_DISCOVERY, successData);
            }
          }
        }, this))
        .fail(_.bind(function () {
          this.trigger('error');
          // Specific event handled by the Header for the case where the security image is not
          // enabled and we want to show a spinner. (Triggered only here and handled only by Header).
          this.appState.trigger('removeLoading');
          CookieUtil.removeUsernameCookie();
        }, this))
        .fin(_.bind(function () {
          this.appState.trigger('loading', false);
        }, this));
    }
  });

});
