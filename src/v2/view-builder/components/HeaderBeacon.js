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
import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

export default View.extend({
  template: hbs`
    <div data-type="beacon-container" class="beacon-container">
      <div class="beacon-blank auth-beacon">
        <div class="beacon-blank js-blank-beacon-border auth-beacon-border"></div>
      </div>
      {{#if logoUri}}
      <div class="bg-helper auth-beacon auth-beacon-factor {{className}} custom-app-logo" 
      data-se="factor-beacon" role="img" 
        aria-label="{{i18n code="oie.auth.logo.aria.label" bundle="login"}}">
      {{else}}
      <div class="bg-helper auth-beacon auth-beacon-factor {{className}}" data-se="factor-beacon">
      {{/if}}
          <div class="okta-sign-in-beacon-border auth-beacon-border"></div>
        </div>
    </div >
  `,

  postRender: function() {
    View.prototype.postRender.apply(this, arguments);
    const data = this.getTemplateData();
    if (data.logoUri) {
      this.el.querySelector('.custom-app-logo').style.backgroundImage = `url(${data.logoUri})`;
    }
  },
  getTemplateData: function() {
    const appState = this.options?.appState;
    return { className: this.getBeaconClassName() || '',
      logoUri: appState?.get('currentAuthenticator')?.logoUri || 
        appState?.get('currentAuthenticatorEnrollment')?.logoUri
    };
  },
  getBeaconClassName() {
    return 'undefined-user';
  }
});
