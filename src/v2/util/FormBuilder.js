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

const getSelectOptions = function () {
  /*switch (type) {
  case 'countryCode':
    return CountryUtil.getCountries();
  case 'questions':
    return securityQuestionData.getSecurityQuestions();
  }*/
};
const addInputComponent = function (inputObj, inputComponents, uiSchema) {
  switch (inputObj.type) {
  case 'text':
    inputObj['label-top'] =  true;
    inputComponents.push(inputObj);
    break;

  case 'button':
    inputComponents.push(createButton({
      title: loc(inputObj.key, 'login'),
      className: inputObj.className,
      click: function () {
        uiSchema.formButtonEventsHandler();
      },
    }));
    break;
    //options to enroll factors
  case 'view':
    if (inputObj.component === 'FactorEnrollOptions') {
      // eslint-disable-next-line max-depth
      if (inputObj.options) {
        var options = inputObj.options;
        var factorOption = new FactorEnrollOptions({
          minimize: true,
          listTitle: loc('enroll.choices.description', 'login'),
          collection: new Collection(options),
        });
        inputComponents.push({
          type: 'view',
          component: factorOption
        });
      }
    }
    break;
  case 'select':
    var selectOptions = getSelectOptions(inputObj.rel);
    inputComponents.push({
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
    });
    break;
  }
};

const getFormSchemaInputMap = function (currentState, uiSchema) {
  if (currentState && currentState.remediation) {
    const formSchema = currentState.remediation[0].value;
    const formSchemaMap = {};
    _.each(uiSchema.formInputs, function (input, index) {
      const component = input.component;
      switch (input.type) {
      case 'view':
        formSchemaMap[input.rel] = {
          type: 'view',
          component: component
        };
        if (component === 'FactorEnrollOptions') {
          formSchemaMap[input.rel].options = formSchema[index].options;
        }
        break;
      case 'formSchema':
        //get inputObject from formSchem
        _.extend(input, formSchema[index]);
        // default to text input
        input.type = 'text';
        formSchemaMap[input.rel] = input;
        break;
      case 'button':
        formSchemaMap[input.rel] = input;
        break;
      }
    });
    return formSchemaMap;
  }
};
const createInputOptions = function (appState) {
  var inputOptions = [];
  var formSchema = appState.get('formSchema');
  var uiSchema = appState.get('uiSchema');
  var currentState = appState.get('currentState');
  var formSchemaInputMap = getFormSchemaInputMap(currentState, uiSchema);
  let formObj = {
    layout: 'o-form-theme',
    className: 'ion-form',
    autoSave: true,
    noCancelButton: true,
    title: '',
    save: '',
    children: [],
    inputs: [],
    events: {
      'click .button-primary': function (e) {
        e.preventDefault();
        this.options.appState.get('uiSchema').formSubmitEventsHandler(e);
      }
    },
    initialize: function () {
      // add input components
      _.each(inputOptions, _.bind(function (input) {
        switch (input.type) {
        case 'text':
          this.addInput(input);
          break;
        case 'view':
          this.add(input.component);
          break;
        default :
          this.add(input);
          break;
        }
      }, this));
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
  var formInputs = _.pick(uiSchema, 'formInputs');
  _.each(formInputs.formInputs, _.bind(function (formInput) {
    var schemaInput;
    if (formInput.rel) {
      schemaInput = formSchemaInputMap[formInput.rel];
      if (schemaInput) {
        addInputComponent(schemaInput, inputOptions, uiSchema);
      } else {
        addInputComponent(formInput, inputOptions, uiSchema);
      }
    } else {
      // PROFILE_REQUIRED form where we are not looking for a specific input
      _.each(formSchema, _.bind(function (formInput) {
        if (formInput.visible !== false) {
          addInputComponent(formInput, inputOptions, uiSchema);
        }
      }, this));
    }
  }, this));

  // form footer
  var formFooterObj = _.pick(uiSchema, 'formFooter');
  _.each(formFooterObj.formFooter, _.bind(function (formFooterItem) {
    // form submit button
    if (formFooterItem.type === 'submit') {
      formObj.save = loc(formFooterItem.key, 'login');
    }
  }, this));
  return Form.extend(formObj);
};

module.exports = {
  createInputOptions
};
