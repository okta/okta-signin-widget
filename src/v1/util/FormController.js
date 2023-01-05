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

import { _, internal, Form, createButton } from '@okta/courage';
import BaseLoginModel from 'v1/models/BaseLoginModel';
import BaseLoginController from './BaseLoginController';
import FormType from './FormType';
let { Toolbar } = internal.views.forms.components;
let { FormUtil } = internal.views.forms.helpers;
const FormControllerSimpleForm = Form.extend({
  layout: 'o-form-theme',
  noCancelButton: true,
  constructor: function(options) {
    Form.call(this, options);
    _.each(
      _.result(this, 'formChildren') || [],
      function(child) {
        switch (child.type) {
        case FormType.INPUT:
          this.addInput(
            _.extend(
              {
                label: false,
                'label-top': true,
              },
              child.viewOptions
            )
          );
          break;
        case FormType.BUTTON:
          this.add(createButton(_.extend({ model: this.model }, child.viewOptions)), child.addOptions);
          FormUtil.applyShowWhen(this.last(), child.viewOptions && child.viewOptions.showWhen);
          break;
        case FormType.DIVIDER:
          this.addDivider(child.viewOptions);
          break;
        case FormType.TOOLBAR:
          this.add(Toolbar, { options: child.viewOptions });
          FormUtil.applyShowWhen(this.last(), child.viewOptions && child.viewOptions.showWhen);
          break;
        case FormType.VIEW:
          this.add(child.viewOptions.View, child.addOptions);
          FormUtil.applyShowWhen(this.last(), child.viewOptions.showWhen);
          break;
        default:
          throw new Error('Unrecognized child type: ' + child.type);
        }
      },
      this
    );
  },
});
export default BaseLoginController.extend({
  constructor: function() {
    const initialize = this.initialize;

    this.initialize = function() {};

    BaseLoginController.apply(this, arguments);

    if (this.Model && this.Form) {
      const Model = BaseLoginModel.extend(
        _.extend(
          {
            parse: function(attributes) {
              this.settings = attributes.settings;
              this.appState = attributes.appState;
              return _.omit(attributes, ['settings', 'appState']);
            },
          },
          _.result(this, 'Model')
        )
      );

      this.model = new Model(
        {
          settings: this.settings,
          appState: this.options.appState,
        },
        { parse: true }
      );
      const Form = FormControllerSimpleForm.extend(_.result(this, 'Form', this));

      this.form = new Form(this.toJSON());
      this.add(this.form);
    }

    if (this.Footer) {
      this.addFooter(this.Footer);
    }

    this.addListeners();
    initialize.apply(this, arguments);
  },

  addFooter: function(Footer, args) {
    this.footer = new Footer(_.extend(this.toJSON(), args || {}));
    this.add(this.footer);
  },

  toJSON: function() {
    const data = BaseLoginController.prototype.toJSON.apply(this, arguments);

    return _.extend(_.pick(this.options, 'appState'), data);
  },

  back: function() {
    if (this.footer && this.footer.back) {
      this.footer.back();
    }
  },
});
