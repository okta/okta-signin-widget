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
  'models/RegistrationSchema',
  'util/BaseLoginController',
  'util/Enums',
  'util/PasswordComplexityUtil',
  'util/RegistrationFormFactory',
  'views/registration/PasswordComplexity'
],
function (
  Okta,
  RegistrationSchema,
  BaseLoginController,
  Enums,
  PasswordComplexityUtil,
  RegistrationFormFactory,
  PasswordComplexity
) {

  var _ = Okta._;

  var Footer = Okta.View.extend({
    template: '\
      <a href="#" class="link help" data-se="back-link">\
        {{i18n code="goback" bundle="login"}}\
      </a>\
    ',
    className: 'auth-footer',
    events: {
      'click .help' : function (e) {
        e.preventDefault();
        this.back();
      }
    },
    back: function () {
      this.state.set('navigateDir', Enums.DIRECTION_BACK);
      this.options.appState.trigger('navigate', '');
    }
  });

  var Form = Okta.Form.extend({
    layout: 'o-form-theme',
    autoSave: true,
    noCancelButton: true,
    title: Okta.loc('registration.form.title', 'login'),
    save: Okta.loc('registration.form.submit', 'login')
  });

  return BaseLoginController.extend({
    className: 'registration',
    initialize: function() {
      var Schema = RegistrationSchema.Schema.extend({
        url: 'api/v1/schema'
      });
      var schema = new Schema({
        schema: {
          'properties': {
            'firstName': {
              'type': 'string',
              'description': 'First Name',
              'default': 'Enter your first name',
              'maxLength': 255
            },
            'lastName': {
              'type': 'string',
              'description': 'Last Name',
              'default': 'Enter your last name',
              'maxLength': 255
            },
            'login': {
              'type': 'string',
              'description': 'Email Address',
              'format' : 'email',
              'default': 'Enter your email',
              'maxLength': 255
            },
            'accountLevel': {
              'type': 'string',
              'description': 'Account Level',
              'enum': [ 'Free', 'Premium', 'Platinum' ]
            },
            'referrer': {
              'type': 'string',
              'description': 'How did you hear about us?',
              'maxLength': 1024
            },
            'password' : {
              'type' : 'string',
              'description' : 'Password'
            }
          },
          'required': ['firstName', 'lastName', 'login', 'password', 'accountLevel'],
          'fieldOrder': ['login', 'password', 'firstName', 'lastName', 'accountLevel', 'referrer']
        },
        'passwordComplexity': {
          'minLength': 8,
          'minLowerCase': 1,
          'minUpperCase': 1,
          'minNumber': 1,
          'minSymbol': 0,
          'excludeUsername': true
        }
      }, {parse:true});

      var properties = schema.properties;
      var modelProperties = properties.createModelProperties();

      var Model = Okta.Model.extend({
        settings: this.settings,
        appState: this.options.appState,
        props: modelProperties,
        save: function () {
          this.appState.set('username', this.get('email'));
          this.appState.trigger('navigate', 'signin/register-complete');
        }
      });
      this.model = new Model();

      var checkPasswordMeetComplexities = function(model) {
        var password = model.get('password') || '';
        _.each(schema.passwordComplexity.enabledComplexities, function(complexityName) {
          var ele = Okta.$('.password-complexity-' + complexityName);
          var complexityValue = this.get(complexityName);
          if (PasswordComplexityUtil.complexities[complexityName].doesComplexityMeet(complexityValue, password, model)){
            ele.addClass('password-complexity-meet');
          } else {
            ele.removeClass('password-complexity-meet');
          }
        }, schema.passwordComplexity);
      };

      var form = new Form(this.toJSON());
      properties.each(function(schemaProperty) {
        var inputOptions = RegistrationFormFactory.createInputOptions(schemaProperty);
        var name = schemaProperty.get('name');
        if (name === 'password' || name === 'login') {
          inputOptions.events = {
            'input': function() {
              checkPasswordMeetComplexities(this.model);
            }
          };
        }
        form.addInput(inputOptions);
      });
      form.add(PasswordComplexity.View.extend({passwordComplexity: schema.passwordComplexity}));
      this.add(form);
      this.footer = new this.Footer(this.toJSON());
      this.add(this.footer);

      this.addListeners();
    },
    Footer: Footer
  });

});
