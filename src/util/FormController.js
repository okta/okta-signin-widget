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
  './FormType',
  'shared/views/forms/components/Toolbar',
  'shared/views/forms/helpers/FormUtil',
  './BaseLoginController',
  'models/BaseLoginModel'
],
function (Okta, FormType, Toolbar, FormUtil, BaseLoginController, BaseLoginModel) {

  var _ = Okta._;

  var SimpleForm = Okta.Form.extend({
    layout: 'o-form-theme',
    noCancelButton: true,
    constructor: function (options) {
      Okta.Form.call(this, options);
      _.each(_.result(this, 'formChildren') || [], function (child) {
        switch (child.type) {
        case FormType.INPUT:
          this.addInput(_.extend({
            label: false,
            'label-top': true
          }, child.viewOptions));
          break;
        case FormType.BUTTON:
          this.add(Okta.createButton(_.extend({ model: this.model }, child.viewOptions)), child.addOptions);
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
          this.add(child.viewOptions.View);
          FormUtil.applyShowWhen(this.last(), child.viewOptions.showWhen);
          break;
        default:
          throw new Error('Unrecognized child type: ' + child.type);
        }
      }, this);
    }
  });

  return BaseLoginController.extend({

    constructor: function () {
      var initialize = this.initialize;
      this.initialize = function () {};

      BaseLoginController.apply(this, arguments);

      if (this.Model && this.Form) {
        var Model = BaseLoginModel.extend(_.extend({
          parse: function (attributes) {
            this.settings = attributes.settings;
            this.appState = attributes.appState;
            return _.omit(attributes, ['settings', 'appState']);
          }
        }, _.result(this, 'Model')));
        this.model = new Model({
          settings: this.settings,
          appState: this.options.appState
        }, { parse: true });
        var Form = SimpleForm.extend(_.result(this, 'Form', this));
        this.form = new Form(this.toJSON());
        this.add(this.form);
      }

      if (this.Footer) {
        this.footer = new this.Footer(this.toJSON());
        this.add(this.footer);
      }

      this.addListeners();
      initialize.apply(this, arguments);
    },

    toJSON: function () {
      var data = BaseLoginController.prototype.toJSON.apply(this, arguments);
      return _.extend(_.pick(this.options, 'appState'), data);
    },

    back: function () {
      if (this.footer && this.footer.back) {
        this.footer.back();
      }
    }
  });
});
