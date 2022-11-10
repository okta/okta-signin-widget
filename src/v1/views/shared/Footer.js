/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { _, View, internal } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
const { Util } = internal.util;
export default View.extend({
  template: hbs(
    '\
      <a href="#" data-se="needhelp" aria-expanded="false" \
        aria-controls="help-links-container" class="link help js-help">\
      {{i18n code="needhelp" bundle="login"}}\
      </a>\
      <ul class="help-links js-help-links" id="help-links-container">\
        <li>\
        <a href="#" data-se="forgot-password" class="link js-forgot-password">\
        {{i18n code="forgotpassword" bundle="login"}}\
        </a>\
        </li>\
        {{#if features.selfServiceUnlock}}\
          <li>\
          <a href="#" data-se="unlock" class="link js-unlock">\
          {{i18n code="unlockaccount" bundle="login"}}\
          </a>\
          </li>\
        {{/if}}\
        {{#each helpLinks.custom}}\
          <li>\
          <a href="{{href}}" class="link js-custom" rel="noopener noreferrer"\
          {{#if target}}target="{{target}}"{{/if}}>{{text}}</a>\
          </li>\
        {{/each}}\
        <li>\
        <a href="{{helpLinkUrl}}" data-se="help-link" class="link js-help-link"\
          rel="noopener noreferrer" target="_blank">\
        {{i18n code="help" bundle="login"}}\
        </a>\
        </li>\
      </ul>\
    '
  ),
  className: 'auth-footer',

  initialize: function() {
    this.listenTo(this.state, 'change:enabled', function(model, enable) {
      this.$('.link').toggleClass('o-form-disabled', !enable);
    });
  },

  getTemplateData: function() {
    let helpLinkUrl;
    const customHelpPage = this.settings.get('helpLinks.help');

    if (customHelpPage) {
      helpLinkUrl = customHelpPage;
    } else {
      helpLinkUrl = hbs('{{baseUrl}}/help/login')({ baseUrl: this.settings.get('baseUrl') });
    }
    return _.extend(this.settings.toJSON({ verbose: true }), { helpLinkUrl: helpLinkUrl });
  },
  postRender: function() {
    this.$('.js-help-links').hide();
  },
  toggleLinks: function(e) {
    e.preventDefault();

    this.$('.js-help-links').slideToggle(200, () => {
      this.$('.js-help').attr('aria-expanded', this.$('.js-help-links').is(':visible'));
    });
  },
  events: {
    'click .js-help': function(e) {
      e.preventDefault();
      if (!this.state.get('enabled')) {
        return;
      }

      this.toggleLinks(e);
    },
    'click .js-forgot-password': function(e) {
      e.preventDefault();
      if (!this.state.get('enabled')) {
        return;
      }

      const customResetPasswordPage = this.settings.get('helpLinks.forgotPassword');

      if (customResetPasswordPage) {
        Util.redirect(customResetPasswordPage);
      } else {
        this.options.appState.trigger('navigate', 'signin/forgot-password');
      }
    },
    'click .js-unlock': function(e) {
      e.preventDefault();
      if (!this.state.get('enabled')) {
        return;
      }

      const customUnlockPage = this.settings.get('helpLinks.unlock');

      if (customUnlockPage) {
        Util.redirect(customUnlockPage);
      } else {
        this.options.appState.trigger('navigate', 'signin/unlock');
      }
    },
  },
});
