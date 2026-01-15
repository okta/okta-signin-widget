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
import { ListView, loc, View, createButton } from '@okta/courage';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';
import hbs from '@okta/handlebars-inline-precompile';
import TimeUtil from 'util/TimeUtil';
import { AUTHENTICATOR_ALLOWED_FOR_OPTIONS } from '../utils/Constants';

const AuthenticatorRow = View.extend({
  className: 'authenticator-row clearfix',
  template: hbs`
    <div class="authenticator-icon-container">
      {{#if logoUri}}
        <div class="factor-icon authenticator-icon {{iconClassName}} custom-app-logo" role="img"
          aria-label="{{i18n code="oie.auth.logo.aria.label" bundle="login"}}"></div>
      {{else}}
        <div class="factor-icon authenticator-icon {{iconClassName}}" role="img" 
          aria-label="{{i18n code="oie.auth.logo.aria.label" bundle="login"}}"></div>
      {{/if}}
    </div>
    <div class="authenticator-description">
      <h3 class="authenticator-label no-translate">{{label}}</h3>
      {{#if gracePeriodRequiredDescription}}
        <span class="authenticator-grace-period-required-icon"></span>
        <div class="authenticator-grace-period-text-container">
          <p class="authenticator-grace-period-required-description">
            {{gracePeriodRequiredDescription}}
          </p>
          {{#if gracePeriodExpiry}}
            <p class="authenticator-grace-period-expiry-date">{{gracePeriodExpiry}}</p>
          {{/if}}
        </div>
      {{else if gracePeriodRemainingSkipsDescription}}
        <span class="authenticator-grace-period-required-icon"></span>
          <div class="authenticator-grace-period-text-container">
            <p class="authenticator-grace-period-skip-count-description">{{gracePeriodRemainingSkipsDescription}}</p>
          </div>
        </span>
      {{else}}
        {{#if description}}
          <p class="authenticator-description--text">{{description}}</p>
        {{/if}}
        {{#if authenticatorUsageText}}
          <p class="authenticator-usage-text">{{authenticatorUsageText}}</p>
        {{/if}}
      {{/if}}
      <div class="authenticator-button" {{#if buttonDataSeAttr}}data-se="{{buttonDataSeAttr}}"{{/if}}></div>
    </div>
  `,
  postRender: function() {
    View.prototype.postRender.apply(this, arguments);
    if (this.model.get('logoUri')) {
      this.el.querySelector('.custom-app-logo').style.backgroundImage = `url(${this.model.get('logoUri')})`;
    }
  },
  children: function() {
    return [[createButton({
      className: 'button select-factor',
      title: function() {
        return loc('oie.enroll.authenticator.button.text', 'login');
      },
      attributes: {
        'aria-label': this.model.get('ariaLabel'),
      },
      click: function() {
        this.model.trigger('selectAuthenticator', this.model.get('value'));
      }
    }), '.authenticator-button']];
  },
  minimize: function() {
    this.$el.addClass('authenticator-row-min');
  },
  getTemplateData() {
    let authenticatorUsageText;
    const allowedFor = this.model.get('relatesTo').allowedFor;

    if (allowedFor) {
      switch (allowedFor) {
      case AUTHENTICATOR_ALLOWED_FOR_OPTIONS.ANY:
        authenticatorUsageText = loc('oie.enroll.authenticator.usage.text.access.recovery', 'login');
        break;
      case AUTHENTICATOR_ALLOWED_FOR_OPTIONS.RECOVERY:
        authenticatorUsageText = loc('oie.enroll.authenticator.usage.text.recovery', 'login');
        break;
      case AUTHENTICATOR_ALLOWED_FOR_OPTIONS.SSO:
        authenticatorUsageText = loc('oie.enroll.authenticator.usage.text.access', 'login');
        break;
      }
    }

    const data = View.prototype.getTemplateData.apply(this, arguments);

    data.authenticatorUsageText = authenticatorUsageText;

    const gracePeriodData = this._getGracePeriodData();

    return { ...data, ...gracePeriodData };
  },
  _getGracePeriodData() {
    const data = {};
    const currentTimestampMs = Date.now();
    const gracePeriodEpochTimestampMs = new Date(this.model.get('relatesTo')?.gracePeriod?.expiry).getTime();
    if (!isNaN(gracePeriodEpochTimestampMs) && currentTimestampMs < gracePeriodEpochTimestampMs) {
      const remainingGracePeriodDays = TimeUtil.calculateDaysBetween(
        currentTimestampMs,
        gracePeriodEpochTimestampMs
      );

      if (remainingGracePeriodDays === 1) {
        data.gracePeriodRequiredDescription = loc('oie.enrollment.policy.grace.period.required.in.one.day', 'login');
      } else if (remainingGracePeriodDays > 1) {
        data.gracePeriodRequiredDescription= loc(
          'oie.enrollment.policy.grace.period.required.in.days',
          'login',
          [remainingGracePeriodDays]
        );
      } else {
        data.gracePeriodRequiredDescription = loc('oie.enrollment.policy.grace.period.required.today', 'login');
      }

      if (gracePeriodEpochTimestampMs) {
        data.gracePeriodExpiry = TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(
          new Date(gracePeriodEpochTimestampMs),
          this.settings.get('languageTags'),
          false,
        );
      }
    } else if (this.model.get('relatesTo')?.gracePeriod?.remainingSkips
      && this.model.get('relatesTo')?.gracePeriod?.remainingSkips > 0
    ) {
      if (this.model.get('relatesTo')?.gracePeriod?.remainingSkips === 1) {
        data.gracePeriodRemainingSkipsDescription = loc('oie.enrollment.policy.grace.period.required.in.one.skip', 'login');
      } else {
        data.gracePeriodRemainingSkipsDescription = loc(
          'oie.enrollment.policy.grace.period.required.in.number.of.skips', 'login', [
            this.model.get('relatesTo')?.gracePeriod?.remainingSkips
          ]
        );
      }
    }
    return data;
  }
});

export default ListView.extend({

  className: 'authenticator-enroll-list authenticator-list',

  item: AuthenticatorRow,

  itemSelector: '.list-content',

  initialize: function() {
    this.listenTo(this.collection,'selectAuthenticator', function(data) {
      this.model.set(this.options.name, data);
      this.options.appState.trigger('saveForm', this.model);
    });
    this.hasOptionalFactors = this.options.appState.hasRemediationObject(RemediationForms.SKIP);
  },

  template: hbs`<div class="list-content">
    <div class="authenticator-list-title">
      {{title}}
    </div>
    {{#if subtitle}}
      <p class="authenticator-list-subtitle">
        {{subtitle}}
      </p>
    {{/if}}
    {{#if subtitleLinkOptions}}
      <div class="authenticator-list-subtitle-link-container">
        <a href={{subtitleLinkOptions.href}} target="_blank" rel="noopener noreferrer">{{subtitleLinkOptions.label}}</a>
      </div>
    {{/if}}
  </div>`,

  getTemplateData() {
    // presence of the skip remediation form tells us that the authenticators are all optional
    const title = this.hasOptionalFactors? loc('oie.setup.optional', 'login'):loc('oie.setup.required', 'login');
    return {
      title: this.options.listTitle || title,
      subtitle: this.options.listSubtitle || null,
      subtitleLinkOptions: this.options.listSubtitleLinkOptions || null,
    };
  }

});
