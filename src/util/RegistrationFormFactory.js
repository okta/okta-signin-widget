/* eslint max-statements: [2, 23],  max-depth: [2, 3], complexity: [2, 13] */
/*!
 * Copyright (c) 2017, Okta, Inc. and/or its affiliates. All rights reserved.
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
  'views/shared/TextBox'
], function (Okta, TextBox) {

  var _ = Okta._;
  var { SchemaFormFactory } = Okta.internal.views.forms.helpers;

  var getParts = function (username) {
    var usernameArr = username.split('');
    var minPartsLength = 3;
    var userNameParts = [];
    var delimiters = [',', '.', '-', '_', '#', '@'];
    var userNamePart = '';

    _.each(usernameArr, function (part){
      if(delimiters.indexOf(part) === -1) {
        userNamePart += part;
      } else{
        if (userNamePart.length >= minPartsLength) {
          userNameParts.push(_.clone(userNamePart));
        }
        userNamePart = '';
      }
    });
    if (userNamePart.length >= minPartsLength) {
      userNameParts.push(_.clone(userNamePart));
    }
    return userNameParts.filter(Boolean);
  };

  var passwordContainsFormField = function (formField, password) {
    if(!formField) {
      return false;
    }
    formField = formField.toLowerCase();
    password = password.toLowerCase();
    var formFieldArr = getParts(formField);
    //check if each formField part contains password
    for (var i=0; i < formFieldArr.length; i++){
      var formFieldPart = formFieldArr[i];
      if (password.indexOf(formFieldPart) !== -1) {
        return true;
      }
    }
    return false;
  };

  var checkSubSchema = function (subSchema, value, model) {
    var minLength = subSchema.get('minLength');
    var maxLength = subSchema.get('maxLength');
    var regex = subSchema.get('format');

    if (_.isNumber(minLength)) {
      if (value.length < minLength) {
        return false;
      }
    }

    if (_.isNumber(maxLength)) {
      if (value.length > maxLength) {
        return false;
      }
    }
    var password = value;
    if (_.isString(regex)) {
      // call passwordContainsFormField if regex is userName, firstName, lastName
      if (regex === '^[#/userName]' || regex === '^[#/firstName]' || regex === '^[#/lastName]') {
        var fieldName = regex.split('^[#/')[1].split(']')[0];
        var fieldValue = model.get(fieldName);
        if (fieldName === 'userName') {
          // with email as login enabled, we only have email populated
          // Therefore we fallback and run validation with email attribute.
          fieldValue = model.has('userName') ? model.get('userName') : model.get('email');
        }
        return !passwordContainsFormField(fieldValue, password);
      } else {
        if (!new RegExp(regex).test(value)) {
          return false;
        }
      }
    }

    return true;
  };


  var checkSubSchemas = function (fieldName, model, subSchemas, showError) {
    var value = model.get(fieldName);
    if (!_.isString(value)) {
      return;
    }

    subSchemas.each(function (subSchema, index) {
      var ele = Okta.$('#subschemas-' + fieldName + ' .subschema-' + index);
      //hide password complexity if no password
      if (value) {
        ele.children('p').removeClass('default-schema');
      } else {
        ele.children('p').addClass('default-schema');
      }
      ele.removeClass('subschema-satisfied subschema-unsatisfied subschema-error');
      if (checkSubSchema(subSchema, value, model)) {
        ele.addClass('subschema-satisfied');
        ele.find('p span').removeClass('error error-16-small');
        ele.find('p span').addClass('confirm-16');
      } else {
        if (showError) {
          ele.find('p span').removeClass('confirm-16');
          ele.find('p span').addClass('error error-16-small');
          ele.addClass('subschema-error subschema-unsatisfied');
        }
      }
    });
  };

  var fnCreateInputOptions = function (schemaProperty, settings) {
    var inputOptions = SchemaFormFactory.createInputOptions(schemaProperty);
		if (inputOptions.type === 'select') {
			inputOptions = _.extend(inputOptions, {
				label: schemaProperty.get('title'),
				'label-top': true,
			});
		} else {
			var placeholder = schemaProperty.get('title');
			if (schemaProperty.get('required')) {
				placeholder += ' *';
			}
			inputOptions = _.extend(inputOptions, {
				label: placeholder,
				'label-top': true,
				// placeholder: placeholder
			});
		}

    var fieldName = schemaProperty.get('name');
    switch (fieldName) {
    case 'userName':
      inputOptions.input = TextBox;
      inputOptions.params = {
        'icon': 'person-16-gray'
      };
      break;
    case 'password':
      inputOptions.type = 'password';
      if (
        settings.get("features.showPasswordToggleOnSignInPage")
      ) {
        inputOptions.params = {};
        inputOptions.params.showPasswordToggle = true;
      }
    }
    var subSchemas = schemaProperty.get('subSchemas');
    if (subSchemas) {
      inputOptions.events = {
        'input': function () {
          checkSubSchemas(fieldName, this.model, subSchemas, true);
        },
        'focusout': function () {
          checkSubSchemas(fieldName, this.model, subSchemas, true);
        },
        'change:userName': function () {
          checkSubSchemas(fieldName, this.model, subSchemas, true);
        },
        'change:firstName': function () {
          checkSubSchemas(fieldName, this.model, subSchemas, true);
        },
        'change:lastName': function () {
          checkSubSchemas(fieldName, this.model, subSchemas, true);
        },
        'change:email': function () {
          checkSubSchemas(fieldName, this.model, subSchemas, true);
        }
      };
    }

    return inputOptions;
  };

  return {
    createInputOptions : fnCreateInputOptions,
    getUsernameParts: getParts,
    passwordContainsFormField: passwordContainsFormField
  };
});
