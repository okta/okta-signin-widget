/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
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
  'util/FormController',
  'views/enroll-factors/Footer',
  'views/ResendEmailView',
  'util/FormType',
], function (Okta, FormController, Footer, ResendEmailView, FormType) {

  var _ = Okta._;

  const Model = {
    props: {
      passCode: 'string',
    },

    resend: function () {
      this.trigger('form:clear-errors');
      return this.doTransaction(function (transaction) {
        // authn support multiple `resend` hence has to specify name.
        return transaction.resend('email');
      });
    },

    save: function () {
      this.trigger('save');
      const formData = this.toJSON();
      return this.doTransaction(function (transaction) {
        return transaction.activate(formData);
      });
    }
  };

  const Form = function () {
    return {
      title: _.partial(Okta.loc, 'email.enroll.title', 'login'),
      noButtonBar: false,
      autoSave: true,
      save: _.partial(Okta.loc, 'oform.verify', 'login'), // TODO: deprecated by mfa.challenge.verify
      formChildren: [
        // message
        FormType.View({
          View: Okta.View.extend({
            className: 'enroll-activate-email-content',
            attributes: {
              'data-se': 'enroll-activate-email-content',
            },

            // Why use `{{{` for the description?
            // - factorEmail is actually an HTML fragment which
            //   is created via another handlebar template and used for bold the email address.
            template: hbs('{{{i18n code="email.mfa.email.sent.description" bundle="login" arguments="factorEmail"}}}'),

            getTemplateData: function () {
              const factor = this.options.appState.get('factor');
              const factorEmailVal = factor && factor.profile ? factor.profile.email : '';
              const factorEmail = hbs('<span class="mask-email">{{email}}</span>')({email: factorEmailVal });
              return {
                factorEmail,
              };
            },

          })
        }),
        // send again callout message and link button
        FormType.View({
          View: ResendEmailView,
        }),
        // passcode input
        FormType.Input({
          label: Okta.loc('email.code.label', 'login'),
          'label-top': true,
          name: 'passCode',
          type: 'text',
          wide: true,
        }),
      ]
    };
  };

  return FormController.extend({

    className: 'enroll-activate-email',

    Model: Model,

    Form: Form,

    Footer: Footer,

  });

});
