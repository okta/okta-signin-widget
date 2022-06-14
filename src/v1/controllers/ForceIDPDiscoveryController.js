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

import Spinner from 'v1/views/shared/Spinner';
import BaseLoginController from 'v1/util/BaseLoginController';
import Util from 'util/Util';

export default BaseLoginController.extend({
  className: 'force-idp-discovery',

  View: Spinner,

  Model: {},

  initialize: function() {
    const OKTA_IDP_TYPE = 'OKTA';
    const RESOURCE = 'okta:acct:';

    const options = this.options;
    const lastAuthResponse = options.appState.get('lastAuthResponse');
    const stateToken = lastAuthResponse && lastAuthResponse?.stateToken;

    const webfingerArgs = {
      resource: RESOURCE,
      requestContext: stateToken,
    };

    options.appState.settings.getAuthClient()
      .webfinger(webfingerArgs)
      .then(res => {
        if (res?.links && res.links[0]) {
          if (res.links[0].properties['okta:idp:type'] !== OKTA_IDP_TYPE && res.links[0].href) {
            const redirectFn = res.links[0].href.includes('OKTA_INVALID_SESSION_REPOST%3Dtrue')
              ? Util.redirectWithFormGet.bind(Util)
              : this.settings.get('redirectUtilFn');
            //override redirectFn to only use Util.redirectWithFormGet if OKTA_INVALID_SESSION_REPOST is included
            //it will be encoded since it will be included in the encoded fromURI

            redirectFn(res.links[0].href);
            return;
          }
        }
        options.appState.trigger('navigate', '');
      })
      .catch(() => {
        // TODO: OKTA-436775 Show error instead of navigating to default route
        options.appState.trigger('navigate', '');
      });
  },

});
