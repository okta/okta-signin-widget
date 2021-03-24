/*!
 * Copyright (c) 2020, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { createButton } from 'okta';
import FormController from './controllers/FormController';
import BaseLoginRouter from './BaseLoginRouter';
import { BaseView } from './view-builder/internals';

// shall extend from v2/BaseView
const PIVView = BaseView.extend({
  initialize () {
    this.add('Please insert your PIV / CAC card and select the user certificate.');
    this.add(createButton({
      className: 'button button-primary',
      title: 'Retry',
      href: 'test'
    }));
  }
});
// first of all in responseTransformer
// - if PIV idp in remediation, create ui remediation like `select-piv`
const PivFormController = FormController.extend({
  getPivIdp () {
    return this.options.appState
      .get('remediations')
      .filter(r => {
        return r.name === 'redirect-idp' && r.type === 'PIV';
      })[0];
  },
  postRender () {
    const pivIDP = this.getPivIdp();
    if (this.options.appState.get('currentFormName') === 'identify' && pivIDP) {
      this.formView = this.add(PIVView, {
        options: {
          currentViewState: pivIDP
        }
      }).last();
    } else {
      FormController.prototype.postRender.apply(this, arguments);
    }
  }

});

const RegController = FormController.extend({
  postRender () {
    if (this.options.appState.get('currentFormName') === 'identify'
      && this.options.appState.hasRemediationObject('select-enroll-profile')) {
      this.handleInvokeAction('select-enroll-profile');
    } else {
      FormController.prototype.postRender.apply(this, arguments);
    }
  }
});

module.exports = BaseLoginRouter.extend({
  routes: {
    '': 'defaultAuth',
    'signin/register': 'renderRegister',
    'signin/piv': 'renderPIV',
    '*wildcard': 'defaultAuth',
  },

  defaultAuth () {
    this.render(FormController);
  },

  renderPIV () {
    this.render(PivFormController);
  },

  renderRegister () {
    this.render(RegController);
  }

});
