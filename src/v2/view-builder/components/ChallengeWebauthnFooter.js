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
import { loc, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import AuthenticatorFooter from './AuthenticatorFooter';

const OKTA_AUTHENTICATOR = 'Okta_Authenticator';

const CantVerifyInfoVerifyFlowView = View.extend({
  id: 'help-description-container',
  className: 'help-description js-help-description',
  template: hbs`
      <h3>{{i18n code="oie.verify.webauthn.cant.verify.biometric.authenticator.title" bundle="login"}}</h3><br>
      <p>{{i18n code="oie.verify.webauthn.cant.verify.biometric.authenticator.description1" bundle="login"}}</p><br>
      <p>{{i18n code="oie.verify.webauthn.cant.verify.biometric.authenticator.description2" bundle="login"}}</p><br>
      <h3>{{i18n code="oie.verify.webauthn.cant.verify.security.key.title" bundle="login"}}</h3><br>
      <p>{{i18n code="oie.verify.webauthn.cant.verify.security.key.description" bundle="login"}}</p><br>
  `,
});

const CantVerifyInfoOVEnrollmentFlowView = View.extend({
  id: 'help-description-container',
  className: 'help-description js-help-description',
  template: hbs`
      <ol class="ov-enrollment-info">
        <li>{{i18n code="oie.verify.webauthn.cant.verify.enrollment.step1" bundle="login"}}</li><br>
        <li>{{i18n code="oie.verify.webauthn.cant.verify.enrollment.step2" bundle="login"}}</li><br>
        <li>{{i18n code="oie.verify.webauthn.cant.verify.enrollment.step3" bundle="login"}}</li><br>
        <li>{{i18n code="oie.verify.webauthn.cant.verify.enrollment.step4" bundle="login"}}</><br>
      </ol>
  `,
});

export default AuthenticatorFooter.extend({
  links: function() {
    const links = AuthenticatorFooter.prototype.links.apply(this, arguments);

    const cantVerifyInfoView = this.options.appState.get('app')
      && this.options.appState.get('app').name === OKTA_AUTHENTICATOR ?
      CantVerifyInfoOVEnrollmentFlowView: CantVerifyInfoVerifyFlowView;
    links.unshift({
      'label': loc('oie.verify.webauthn.cant.verify', 'login'),
      'name': 'cant-verify',
      'aria-controls': 'help-description-container',
      'class': 'link help js-help',
      'type': 'toggle-text-link',
      'additionalOptions': {
        view: cantVerifyInfoView,
        selector: '.js-help-description',
      },
    });

    return links;
  },
});
