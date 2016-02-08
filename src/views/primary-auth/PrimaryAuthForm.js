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
  'views/shared/TextBox',
  'views/shared/PasswordJammer'
], function (Okta, TextBox, PasswordJammer) {

  var _ = Okta._;

  return Okta.Form.extend({
    className: 'primary-auth-form',
    noCancelButton: true,
    save: Okta.loc('primaryauth.submit', 'login'),
    layout: 'o-form-theme',
    // If socialAuth is configured, the title moves from the form to
    // the top of the container (and is rendered in socialAuth).
    title: function () {
      var formTitle = Okta.loc('primaryauth.title', 'login');
      if (this.settings.get('socialAuthConfigured') &&
          this.settings.get('socialAuthPositionTop')) {
        formTitle = '';
      }
      return formTitle;
    },

    initialize: function () {
      this.listenTo(this, 'save', function () {
        var processCreds = this.settings.get('processCreds');
        if (_.isFunction(processCreds)) {
          processCreds({
            username: this.model.get('username'),
            password: this.model.get('password')
          });
        }
        this.model.save();
      });
      if (this.settings.get('features.preventBrowserFromSavingOktaPassword')) {
        this.add(PasswordJammer);
      }
    },

    inputs: function () {
      var inputs = [
        {
          label: false,
          'label-top': true,
          placeholder: Okta.loc('primaryauth.username.placeholder', 'login'),
          name: 'username',
          type: 'text',
          input: TextBox,
          params: {
            innerTooltip: {
              title: Okta.loc('primaryauth.username.placeholder', 'login'),
              text: Okta.loc('primaryauth.username.tooltip', 'login')
            },
            icon: 'person-16-gray'
          }
        },
        {
          label: false,
          'label-top': true,
          placeholder: Okta.loc('primaryauth.password.placeholder', 'login'),
          name: 'password',
          type: 'password',
          input: TextBox,
          params: {
            innerTooltip: {
              title: Okta.loc('primaryauth.password.placeholder', 'login'),
              text: Okta.loc('primaryauth.password.tooltip', 'login')
            },
            icon: 'remote-lock-16'
          }
        }
      ];
      if (this.settings.get('features.rememberMe')) {
        inputs.push({
          label: false,
          placeholder: Okta.loc('remember', 'login'),
          name: 'remember',
          type: 'checkbox',
          'label-top': true,
          className: 'margin-btm-0',
          initialize: function () {
            this.listenTo(this.model, 'change:username', this.render);
          }
        });
      }

      return inputs;
    },

    focus: function () {
      if (!this.model.get('username')) {
        this.getInputs().first().focus();
      } else {
        this.getInputs().toArray()[1].focus();
      }
    }

  });

});
