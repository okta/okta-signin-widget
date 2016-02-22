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
  'util/FormController',
  'views/enroll-factors/Footer'
],
function (Okta, FormController, Footer) {

  var _ = Okta._;

  return FormController.extend({
    className: 'enroll-question',
    Model: {
      props: {
        question: 'string',
        answer: ['string', true]
      },
      local: {
        securityQuestions: 'object'
      },
      save: function () {
        return this.doTransaction(function(transaction) {
          return transaction
          .getFactorByTypeAndProvider('question', 'OKTA')
          .enrollFactor({
            profile: {
              question: this.get('question'),
              answer: this.get('answer')
            }
          });
        });
      }
    },

    Form: {
      autoSave: true,
      title: Okta.loc('enroll.securityQuestion.setup', 'login'),
      inputs: [
        {
          label: false,
          'label-top': true,
          name: 'question',
          type: 'select',
          wide: true,
          options: function () {
            return this.model.get('securityQuestions');
          },
          params: {
            searchThreshold: 25
          }
        },
        {
          label: false,
          'label-top': true,
          placeholder: Okta.loc('mfa.challenge.answer.placeholder', 'login'),
          className: 'o-form-fieldset o-form-label-top auth-passcode',
          name: 'answer',
          type: 'text',
          params: {
            innerTooltip: Okta.loc('mfa.challenge.answer.tooltip', 'login')
          }
        }
      ]
    },

    Footer: Footer,

    fetchInitialData: function () {
      var self = this;
      return this.model.manageTransaction(function(transaction) {
        return transaction
        .getFactorByTypeAndProvider('question', 'OKTA')
        .getQuestions();
      })
      .then(function(questionsRes) {
        var questions = {};
        _.each(questionsRes, function (question) {
          questions[question.question] = question.questionText;
        });
        self.model.set('securityQuestions', questions);
      });
    }

  });

});
