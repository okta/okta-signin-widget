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
  var socialAuthIdpLabels = {
    'facebook': Okta.loc('socialauth.facebook.label', 'login'),
    'google': Okta.loc('socialauth.google.label', 'login'),
    'linkedin': Okta.loc('socialauth.linkedin.label', 'login')
  };

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
        title: socialAuthIdpLabels[type],
        events: {
          'click': function (e) {
            e.preventDefault();
            OAuth2Util.getIdToken(this.settings, {idp: options.id});
          }
        }
      });
    }

  });

});
