/*!
 * Okta Sign-In Widget SDK LEGAL NOTICES
 *
 * The Okta software accompanied by this notice is provided pursuant to the
 * following terms:
 *
 * Copyright © 2015, Okta, Inc. Licensed under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0. Unless required by applicable
 * law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * The Okta software accompanied by this notice has build dependencies on
 * certain third party software licensed under separate terms ("Third Party
 * Components").
 *
 * Okta makes the following disclaimers regarding the Third Party Components on
 * behalf of itself, the copyright holders, contributors, and licensors of such
 * Third Party Components:
 * TO THE FULLEST EXTENT PERMITTED UNDER APPLICABLE LAW, THE THIRD PARTY
 * COMPONENTS ARE PROVIDED BY THE COPYRIGHT HOLDERS, CONTRIBUTORS, LICENSORS,
 * AND OKTA "AS IS" AND ANY REPRESENTATIONS OR WARRANTIES OF ANY KIND, WHETHER
 * ORAL OR WRITTEN, WHETHER EXPRESS, IMPLIED, OR ARISING BY STATUTE, CUSTOM,
 * COURSE OF DEALING, OR TRADE USAGE, INCLUDING WITHOUT LIMITATION THE IMPLIED
 * WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
 * NON-INFRINGEMENT, ARE DISCLAIMED. IN NO EVENT WILL THE COPYRIGHT OWNER,
 * CONTRIBUTORS, LICENSORS, OR OKTA BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION), HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE THIRD
 * PARTY COMPONENTS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

define([
  'okta',
  'views/primary-auth/PrimaryAuthForm',
  'views/primary-auth/SocialAuth',
  'models/PrimaryAuth',
  'shared/util/Util',
  'util/BaseLoginController'
],
function (Okta, PrimaryAuthForm, SocialAuth, PrimaryAuthModel, Util, BaseLoginController) {

  var compile = Okta.Handlebars.compile;
  var _ = Okta._;

  var Footer = Okta.View.extend({
    template: '\
      <a href="#" data-se="needhelp" class="link help js-help">\
      {{i18n code="needhelp" bundle="login"}}\
      </a>\
      <ul class="help-links js-help-links">\
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
          <a href="{{href}}" class="link js-custom">{{text}}</a></li>\
        {{/each}}\
        <li>\
        <a href="{{helpLinkUrl}}" data-se="help-link" class="link js-help-link">\
        {{i18n code="help" bundle="login"}}\
        </a>\
        </li>\
      </ul>\
    ',
    className: 'auth-footer',
    getTemplateData: function () {
      var helpLinkUrl;
      var customHelpPage = this.settings.get('helpLinks.help');
      if (customHelpPage) {
        helpLinkUrl = customHelpPage;
      } else {
        helpLinkUrl = compile('{{baseUrl}}/help/login')({baseUrl: this.settings.get('baseUrl')});
      }
      return _.extend(this.settings.toJSON({verbose: true}), {helpLinkUrl: helpLinkUrl});
    },
    postRender: function () {
      this.$('.js-help-links').hide();
    },
    toggleLinks: function (e) {
      e.preventDefault();
      this.$('.js-help-links').slideToggle(200);
    },
    events: {
      'click .js-help': function (e) {
        e.preventDefault();
        this.toggleLinks(e);
      },
      'click .js-forgot-password' : function (e) {
        e.preventDefault();
        var customResetPasswordPage = this.settings.get('helpLinks.forgotPassword');
        if (customResetPasswordPage) {
          Util.redirect(customResetPasswordPage);
        }
        else {
          this.options.appState.trigger('navigate', 'signin/forgot-password');
        }
      },
      'click .js-unlock' : function (e) {
        e.preventDefault();
        var customUnlockPage = this.settings.get('helpLinks.unlock');
        if (customUnlockPage) {
          Util.redirect(customUnlockPage);
        }
        else {
          this.options.appState.trigger('navigate', 'signin/unlock');
        }
      }
    }
  });

  return BaseLoginController.extend({
    className: 'primary-auth',
    View: PrimaryAuthForm,

    constructor: function (options) {
      var username;
      options.appState.unset('username');

      this.model = new PrimaryAuthModel({
        multiOptionalFactorEnroll: options.settings.get('features.multiOptionalFactorEnroll'),
        settings: options.settings,
        appState: options.appState
      }, { parse: true });

      BaseLoginController.apply(this, arguments);

      this.addListeners();

      // Add SocialAuth view only when the idps are configured. If configured, 'socialAuthPositionTop'
      // will determine the order in which the social auth and primary auth are shown on the screen.
      if (options.settings.get('socialAuthConfigured')) {
        this.add(SocialAuth, {prepend: options.settings.get('socialAuthPositionTop')});
      }
      this.add(new Footer(this.toJSON({appState: options.appState})));

      username = this.model.get('username');
      if (username) {
        this.options.appState.set('username', username);
      }
    },

    events: {
      'focusout input[name=username]': function () {
        this.options.appState.set('username', this.model.get('username'));
      }
    },

    // This model and the AppState both have a username property.
    // The controller updates the AppState's username when the user is
    // done editing (on blur) or deletes the username (see below).
    initialize: function () {
      this.listenTo(this.model, 'change:username', function (model, value) {
        if (!value) {
          // reset AppState to an undefined user.
          this.options.appState.set('username', '');
        }
      });
    }

  });

});
