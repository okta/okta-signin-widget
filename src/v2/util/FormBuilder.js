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
import uiSchemaFactory from '../ion/uiSchemaFactory';

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
  case 'factorType':
    if (inputObj.options) {
      var options = inputObj.options;
      var factorOption = new FactorEnrollOptions({
        minimize: true,
        listTitle: loc('enroll.choices.description', 'login'),
        collection: new Collection(options),
      });
      inputComponents.push({
        component: factorOption
      });
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
      input.type = 'text';
      break;
    }
  });
};

const createInputOptions = function (remediation = {}) {
  const inputOptions = [];
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
          this.add(input.component);
        } else {
          this.addInput(input);
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
  var formInputsObject = _.pick(uiSchema, 'formInputs');
  _.each(formInputsObject.formInputs, _.bind(function (formInput) {
    addInputComponent(formInput, inputOptions, uiSchema);
  }, this));

  // form footer
  var formFooterObj = _.pick(uiSchema, 'formFooter');
  _.each(formFooterObj.formFooter, _.bind(function (formFooterItem) {
    // form submit button
    if (formFooterItem.type === 'submit') {
      formObj.save = formFooterItem.key ? loc(formFooterItem.key, 'login') : formFooterItem.label;
    }
  }, this));
  return Form.extend(formObj);
};

module.exports = {
  createInputOptions
};
