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

import { _, loc, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
import Footer from 'v1/views/enroll-factors/Footer';

const Model = {
  local: {
    factorType: 'string',
    provider: 'string',
  },
  save: function() {
    this.trigger('save');
    const factorOpt = this.pick('factorType', 'provider');
    return this.doTransaction(function(transaction) {
      const factor = _.findWhere(transaction.factors, factorOpt);

      return factor.enroll();
    });
  },
};

const Form = function() {
  return {
    title: _.partial(loc, 'email.enroll.title', 'login'),
    noButtonBar: false,
    autoSave: true,
    save: _.partial(loc, 'email.button.send', 'login'),
    formChildren: [
      FormType.View({
        View: View.extend({
          attributes: {
            'data-se': 'enroll-email-content',
          },
          template: hbs('{{i18n code="email.enroll.description" bundle="login"}}'),
        }),
      }),
    ],
  };
};

export default FormController.extend({
  className: 'enroll-email',

  Model: Model,

  Form: Form,

  Footer: Footer,

  initialize: function() {
    this.model.set(_.pick(this.options, 'factorType', 'provider'));
  },
});
