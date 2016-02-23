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

define(['okta'], function (Okta) {

  // deviceName is escaped on BaseForm (see BaseForm's template)
  var titleTpl = Okta.Handlebars.compile('{{factorName}} ({{{deviceName}}})');

  return Okta.Form.extend({
    className: 'mfa-verify-push',
    autoSave: true,
    noCancelButton: true,
    save: Okta.loc('oktaverify.send', 'login'),
    scrollOnError: false,
    layout: 'o-form-theme',
    attributes: { 'data-se': 'factor-push' },
    events: {
      submit: 'submit'
    },

    initialize: function () {
      this.enabled = true;
      this.listenTo(this.options.appState, 'change:isMfaRejectedByUser',
        function (state, isMfaRejectedByUser) {
          this.setSubmitState(isMfaRejectedByUser);
          if (isMfaRejectedByUser) {
            this.showError(Okta.loc('oktaverify.rejected', 'login'));
          }
        }
      );
      this.listenTo(this.options.appState, 'change:isMfaTimeout',
        function (state, isMfaTimeout) {
          this.setSubmitState(isMfaTimeout);
          if (isMfaTimeout) {
            this.showError(Okta.loc('oktaverify.timeout', 'login'));
          }
        }
      );
      this.title = titleTpl({
        factorName: this.model.get('factorLabel'),
        deviceName: this.model.get('deviceName')
      });
    },
    setSubmitState: function (ableToSubmit) {
      var button = this.$el.find('.button');
      this.enabled = ableToSubmit;
      if (ableToSubmit) {
        button.removeClass('link-button-disabled');
        button.prop('value', Okta.loc('oktaverify.send', 'login'));
      } else {
        button.addClass('link-button-disabled');
        button.prop('value', Okta.loc('oktaverify.sent', 'login'));
      }
    },
    submit: function (e) {
      e.preventDefault();
      if (this.enabled) {
        this.setSubmitState(false);
        this.doSave();
      }
    },
    doSave: function () {
      this.clearErrors();
      if (this.model.isValid()) {
        this.listenToOnce(this.model, 'error', this.setSubmitState, true);
        this.trigger('save', this.model);
      }
    },
    showError: function (msg) {
      this.model.trigger('error', this.model, {responseJSON: {errorSummary: msg}});
    }
  });
});
