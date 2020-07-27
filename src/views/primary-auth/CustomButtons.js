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

import hbs from 'handlebars-inline-precompile';

define([
  'okta',
  'util/OAuth2Util'
], function (Okta, OAuth2Util) {

  var _ = Okta._,
      $ = Okta.$,
      SharedUtil = Okta.internal.util.Util;

  var dividerTpl = hbs(
    '<div class="auth-divider">\
      <span class="auth-divider-text">{{text}}</span>\
    </div>');
  var formTitleTpl = hbs(
    '<h2 data-se="o-form-head" class="okta-form-title o-form-head">{{title}}</h2>'
  );

  return Okta.View.extend({

    className: 'primary-auth-container',

    children: function () {
      var children = [],
          socialIdpButtons = this.settings.get('configuredSocialIdps'),
          pivButton = this.settings.get('piv'),
          customButtons = this.settings.get('customButtons'),
          divider = dividerTpl({text: Okta.loc('socialauth.divider.text', 'login')});

      if (this.settings.get('hasPivCard')) {
        children.push(this._createPivButton(pivButton));
      }

      _.each(socialIdpButtons, function (button) {
        children.push(this._createSocialIdpButton(button));
      }, this);

      _.each(customButtons, function (button) {
        children.push(this._createCustomButton(button));
      }, this);

      // If the social auth buttons have to be above the Okta form, the title moves from
      // primary auth form to the social auth (above the buttons) and the divider goes below
      // the buttons (in between social auth and primary auth). If social auth needs to go below
      // Okta form, just add the divider at the top of the social auth container. The title still
      // lives in primary auth form.
      if (this.settings.get('socialAuthPositionTop')) {
        children.unshift(formTitleTpl({title: Okta.loc('primaryauth.title', 'login')}));
        // Divider between Primary Auth and the Social Auth
        children.push(divider);
      } else {
        children.unshift(divider);
      }

      return children;
    },

    _createSocialIdpButton: function (options) {
      return Okta.createButton({
        attributes: {
          'data-se': options.dataAttr
        },
        className: options.className,
        title: function () {
          return options.text || Okta.loc(options.i18nKey);
        },
        click: function (e) {
          e.preventDefault();
          if (this.settings.get('oauth2Enabled')) {
            OAuth2Util.getTokens(this.settings, {idp: options.id}, this.options.currentController);
          } else {
            const baseUrl = this.settings.get('baseUrl');
            const params = $.param({
              fromURI: this.settings.get('relayState')
            });
            const targetUri = `${baseUrl}/sso/idps/${options.id}?${params}`;
            SharedUtil.redirect(targetUri);
          }
        }
      });
    },

    _createPivButton: function (options) {
      let className = options.className || '';
      return Okta.createButton({
        attributes: {
          'data-se': 'piv-card-button'
        },
        className: className  + ' piv-button',
        title: options.text || Okta.loc('piv.cac.card', 'login'),
        click:  function (e) {
          e.preventDefault();
          this.options.appState.trigger('navigate', 'signin/verify/piv');
        }
      });
    },

    _createCustomButton: function (options) {
      return Okta.createButton({
        attributes: {
          'data-se': options.dataAttr
        },
        className: options.className  + ' default-custom-button',
        title: options.title,
        click: options.click
      });
    }

  });

});
