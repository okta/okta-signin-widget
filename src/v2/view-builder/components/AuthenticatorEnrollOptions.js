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
import { ListView, loc, View, createButton } from 'okta';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';
import skipAll from './SkipOptionalEnrollmentButton';
import hbs from 'handlebars-inline-precompile';

const AuthenticatorRow = View.extend({
  className: 'authenticator-row clearfix',
  template: hbs('\
        <div class="authenticator-icon-container">\
          <div class="factor-icon authenticator-icon {{iconClassName}}">\
          </div>\
        </div>\
        <div class="authenticator-description">\
          <h3 class="authenticator-label no-translate">{{label}}</h3>\
          {{#if description}}\
            <p class="authenticator-description--text">{{description}}</p>\
          {{/if}}\
          <div class="authenticator-button" {{#if buttonDataSeAttr}}data-se="{{buttonDataSeAttr}}"{{/if}}></div>\
        </div>\
      '),
  children: function() {
    return [[createButton({
      className: 'button select-factor',
      title: function() {
        return loc('oie.enroll.authenticator.button.text', 'login');
      },
      click: function() {
        this.model.trigger('selectAuthenticator', this.model.get('value'));
      }
    }), '.authenticator-button']];
  },

/*
authenticatorKey: "webauthn"
buttonDataSeAttr: "webauthn"
description: "Use a security key or a biometric authenticator to sign in"
iconClassName: "mfa-webauthn"
label: "Security Key or Biometric Authenticator"
relatesTo: {type: 'security_key', key: 'webauthn', id: 'aut8txnehDjoXSome0w6', displayName: 'Security Key or Biometric', methods: Array(1)}
value: id: "aut8txnehDjoXSome0w6"
   */

  /*
    1. [X] auto trigger webauthn at enroll
    1. [x] auto skip when no webauthn
    2. [X] display skip button in webauthn enroll page
    3. [X] hide return to authenticator list link
    4. [X] at select enroll page, if no webauthn, try skip directly.
    5. [-] at select verify page
      - [X] auto select webauthn
      - otherwise, auto select email
   */
  minimize: function() {
    this.$el.addClass('authenticator-row-min');
  }
});

export default ListView.extend({

  // HCAK: hide enroll list as it's unlikely we need to show it.
  className: 'authenticator-enroll-list authenticator-list hide',

  item: AuthenticatorRow,

  itemSelector: '.list-content',

  initialize: function() {
    this.listenTo(this.collection,'selectAuthenticator', function(data) {
      this.model.set(this.options.name, data);
      this.options.appState.trigger('saveForm', this.model);
    });

    // HACK
    const webauthnFactors = this.collection.filter(m => m.get('authenticatorKey') === 'webauthn');

    this.hasOptionalFactors = this.options.appState.hasRemediationObject(RemediationForms.SKIP);
    if (this.hasOptionalFactors) {
      this.add(skipAll);
    }

    if (webauthnFactors.length === 1) {
      this.collection.trigger('selectAuthenticator', webauthnFactors[0].get('value'));
    }
    // HACK: skip whenever there is no webauthn.
    if (webauthnFactors.length === 0 && this.hasOptionalFactors) {
       this.options.appState.trigger('invokeAction', RemediationForms.SKIP);
       //TODO: how to reuse skipAll.click();
    }
  },

  template: hbs`<div class="list-content"> <div class="authenticator-list-title"> {{title}} </div> </div>`,

  getTemplateData() {
    // presence of the skip remediation form tells us that the authenticators are all optional
    const title = this.hasOptionalFactors? loc('oie.setup.optional', 'login'):loc('oie.setup.required', 'login');

    return {
      title
    };
  }

});
