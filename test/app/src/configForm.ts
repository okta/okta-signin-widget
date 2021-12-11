/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { removeNils } from '@okta/okta-auth-js';
import { getBaseUrl, getIssuer } from './config';
import { Config } from './types';

const id = 'config-form';
export const ConfigForm = `
  <div id="${id}" class="pure-form pure-form-aligned">
    <div class="pure-control-group">
      <label for="issuer">Issuer</label><input id="f_issuer" name="issuer" type="text" />
    </div>
    <div class="pure-control-group">
      <label for="clientId">Client ID</label><input id="f_clientId" name="clientId" type="text" />
    </div>
    <div class="pure-control-group">
      <label for="redirectUri">Redirect URI</label><input id="f_redirectUri" name="redirectUri" type="text" />
    </div>
    <div class="pure-control-group">
      <label for="useInteractionCodeFlow">Use <strong>interaction code flow</strong></label>
      <input id="f_useInteractionCodeFlow-on" name="useInteractionCodeFlow" type="radio" value="true"/>YES
      <input id="f_useInteractionCodeFlow-off" name="useInteractionCodeFlow" type="radio" value="false"/>NO
    </div>
    <div class="pure-control-group">
    <label for="flow">Flow</label>
    <select id="f_flow" name="flow">
      <option value="" selected>default</option>
      <option value="proceed">proceed</option>
      <option value="login">login</option>
      <option value="signup">signup</option>
      <option value="resetPassword">resetPassword</option>
      <option value="unlockAccount">unlockAccount</option>
    </select>
    </div>
  </div>
`;

export function getConfigFromForm(): Config {
  const issuer = (document.getElementById('f_issuer') as HTMLInputElement).value;
  const redirectUri = (document.getElementById('f_redirectUri') as HTMLInputElement).value;
  const clientId = (document.getElementById('f_clientId') as HTMLInputElement).value;
  const useInteractionCodeFlow = (document.getElementById('f_useInteractionCodeFlow-on') as HTMLInputElement).checked;
  const flow = (document.querySelector('#f_flow') as HTMLSelectElement).value;
  const config: Config = {
    issuer,
    clientId,
    redirectUri,
    useInteractionCodeFlow,
    flow
  }
  return removeNils(config) as Config;
}

export function updateFormFromConfig(config: Config): void {
  const baseUrl = getBaseUrl(config);
  const issuer = getIssuer(config);
  const flow = config.flow || 'default';

  (document.getElementById('f_issuer') as HTMLInputElement).value = issuer || (baseUrl ? baseUrl + '/oauth2/default' : '');
  (document.getElementById('f_redirectUri') as HTMLInputElement).value = config.redirectUri;
  (document.getElementById('f_clientId') as HTMLInputElement).value = config.clientId;
 
  if (config.useInteractionCodeFlow) {
    (document.getElementById('f_useInteractionCodeFlow-on') as HTMLInputElement).checked = true;
  } else {
    (document.getElementById('f_useInteractionCodeFlow-off') as HTMLInputElement).checked = true;
  }

  (document.querySelector(`#f_flow`) as HTMLOptionElement).value = flow;
}


