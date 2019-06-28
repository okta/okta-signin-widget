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

define(['okta'], function (Okta) {

  var _ = Okta._;

  return Okta.View.extend({
    template: `
    {{#if showBackLink}}
      <a href="#" class="link help js-back" data-se="back-link">
        {{backLabel}}
      </a>
    {{/if}}
    {{#if showSkipLink}}
      <a href="#" class="link goto js-skip" data-se="skip-link">
        {{i18n code="enroll.choices.setup.skip" bundle="login"}}
      </a>
    {{/if}}`,
    className: 'auth-footer clearfix',
    events: {
      'click .js-skip' : function (e) {
        e.preventDefault();
        this.model.doTransaction(function (transaction) {
          return transaction.skip();
        });
      },
      'click .js-back' : function (e) {
        e.preventDefault();
        var backToFn = this.settings.get('customizableBackLinkInMFA.fn');
        if (_.isFunction(backToFn)) {
          backToFn(e);
        }
      }
    },
    getTemplateData: function () {
      var data = {
        showSkipLink: this.options.showSkipLink,
        showBackLink: this.options.showBackLink,
      };
      if (this.options.showBackLink) {
        data.backLabel = this.settings.get('customizableBackLinkInMFA.label');
      }
      return data;
    }
  });

});
