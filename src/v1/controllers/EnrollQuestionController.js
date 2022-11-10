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

import { _, loc } from '@okta/courage';
import FactorUtil from 'util/FactorUtil';
import FormController from 'v1/util/FormController';
import Util from 'util/Util';
import Footer from 'v1/views/enroll-factors/Footer';
import TextBox from 'v1/views/shared/TextBox';
export default FormController.extend({
  className: 'enroll-question',
  Model: {
    props: {
      question: 'string',
      answer: ['string', true],
    },
    local: {
      securityQuestions: 'object',
    },
    save: function() {
      return this.doTransaction(function(transaction) {
        const factor = _.findWhere(transaction.factors, {
          factorType: 'question',
          provider: 'OKTA',
        });

        return factor.enroll({
          profile: {
            question: this.get('question'),
            answer: this.get('answer'),
          },
        });
      });
    },
  },

  Form: {
    autoSave: true,
    title: _.partial(loc, 'enroll.securityQuestion.setup', 'login'),
    inputs: function() {
      return [
        {
          label: false,
          'label-top': true,
          name: 'question',
          type: 'select',
          wide: true,
          options: function() {
            return this.model.get('securityQuestions');
          },
          params: {
            searchThreshold: 25,
          },
        },
        {
          label: loc('mfa.challenge.answer.placeholder', 'login'),
          'label-top': true,
          explain: Util.createInputExplain('mfa.challenge.answer.tooltip', 'mfa.challenge.answer.placeholder', 'login'),
          'explain-top': true,
          className: 'o-form-fieldset o-form-label-top auth-passcode',
          name: 'answer',
          input: TextBox,
          type: 'text',
        },
      ];
    },
  },

  Footer: Footer,

  fetchInitialData: function() {
    const self = this;

    return this.model
      .manageTransaction(function(transaction) {
        const factor = _.findWhere(transaction.factors, {
          factorType: 'question',
          provider: 'OKTA',
        });

        return factor.questions();
      })
      .then(function(questionsRes) {
        const questions = {};

        _.each(questionsRes, function(question) {
          questions[question.question] = FactorUtil.getSecurityQuestionLabel(question);
        });
        self.model.set('securityQuestions', questions);
      });
  },
});
