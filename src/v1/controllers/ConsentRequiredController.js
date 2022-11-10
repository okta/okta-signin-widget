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
import { _, $, loc, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import Enums from 'util/Enums';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
import ScopeList from 'v1/views/consent/ScopeList';
import ScopeCheckBox from 'v1/views/consent/ScopeCheckBox';
import SkipLink from 'v1/views/shared/SkipLink';
import consentLogoHeaderTemplate from 'v1/views/shared/templates/consentLogoHeaderTemplate';

const granularConsentHeaderTemplate = hbs`
  {{#if clientURI}}
    <a href="{{clientURI}}" class="client-logo-link" target="_blank">
  {{/if}}
  {{#if customLogo}}
    <img class="client-logo custom-logo" src="{{customLogo}}" alt="{{i18n code="common.logo.alt" bundle="login"}}" aria-hidden="true" />
  {{else}}
    <img class="client-logo default-logo" src="{{defaultLogo}}" alt="{{i18n code="common.logo.alt" bundle="login"}}" aria-hidden="true" />
  {{/if}}
  {{#if clientURI}}
    </a>
  {{/if}}
  <h1>
    <span class="title-text">
        {{i18n 
            code="granular.consent.scopes.title" bundle="login" 
            arguments="appName"
            $1="<b class='no-translate'>$1</b>"
            $2="<p>$2</p>"
        }}
    </span>
    {{#if issuer}}
      <div class="issuer"><span>{{issuer}}</span></div>
    {{/if}}
  </h1>`;

const getConsentHeader = (template) => FormType.View({
  View: View.extend({
    className: 'consent-title detail-row',
    template,
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
});

const consentRequiredDescription = FormType.View({
  View: View.extend({
    className: 'consent-description detail-row',
    template: hbs`<p>{{i18n code="consent.required.description" bundle="login"}}</p>`,
  }),
});

const granularConsentDescription = FormType.View({
  View: View.extend({
    className: 'consent-description',
    template: hbs`<p>{{i18n code="granular.consent.scopes.description" bundle="login"}}</p>`,
  }),
});

const getScopeCheckBoxes = (scopes) => {
  const sortedScopes = scopes.slice().sort((scope1, scope2) => scope2.optional - scope1.optional);
  return _.map(sortedScopes, ({name, displayName, description, optional, isCustomized}) => FormType.Input({
    name: name,
    input: ScopeCheckBox,
    placeholder: displayName,
    label: false,
    modelType: 'boolean',
    required: true,
    options:
        {
          description,
          optional,
          isCustomized
        }
  }));
};

const isGranularConsent = (appState) => {
  return 'optional' in appState.get('scopes')[0];
};

export default FormController.extend({
  className: 'consent-required',
  initialize: function() {
    this.model.set('expiresAt', this.options.appState.get('expiresAt'));
    this.model.set('scopes', this.options.appState.get('scopes'));
    this.listenTo(this.form, 'cancel', _.bind(this.model.cancel, this.model));

    // add Skip to main content link
    const skipLink = new SkipLink();
    $(`#${Enums.WIDGET_LOGIN_CONTAINER_ID}`).prepend(skipLink.render().$el);

    if (isGranularConsent(this.options.appState)) {
      this.$el.addClass('granular-consent').removeClass('consent-required');
      this.form.cancel = _.partial(loc, 'oform.cancel', 'login');
      _.forEach(this.options.appState.get('scopes'), scope => {
        this.model.set(scope.name, true);
      });
    }
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
        let scopeNames = _.pluck(this.get('scopes'), 'name');
        let consent = { expiresAt: this.get('expiresAt') };
        if (isGranularConsent(this)) {
          consent['optedScopes'] =  _.reduce(scopeNames, (optedScopes, scope) => { optedScopes[scope] = this.get(scope); return optedScopes; }, {});
        } else {
          consent['scopes'] = scopeNames;
        }
        return transaction.consent({ consent });
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
      if (isGranularConsent(this.options.appState)) {
        return [
          getConsentHeader(granularConsentHeaderTemplate),
          granularConsentDescription,
        ].concat(getScopeCheckBoxes(this.options.appState.get('scopes')));
      } else {
        return [
          getConsentHeader(consentLogoHeaderTemplate),
          FormType.View({
            View: new ScopeList({ model: this.model }),
          }),
          consentRequiredDescription
        ];
      }
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
