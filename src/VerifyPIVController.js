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

define([
  'okta',
  'util/FormController',
  'util/FormType',
  'views/shared/FooterWithBackLink',
  'q'
],
function (Okta, FormController, FormType, FooterWithBackLink, Q) {

  var _ = Okta._,
      $ = Okta.$;
  var { Util } = Okta.internal.util;

  return FormController.extend({
    className: 'mfa-verify verify-piv',
    Model: {

      save: function () {
        this.trigger('request');
        var self = this,
            data = {
              fromUri: this.settings.get('relayState')
            },
            pivButton = this.settings.get('piv');
        return Q($.post(pivButton.certAuthUrl, data))
          .then(function (res) {
            Util.redirect(res.redirectUrl);
          })
          .fail(function (err) {
            self.trigger('error', self, err);
          });
      }
    },

    Form: {
      autoSave: true,
      hasSavingState: false,
      title: 'PIV',
      className: 'verify-piv',
      noCancelButton: true,
      save: _.partial(Okta.loc, 'retry', 'login'),
      modelEvents: {
        'request': '_startEnrollment',
        'error': '_stopEnrollment'
      },

      formChildren: function () {
        var children = [];
        children.push(FormType.View({
          View:
             '<div class="piv-verify-text">\
               <p>{{i18n code="piv.card.insert" bundle="login"}}</p>\
               <div data-se="piv-waiting" class="okta-waiting-spinner"></div>\
             </div>'
        }));

        return children;
      },

      _startEnrollment: function () {
        this.$('.okta-waiting-spinner').show();
        this.$('.o-form-button-bar').hide();
      },
      
      _stopEnrollment: function () {
        this.$('.okta-waiting-spinner').hide();
        this.$('.o-form-button-bar').show();
      },

      postRender: function () {
        _.defer(_.bind(function () {
          this.model.save();
        }, this));
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
