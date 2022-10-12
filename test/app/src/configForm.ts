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

import type { FlowIdentifier } from '@okta/okta-auth-js';
import { removeNils } from './util'
import { getBaseUrl, getIssuer } from './config';
import { Config } from './types';

const id = 'config-form';
export const ConfigForm = `
  <div id="${id}" class="pure-form pure-form-aligned">
    <div class="pure-control-group">
      <label for="bundle">Bundle</label>
      <select id="f_bundle" name="bundle">
        <option value="default">default</option>
        <option value="classic">classic</option>
        <option value="oie">oie</option>
        <option value="no-polyfill">no-polyfill</option>
      </select>
    </div>
    <div class="pure-control-group">
      <label for="useMinBundle">Use minified bundle</label>
      <input id="f_useMinBundle-on" name="useMinBundle" type="radio" value="true"/>YES
      <input id="f_useMinBundle-off" name="useMinBundle" type="radio" value="false"/>NO
    </div>
    <div class="pure-control-group">
      <label for="usePolyfill">Use polyfill</label>
      <input id="f_usePolyfill-on" name="usePolyfill" type="radio" value="true"/>YES
      <input id="f_usePolyfill-off" name="usePolyfill" type="radio" value="false"/>NO
    </div>
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
      <label for="useClassicEngine">Use <strong>classic engine</strong></label>
      <input id="f_useClassicEngine-on" name="useClassicEngine" type="radio" value="true"/>YES
      <input id="f_useClassicEngine-off" name="useClassicEngine" type="radio" value="false"/>NO
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
  const bundle = (document.querySelector('#f_bundle') as HTMLSelectElement).value;
  const useMinBundle = (document.getElementById('f_useMinBundle-on') as HTMLInputElement).checked;
  const usePolyfill = (document.getElementById('f_usePolyfill-on') as HTMLInputElement).checked;

  // Widget options
  const issuer = (document.getElementById('f_issuer') as HTMLInputElement).value;
  const redirectUri = (document.getElementById('f_redirectUri') as HTMLInputElement).value;
  const clientId = (document.getElementById('f_clientId') as HTMLInputElement).value;
  const useClassicEngine = (document.getElementById('f_useClassicEngine-on') as HTMLInputElement).checked;
  const flow = (document.querySelector('#f_flow') as HTMLSelectElement).value as FlowIdentifier;

  const widgetOptions = {
    issuer,
    clientId,
    redirectUri,
    useClassicEngine,
    flow
  }

  const config: Config = {
    bundle,
    useMinBundle,
    usePolyfill,
    widgetOptions
  };

  return removeNils(config) as Config;
}

export function updateFormFromConfig(config: Config): void {
  const { bundle, useBundledWidget, widgetOptions } = config;
  const { useMinBundle } = config;

  // Widget options
  const baseUrl = getBaseUrl(widgetOptions);
  const issuer = getIssuer(widgetOptions);
  const flow = widgetOptions.flow || 'default';

  (document.querySelector(`#f_bundle`) as HTMLOptionElement).value = bundle;
  
  if (useMinBundle) {
    (document.getElementById('f_useMinBundle-on') as HTMLInputElement).checked = true;
  } else {
    (document.getElementById('f_useMinBundle-off') as HTMLInputElement).checked = true;
  }
  if (usePolyfill) {
    (document.getElementById('f_usePolyfill-on') as HTMLInputElement).checked = true;
  } else {
    (document.getElementById('f_usePolyfill-off') as HTMLInputElement).checked = true;
  }
  if (useBundledWidget) {
    (document.querySelector(`#f_bundle`) as HTMLOptionElement).disabled = true;
    (document.getElementById('f_useMinBundle-on') as HTMLInputElement).disabled = true;
    (document.getElementById('f_useMinBundle-off') as HTMLInputElement).disabled = true;
  }
  (document.getElementById('f_issuer') as HTMLInputElement).value = issuer || (baseUrl ? baseUrl + '/oauth2/default' : '');
  (document.getElementById('f_redirectUri') as HTMLInputElement).value = widgetOptions.redirectUri;
  (document.getElementById('f_clientId') as HTMLInputElement).value = widgetOptions.clientId;
 
  if (widgetOptions.useClassicEngine) {
    (document.getElementById('f_useClassicEngine-on') as HTMLInputElement).checked = true;
  } else {
    (document.getElementById('f_useClassicEngine-off') as HTMLInputElement).checked = true;
  }

  (document.querySelector(`#f_flow`) as HTMLOptionElement).value = flow;
}


