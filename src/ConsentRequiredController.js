/*!
 * Copyright (c) 2017, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint max-len: [2, 160] */
import { _, $, loc, View } from 'okta';
import hbs from 'handlebars-inline-precompile';
import Enums from 'util/Enums';
import FormController from 'util/FormController';
import FormType from 'util/FormType';
import ScopeList from 'views/consent/ScopeList';
import SkipLink from 'views/shared/SkipLink';
import consentLogoHeaderTemplate from 'views/shared/templates/consentLogoHeaderTemplate';

export default FormController.extend({
  className: 'consent-required',
  initialize: function() {
    this.model.set('expiresAt', this.options.appState.get('expiresAt'));
    this.model.set('scopes', this.options.appState.get('scopes'));
    this.listenTo(this.form, 'cancel', _.bind(this.model.cancel, this.model));

    // add Skip to main content link
    const skipLink = new SkipLink();
    $(`#${Enums.WIDGET_LOGIN_CONTAINER_ID}`).prepend(skipLink.render().$el);
  },
  postRender: function() {
    FormController.prototype.postRender.apply(this, arguments);

    // Update the "don't allow" and "allow access" buttons to be neutral by changing "allow button" to be gray.
    this.$('.o-form-button-bar .button-primary').removeClass('button-primary');
  },
  Model: {
    props: {
      expiresAt: ['string', true],
      scopes: ['array', true],
    },
    save: function() {
      return this.doTransaction(function(transaction) {
        return transaction.consent({
          consent: {
            expiresAt: this.get('expiresAt'),
            scopes: _.pluck(this.get('scopes'), 'name'),
          },
        });
      });
    },
    cancel: function() {
      const self = this;

      return this.doTransaction(function(transaction) {
        return transaction.cancel();
      }).then(function() {
        const consentCancelFn = self.settings.get('consent.cancel');

        if (_.isFunction(consentCancelFn)) {
          consentCancelFn();
        }
      });
    },
  },
  Form: {
    noCancelButton: false,
    buttonOrder: ['cancel', 'save'],
    autoSave: true,
    save: _.partial(loc, 'consent.required.consentButton', 'login'),
    cancel: _.partial(loc, 'consent.required.cancelButton', 'login'),
    formChildren: function() {
      return [
        FormType.View({
          View: View.extend({
            className: 'consent-title detail-row',
            template: consentLogoHeaderTemplate,
            getTemplateData: function() {
              const appState = this.options.appState;

              return {
                appName: appState.escape('targetLabel'),
                customLogo: appState.get('targetLogo') && appState.get('targetLogo').href,
                defaultLogo: appState.get('defaultAppLogo'),
                clientURI: appState.get('targetClientURI') && appState.get('targetClientURI').href,
              };
            },
          }),
        }),
        FormType.View({
          View: new ScopeList({ model: this.model }),
        }),
        FormType.View({
          View: View.extend({
            className: 'consent-description detail-row',
            template: hbs(
              '\
                <p>{{i18n code="consent.required.description" bundle="login"}}</p>\
              '
            ),
          }),
        }),
      ];
    },
  },
  Footer: View.extend({
    className: 'consent-footer',
    template: hbs(
      '\
        {{#if termsOfService}}\
          <a class="terms-of-service" href="{{termsOfService}}" target="_blank">{{i18n code="consent.required.termsOfService" bundle="login"}}</a>\
          {{#if privacyPolicy}}\
            &#8226\
          {{/if}}\
        {{/if}}\
        {{#if privacyPolicy}}\
          <a class="privacy-policy" href="{{privacyPolicy}}" target="_blank">{{i18n code="consent.required.privacyPolicy" bundle="login"}}</a>\
        {{/if}}\
      '
    ),
    getTemplateData: function() {
      const appState = this.options.appState;

      return {
        termsOfService: appState.get('targetTermsOfService') && appState.get('targetTermsOfService').href,
        privacyPolicy: appState.get('targetPrivacyPolicy') && appState.get('targetPrivacyPolicy').href,
      };
    },
  }),
});
