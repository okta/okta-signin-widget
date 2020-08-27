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
  'util/FormController',
  'util/FormType',
  'util/ValidationUtil',
  'util/FactorUtil',
  'util/Util',
  'views/shared/FooterWithBackLink',
  'views/shared/TextBox',
  'views/shared/PasswordRequirements'
],
function (Okta, FormController, FormType, ValidationUtil, FactorUtil, Util, FooterWithBackLink, TextBox,
  PasswordRequirements) {

  var _ = Okta._;

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

  var createSubSchemas = function(policy, profile) {
    var subSchemas = []
    if (policy.complexity.minLength) {
      subSchemas.push({
        "description": "At least " + policy.complexity.minLength + " character(s)",
        "minLength": policy.complexity.minLength
      });
    }
    if (policy.complexity.minNumber === 1) {
      subSchemas.push({
        "description": "At least 1 number(s)",
        "format": "[0-9]+"
      })
    }
    if (policy.complexity.minLowerCase === 1) {
      subSchemas.push({
        "description": "At least 1 lowercase letter(s)",
        "format": "[a-z]+"
      });
    }
    if (policy.complexity.minUpperCase === 1) {
      subSchemas.push({
        "description": "At least 1 uppercase letter(s)",
        "format": "[A-Z]+"
      });
    }
    if (policy.complexity.minSymbol === 1) {
      subSchemas.push({
        "description": "At least 1 symbol(s)",
        "format": "[-!#$%&’()*+,\-.\\\:;<=>?@\[\]^_`{|}~]+"
      });
    }
    if (policy.complexity.excludeUsername) {
      var attr = "login"
      var formFieldArr = getParts(profile[attr]);
      subSchemas.push({
        "description": "Does not contain part of username",
        "format": attr
      });
    }
    if (policy.complexity.excludeAttributes && policy.complexity.excludeAttributes.length > 0) {
      policy.complexity.excludeAttributes.map(function(attr, index) {
        var formFieldArr = getParts(profile[attr]);
        if (profile[attr]) {
          subSchemas.push({
            "description": "Does not contain part of '" + profile[attr] + "'",
            "format": attr
          })
        }
      });
    }
   return subSchemas;
  }

  var checkSubSchema = function (subSchema, value, profile) {
    var minLength = subSchema['minLength'];
    var maxLength = subSchema['maxLength'];
    var regex = subSchema['format'];

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
      if (regex === 'login' || regex === 'firstName' || regex === 'lastName') {
        var fieldName = regex;
        var fieldValue = profile[fieldName];
        return !passwordContainsFormField(fieldValue, password);
      } else {
        if (!new RegExp(regex).test(value)) {
          return false;
        }
      }
    }

    return true;
  };


  var checkSubSchemas = function (fieldName, model, subSchemas, showError, profile) {
    var value = model.get(fieldName);
    if (!_.isString(value)) {
      return;
    }

    subSchemas.map(function (subSchema, index) {
      var ele = Okta.$('#subschemas-' + fieldName + ' .subschema-' + index);
      //hide password complexity if no password
      if (value) {
        ele.children('p').removeClass('default-schema');
      } else {
        ele.children('p').addClass('default-schema');
      }
      ele.removeClass('subschema-satisfied subschema-unsatisfied subschema-error');
      if (checkSubSchema(subSchema, value, profile)) {
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

  return FormController.extend({
    className: 'password-reset',
    Model: function () {
      return {
        props: {
          newPassword: ['string', true],
          confirmPassword: ['string', !this.options.settings.get('features.hideConfirmPasswordOnResetPage') || false]
        },
        validate: function () {
          return (this.options.settings.get('features.hideConfirmPasswordOnResetPage') ? "" : ValidationUtil.validatePasswordMatch(this));
        },
        save: function () {
          this.trigger('save');
          var self = this;
          return this.doTransaction(function (transaction) {
            return transaction
              .resetPassword({
                newPassword: self.get('newPassword')
              });
          });
        }
      };
    },
    Form: {
      save: _.partial(Okta.loc, 'password.reset', 'login'),
      title: function () {
        return this.settings.get('brandName') ?
          Okta.loc('password.reset.title.specific', 'login', [this.settings.get('brandName')]) :
          Okta.loc('password.reset.title.generic', 'login');
      },
      subtitle: function () {
        var policy = this.options.appState.get('policy');
        if (!policy || this.settings.get('features.showPasswordRequirementsAsHtmlList') || this.settings.get('features.showPasswordSubschemaOnResetPage')) {
          return;
        }

        return FactorUtil.getPasswordComplexityDescription(policy);
      },
      parseErrorMessage: function (responseJSON) {
        var policy = this.options.appState.get('policy');
        if (!!policy && this.settings.get('features.showPasswordRequirementsAsHtmlList')) {
          /*
            - This is a specific case where don't want to repeat the requirements again in the error message, since this
              is already shown in the description. The description as bullet-points itself should give an indication
              of the requirements.
            - We cannot check for error code this in this case, as the error code is shared between
              requirements not met message, common password message, etc. So error summary is the only differentiating
              factor. Replace the password requirements string with empty string in this case.
          */
          responseJSON = FactorUtil.removeRequirementsFromError(responseJSON, policy);
        }
        return responseJSON;
      },
      formChildren: function () {
        var children = []
        var hideConfirmPasswordField = this.settings.get('features.hideConfirmPasswordOnResetPage') || false;
        if (this.settings.get('features.showPasswordRequirementsAsHtmlList') && !this.settings.get('features.showPasswordSubschemaOnResetPage')) {
          children.push(FormType.View({
            View: new PasswordRequirements({ policy: this.options.appState.get('policy') }),
          }));
        }
    
        if (!hideConfirmPasswordField) {
          children = children.concat([
            FormType.Input({
              className: 'margin-btm-5',
              label: Okta.loc('password.newPassword.placeholder', 'login'),
              'label-top': true,
              explain: Util.createInputExplain(
                'password.newPassword.tooltip',
                'password.newPassword.placeholder',
                'login'),
              'explain-top': true,
              name: 'newPassword',
              input: TextBox,
              type: 'password'
            }),
            FormType.Input({
              label: Okta.loc('password.confirmPassword.placeholder', 'login'),
              'label-top': true,
              explain: Util.createInputExplain(
                'password.confirmPassword.tooltip',
                'password.confirmPassword.placeholder',
                'login'),
              'explain-top': true,
              name: 'confirmPassword',
              input: TextBox,
              type: 'password'
            })
          ]);
        }
        else {
          var policy = this.options.appState.get('policy');
          var user = this.options.appState.get('user');
          var subSchemas = createSubSchemas(policy, user.profile)

          children.push(
            FormType.Input({
              className: 'margin-btm-5',
              label: Okta.loc('password.newPassword.placeholder', 'login'),
              'label-top': true,
              explain: Util.createInputExplain(
                'password.newPassword.tooltip',
                'password.newPassword.placeholder',
                'login'),
              'explain-top': true,
              name: 'newPassword',
              type: 'password',
              params: { showPasswordToggle: this.settings.get('features.showPasswordToggleOnResetPage') },
              events: {
                'input': function () {
                  checkSubSchemas('newPassword', this.model, subSchemas, true, user.profile);
                },
                'focusout': function () {
                  checkSubSchemas('newPassword', this.model, subSchemas, true, user.profile);
                }
              }
            })
          );
          if (this.settings.get('features.showPasswordSubschemaOnResetPage')) {
            
            children.push(
              FormType.View({
                View: Okta.View.extend({
                  className: 'subschema',
                  id: 'subschemas-newPassword',
                  subSchemas: subSchemas,
                  children: function () {
                    return this.subSchemas.map(function (subSchema, index) {
                      var description = subSchema['description'];
                      // TODO API should send translated strings instead of i18n code inside description
                      // or send param with i18n code
                      var message = description;
                      return Okta.View.extend({
                        index: index,
                        message: description,
                        class: function () {
                          return ;
                        },
                        className: function () {
                          return 'subschema-unsatisfied subschema-' + this.index;
                        },
                        template: '\
                          <p class="default-schema">\
                            <span class="icon icon-16"/>\
                            {{message}}\
                          </p>\
                        ',
                        getTemplateData: function () {
                          return {
                            message: this.message
                          };
                        }
                      })
                    })
                  }
                }),
              })
            );
          }
        }
        return children;
      }
    },

    initialize: function () {
      this.listenTo(this.form, 'save', function () {
        var creds = {
          username: this.options.appState.get('userEmail'),
          password: this.model.get('newPassword')
        };
        this.settings.processCreds(creds)
          .then(_.bind(this.model.save, this.model));
      });

      if (!this.settings.get('features.hideBackToSignInForReset')) {
        this.addFooter(FooterWithBackLink);
      }
    },
    events: {
      'click .button-show': function () {
        this.trigger('passwordRevealed');
      }
    }

  });

});
