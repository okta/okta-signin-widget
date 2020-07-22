/*!
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint complexity:[2, 10], max-params: [2, 11] */
import hbs from 'handlebars-inline-precompile';
define([
  'okta',
  'util/FormController',
  'util/FormType',
  'views/shared/FooterWithBackLink'
],
function (Okta, FormController, FormType, FooterWithBackLink) {

  var _ = Okta._,
      $ = Okta.$;
  var { Util } = Okta.internal.util;

  return FormController.extend({
    className: 'piv-cac-card',
    Model: {

      save: async function () {
        this.trigger('request');
        var self = this,
            pivConfig = this.settings.get('piv'),
            data = {
              fromURI: this.settings.get('relayState'),
              isCustomDomain: pivConfig.isCustomDomain
            };

        try {
          await this.getCert(pivConfig.certAuthUrl);
          const res = await this.postCert(pivConfig.certAuthUrl, data);
          Util.redirect(res.redirectUrl);
        } catch (err) {
          if (_.isEmpty(err.responseJSON) && !err.responseText) {
            err.responseJSON = {
              errorSummary: Okta.loc('piv.cac.error', 'login')
            };
          }
          self.trigger('error', self, err);
        }
      },

      getCert: function (certAuthUrl) {
        return $.get({
          url: certAuthUrl,
          xhrFields: {
            withCredentials: true
          },
          beforeSend: function () {
            // overriding this function to prevent our jquery-wrapper from
            // setting headers. Need to keep this a simple request in order for
            // PIV / CAC to work in IE.
          },
        });
      },

      postCert: function (certAuthUrl, data) {
        return $.post({
          url: certAuthUrl,
          xhrFields: {
            withCredentials: true
          },
          data: JSON.stringify(data),
          contentType: 'text/plain',
          beforeSend: function () {
            // overriding this function to prevent our jquery-wrapper from
            // setting headers. Need to keep this a simple request in order for
            // PIV / CAC to work in IE.
          },
        });
      }
    },

    Form: {
      autoSave: true,
      hasSavingState: false,
      title: _.partial(Okta.loc, 'piv.cac.title', 'login'),
      className: 'piv-cac-card',
      noCancelButton: true,
      save: _.partial(Okta.loc, 'retry', 'login'),
      modelEvents: {
        'request': '_startEnrollment',
        'error': '_stopEnrollment'
      },

      formChildren: [
        FormType.View({
          View: Okta.View.extend({
            template: hbs('<div class="piv-verify-text">\
               <p>{{i18n code="piv.cac.card.insert" bundle="login"}}</p>\
               <div data-se="piv-waiting" class="okta-waiting-spinner"></div>\
             </div>')
          })
        })
      ],

      _startEnrollment: function () {
        this.$('.okta-waiting-spinner').show();
        this.$('.o-form-button-bar').hide();
      },
      
      _stopEnrollment: function () {
        this.$('.okta-waiting-spinner').hide();
        this.$('.o-form-button-bar').show();
      },

      postRender: function () {
        _.defer(() => {
          this.model.save();
        });
      },
    },

    back: function () {
      // Empty function on verify controllers to prevent users
      // from navigating back during 'verify' using the browser's
      // back button. The URL will still change, but the view will not
      // More details in OKTA-135060.
    },

    Footer: FooterWithBackLink
  });

});
