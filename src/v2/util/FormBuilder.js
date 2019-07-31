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
import { _, loc, Form } from 'okta';

const getSelectOptions = function () {
  /*switch (type) {
  case 'countryCode':
    return CountryUtil.getCountries();
  case 'questions':
    return securityQuestionData.getSecurityQuestions();
  }*/
};

const addInputObject = function (inputObj, inputOptions, uiSchema) {
  switch (inputObj.type) {
  case 'text':
    inputObj['label-top'] =  true;
    inputOptions.push(inputObj);
    break;
  case 'select':
    var selectOptions = getSelectOptions(inputObj.rel);
    inputOptions.push({
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

const createInputOptions = function (appState) {
  var inputOptions = [];
  var formSchema = appState.get('formSchema');
  var uiSchema = appState.get('uiSchema');
  var formSchemaInputMap = appState.get('formSchemaInputMap');
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
      // add inputs
      _.each(inputOptions, _.bind(function (input) {
        this.addInput(input);
      }, this));
      // TODO add form footer
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
      //schemaInput = getFormSchemaInputMap(formInput.rel);
      schemaInput = formSchemaInputMap[formInput.rel];
      if (schemaInput) {
        addInputObject(schemaInput, inputOptions, uiSchema);
      } else {
        addInputObject(formInput, inputOptions, uiSchema);
      }
    } else {
      // PROFILE_REQUIRED form where we are not looking for a specific input
      _.each(formSchema, _.bind(function (formInput) {
        if (formInput.visible !== false) {
          addInputObject(formInput, inputOptions, uiSchema);
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
