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
  'util/BaseLoginController',
  'util/FormType',
  'util/Enums',
  'shared/models/BaseSchema',
  'shared/views/forms/helpers/SchemaFormFactory'
],
function (Okta, BaseLoginController, FormType, Enums, BaseSchema, SchemaFormFactory) {

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
      var Schema = BaseSchema.Model.extend({
        url: 'api/v1/schema',
        expand: ['schema']
      });
      var schema = new Schema({
        schema: {
          'properties':{
            'firstname': {
              'type': 'string',
              'description': 'First name',
              'maxLength': 255
            },
            'lastname': {
              'type': 'string',
              'description': 'Last name',
              'maxLength': 255
            },
            'email': {
              'type': 'email',
              'description': 'Email'
            },
            'password': {
              'type': 'password',
              'description': 'Password'
            }
          }
        }
      }, {parse:true});

      var properties = schema.properties;
      // SchemaProperties.createModelProperties doesn't set the required attribute now
      // Hardcoded the `required` to `true` temporary.
      var modelProperties = properties.createModelProperties();
      _.map(modelProperties, function(modelProperty) {
        modelProperty.required = true;
      });

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
      
      var form = new Form(this.toJSON());
      properties.each(function(schemaProperty) {
        form.addInput(_.extend(SchemaFormFactory.createInputOptions(schemaProperty), {
          label: false,
          'label-top': true,
          placeholder: schemaProperty.get('description')
        }));
      });
      this.add(form);
      
      this.footer = new this.Footer(this.toJSON());
      this.add(this.footer);
      
      this.addListeners();
    },
    Footer: Footer
  });

});
