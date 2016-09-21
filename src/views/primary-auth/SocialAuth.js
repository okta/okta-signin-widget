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

define([
  'okta',
  'util/OAuth2Util'
], function (Okta, OAuth2Util) {

  var _ = Okta._;

  var dividerTpl = Okta.tpl(
    '<div class="auth-divider">\
      <span class="auth-divider-text">{{text}}</span>\
    </div>');
  var formTitleTpl = Okta.tpl(
    '<h2 data-se="o-form-head" class="okta-form-title o-form-head">{{title}}</h2>'
  );

  return Okta.View.extend({

    className: 'social-auth',

    children: function () {
      var children = [],
          idProviders = this.settings.get('configuredSocialIdps'),
          divider = dividerTpl({text: Okta.loc('socialauth.divider.text', 'login')});

      // Social Auth IDPs.
      _.each(idProviders, function (provider) {
        children.push(this._createButton(provider));
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

    _createButton: function (options) {
      var type = options.type.toLowerCase(),
          attr = 'social-auth-' + type + '-button';

      return Okta.createButton({
        attributes: {
          'data-se': attr
        },
        className: 'social-auth-button ' + attr,
        title: Okta.loc('socialauth.' + type + '.label'),
        events: {
          'click': function (e) {
            e.preventDefault();
            OAuth2Util.getTokens(this.settings, {idp: options.id});
          }
        }
      });
    }

  });

});
