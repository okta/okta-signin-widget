/* eslint-disable complexity */
/*!
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
import { _, loc, Form, Collection, createButton } from 'okta';
import FactorEnrollOptions from '../components/FactorEnrollOptions';
import Link from '../components/Link';
import uiSchemaFactory from '../ion/uiSchemaFactory';
import FactorUtil from '../util/FactorUtil';

const getSelectOptions = function () {
  /*switch (type) {
  case 'countryCode':
    return CountryUtil.getCountries();
  case 'questions':
    return securityQuestionData.getSecurityQuestions();
  }*/
};
const createInputComponent = function (uiSchema, inputObj) {
  switch (inputObj.type) {
  case 'text':
  case 'password':
    return Object.assign(
      { 'label-top': true },
      inputObj,
    );
  case 'button':
    return createButton({
      title: loc(inputObj.key, 'login'),
      className: inputObj.className,
      click: function () {
        uiSchema.formButtonEventsHandler();
      },
    });
  case 'factorType':
    var optionItems = (inputObj.options || [])
      .map(opt => {
        return Object.assign({}, opt, FactorUtil.getFactorData(opt.value));
      });
    return {
      component: FactorEnrollOptions,
      options: {
        minimize: true,
        listTitle: loc('enroll.choices.description', 'login'),
        collection: new Collection(optionItems),
      }
    };
  case 'link':
    return {
      component: Link,
      options: _.omit(inputObj, 'type',)
    };
  case 'select':
    var selectOptions = getSelectOptions(inputObj.rel);
    return {
      name: inputObj.rel,
      type: 'select',
      wide: true,
      className: inputObj.className,
      options: selectOptions,
      events: {
        'select': function (e) {
          if (e && e.changed) {
            uiSchema.formSelectEventsHandler(e.changed);
          }
        },
      }
    };
  }
};

const augmentUISchema = function (formSchema, uiSchema) {
  // augment each item in uiSchem using formSchema
  _.each(uiSchema.formInputs, function (input, index) {
    delete input.rel;
    switch (input.type) {
    case 'factorType':
      _.extend(input, _.omit(formSchema[index], 'type'));
      //input.type = 'factorType';
      break;
    case 'formSchema':
      _.extend(input, formSchema[index]);
      if (input.secret === true) {
        input.type = 'password';
        input.params = {
          showPasswordToggle: true,
        };
      } else {
        input.type = 'text';
      }
      break;
    }
  });
};

const createForm = function (remediation = {}) {
  let inputOptions = [];
  const uiSchema = uiSchemaFactory.createUISchema(remediation.name);
  augmentUISchema(remediation.value, uiSchema);

  let formObj = {
    layout: 'o-form-theme',
    className: 'ion-form',
    hasSavingState: true,
    autoSave: false,
    noCancelButton: true,
    title: '',
    save: '',
    children: [],
    inputs: [],
    initialize: function () {
      // add input components
      _.each(inputOptions, _.bind(function (input) {
        if (input.component) {
          const componentOptions = _.extend(
            _.pick(this.options, 'appState'),
            input.options,
          );
          this.add(input.component, {
            options: componentOptions
          });
        } else {
          this.addInput(input);
        }
      }, this));
    },
    render () {
      Form.prototype.render.apply(this, arguments);
      if (Array.isArray(uiSchema.footer) && uiSchema.footer.length) {
        this.add('<div class="auth-footer"></div>', { prepend: false });
        // support custom help links on identify form
        let customHelpLink = '';
        if (this.options.settings.get('helpLinks.help') && this.model.get('formName') === 'identify') {
          customHelpLink = this.options.settings.get('helpLinks.help');
        }
        uiSchema.footer
          .map(createInputComponent.bind({}, uiSchema))
          .forEach(config => {
            if (config.component) {
              const componentOptions = Object.assign(
                _.pick(this.options, 'appState'),
                config.options,
              );
              if (customHelpLink && componentOptions.name === 'help') {
                componentOptions.href = customHelpLink;
                componentOptions.customLink = true;
              }
              this.add(config.component, {
                selector: '.auth-footer',
                options: componentOptions,
              });
            }
          });
      }
    }
  };

  // uiSchema has formHeader, formInputs and formFooter
  var formHeaderObj = _.pick(uiSchema, 'formHeader');
  _.each(formHeaderObj.formHeader, _.bind(function (formHeaderItem) {
    // form title
    if (formHeaderItem.type === 'formTitle') {
      formObj.title = loc(formHeaderItem.key, 'login');
    }
  }, this));

  // form inputs
  var formInputsObject = _.pick(uiSchema, 'formInputs');
  inputOptions = _.map(formInputsObject.formInputs, createInputComponent.bind({}, uiSchema));

  // form footer
  if (uiSchema.hasOwnProperty('formFooter')) {
    // FIXME: only last `submit` button will be add hence 'formFooter` as list doesn't make sense now.
    _.each(uiSchema.formFooter, _.bind(function (formFooterItem) {
      // form submit button
      if (formFooterItem.type === 'submit') {
        formObj.save = formFooterItem.key ? loc(formFooterItem.key, 'login') : formFooterItem.label;
      }
    }, this));
  } else {
    // Omit `formFooter` from uiSchema indicates hide the Form's toolbar.
    formObj.noButtonBar = true;
  }

  return Form.extend(formObj);
};

module.exports = {
  createForm
};
