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
  'util/FormController',
  'views/enroll-factors/Footer',
  'views/shared/TextBox'
],
function (Okta, FormController, Footer, TextBox) {

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
          var factor = _.findWhere(transaction.factors, {
            factorType: 'question',
            provider: 'OKTA'
          });
          return factor.enroll({
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
      title: _.partial(Okta.loc, 'enroll.securityQuestion.setup', 'login'),
      inputs: function () {
        return [
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
            input: TextBox,
            type: 'text',
            params: {
              innerTooltip: Okta.loc('mfa.challenge.answer.tooltip', 'login')
            }
          }
        ];
      }
    },

    Footer: Footer,

    fetchInitialData: function () {
      var self = this;
      return this.model.manageTransaction(function(transaction) {
        var factor = _.findWhere(transaction.factors, {
          factorType: 'question',
          provider: 'OKTA'
        });
        return factor.questions();
      })
      .then(function(questionsRes) {
        var questions = {};
        _.each(questionsRes, function (question) {
          var localizedQuestion = Okta.loc('security.' + question.question);
          questions[question.question] = localizedQuestion.indexOf('L10N_ERROR') < 0 ?
            localizedQuestion : question.questionText;
        });
        self.model.set('securityQuestions', questions);
      });
    }

  });

});
