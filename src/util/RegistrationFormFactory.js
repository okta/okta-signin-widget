/* eslint max-statements: [2, 20],  max-depth: [2, 3], complexity: [2, 9] */
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
  'shared/views/forms/helpers/SchemaFormFactory',
  'views/shared/TextBox'
], function (Okta, SchemaFormFactory, TextBox) {

  var _ = Okta._;

  var getParts = function(username) {
    var usernameArr = username.split('');
    var minPartsLength = 3;
    var userNameParts = [];
    var delimiters = [',', '.', '-', '_', '#', '@'];
    var userNamePart = '';

    _.each(usernameArr, function(part){
      if(delimiters.indexOf(part) == -1) {
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
  
  var checkSubSchema = function(subSchema, value, model) {
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

    var passwordContainsUserName = function(username, password){
      var usernameArr = getParts(username);
      //check if each username part contains password
      for (var i=0; i < usernameArr.length; i++){
        var usernamePart = usernameArr[i];
        if (password.indexOf(usernamePart) !== -1){
          return true;
        }
      }
    };
    
    if (_.isString(regex)) {
      if (regex === '^[#/userName]') {
        var username = model.get('userName').toLowerCase();

        var password = value.toLowerCase();
        if(username.length && password.length && passwordContainsUserName(username, password)) {
          return false;
        }
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

    subSchemas.each(function(subSchema, index) {
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

  var fnCreateInputOptions = function(schemaProperty) {
    var inputOptions = SchemaFormFactory.createInputOptions(schemaProperty);
    if (inputOptions.type === 'select') {
      inputOptions = _.extend(inputOptions, {
        label: schemaProperty.get('description')
      });
    } else {
      inputOptions = _.extend(inputOptions, {
        label: false,
        'label-top': true,
        placeholder: schemaProperty.get('description')
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
      inputOptions.input = TextBox;
      inputOptions.params = {
        'icon': 'remote-lock-16'
      };
    }

    var subSchemas = schemaProperty.get('subSchemas');
    if (subSchemas) {
      inputOptions.events = {
        'input': function () {
          checkSubSchemas(fieldName, this.model, subSchemas, true);
        },
        'focusout': function () {
          checkSubSchemas(fieldName, this.model, subSchemas, true);
        }
      };
    }
    
    return inputOptions;
  };

  return {
    createInputOptions : fnCreateInputOptions,
    getUsernameParts: getParts
  };
});