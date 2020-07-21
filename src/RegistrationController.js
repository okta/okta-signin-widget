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
import hbs from 'handlebars-inline-precompile';

define([
  'okta',
  'q',
  'models/RegistrationSchema',
  'models/LoginModel',
  'util/BaseLoginController',
  'util/Enums',
  'util/RegistrationFormFactory',
  'views/registration/SubSchema',
  'util/Errors',
  'util/Util'
],
function (
  Okta,
  Q,
  RegistrationSchema,
  LoginModel,
  BaseLoginController,
  Enums,
  RegistrationFormFactory,
  SubSchema,
  Errors,
  Util
) {

  var { _, Backbone } = Okta;

  var Footer = Okta.View.extend({
    template: hbs('\
      <a href="#" class="link help" data-se="back-link">\
        {{i18n code="goback" bundle="login"}}\
      </a>\
    '),
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

  return BaseLoginController.extend({
    className: 'registration',
    initialize: function () {
      // setup schema
      var Schema = RegistrationSchema.extend({
        settings: this.options.settings,
        url: this.options.settings.get('baseUrl') + '/api/v1/registration/form'
      });
      var schema = new Schema();
      this.state.set('schema', schema);
    },
    getRegistrationApiUrl: function () {
      // default policyId
      var defaultPolicyId = this.settings.get('defaultPolicyId');
      // org policyId
      var orgPolicyId = this.options.settings.get('policyId');
      var apiUrl = defaultPolicyId ? this.getRegistrationPolicyApi(defaultPolicyId) :
        this.getRegistrationPolicyApi(orgPolicyId);
      return apiUrl;
    },
    getRegistrationPolicyApi: function (policyId) {
      return this.options.settings.get('baseUrl') + '/api/v1/registration/' + policyId;
    },
    doPostSubmit: function () {
      if (this.model.get('activationToken')) {
        // register via activation token
        var self = this;
        self.settings.callGlobalSuccess(Enums.REGISTRATION_COMPLETE, {
          activationToken: this.model.get('activationToken')
        });

        var loginModel = new LoginModel({
          settings: self.model.appState.settings
        });
        loginModel.loginWithActivationToken(this.model.get('activationToken'))
          .then(function (transaction) {
            self.model.trigger('setTransaction', transaction);
          });
      } else {
        // register via activation email
        this.model.appState.set('username', this.model.get('email'));
        this.model.appState.trigger('navigate', 'signin/register-complete');
      }
    },
    registerUser: function (postData) {
      var self = this;
      this.model.attributes = postData;
      // Model.save returns a jqXHR
      Backbone.Model.prototype.save.call(this.model).then(function () {
        var activationToken = self.model.get('activationToken');
        var postSubmitData = activationToken ? activationToken : self.model.get('email');
        self.settings.postSubmit(postSubmitData, function () {
          self.doPostSubmit();
        }, function (errors) {
          self.showErrors(errors);
        });
      }).fail(function (err) {
        var responseJSON = err.responseJSON;
        if (responseJSON && responseJSON.errorCauses.length) {
          var errMsg = responseJSON.errorCauses[0].errorSummary;
          Util.triggerAfterError(self, new Errors.RegistrationError(errMsg));
        }
      });
    },
    createRegistrationModel: function (modelProperties) {
      var self = this;
      var Model = Okta.Model.extend({
        url: self.getRegistrationApiUrl()+'/register',
        settings: this.settings,
        appState: this.options.appState,
        props: modelProperties,
        local: {
          activationToken: 'string'
        },
        toJSON: function () {
          var data = Okta.Model.prototype.toJSON.apply(this, arguments);
          return {
            userProfile: data,
            relayState: this.settings.get('relayState')
          };
        },
        parse: function (resp) {
          this.set('activationToken', resp.activationToken);
          delete resp.activationToken;
          return resp;
        },
        save: function () {
          this.settings.preSubmit(this.attributes, function (postData){
            self.registerUser(postData);
          }, function (errors) {
            self.showErrors(errors);
          });
        }
      });
      return new Model();
    },
    showErrors: function (error, hideRegisterButton) {
      //for parseSchema error hide form and show error at form level
      if(error.callback === 'parseSchema' && error.errorCauses) {
        error.errorSummary = _.clone(error.errorCauses[0].errorSummary);
        delete error.errorCauses;
      }
      //show error on form
      this.model.trigger('error', this.model, {
        responseJSON: error
      });

      //throw registration error
      var errMsg = error.callback ? error.callback + ':' + error.errorSummary : error.errorSummary;
      Util.triggerAfterError(this, new Errors.RegistrationError(errMsg));

      if (hideRegisterButton) {
        this.$el.find('.button-primary').hide();
      }
    },
    fetchInitialData: function () {
      var self = this;
      // register parse complete event listener
      self.state.get('schema').on('parseComplete', function (updatedSchema) {
        var modelProperties = updatedSchema.properties.createModelProperties();
        self.settings.set('defaultPolicyId', updatedSchema.properties.defaultPolicyId);

        // create model
        self.model = self.createRegistrationModel(modelProperties);
        // create form
        var Form = Okta.Form.extend({
          layout: 'o-form-theme',
          autoSave: true,
          noCancelButton: true,
          title: Okta.loc('registration.form.title', 'login'),
          save: Okta.loc('registration.form.submit', 'login')
        });
        var form = new Form(self.toJSON());
        // add form
        self.add(form);
        // add footer
        self.footer = new self.Footer(self.toJSON());
        self.add(self.footer);
        self.addListeners();
        if (updatedSchema.error) {
          self.showErrors(updatedSchema.error, true);
        } else {
          // add fields
          updatedSchema.properties.each(function (schemaProperty) {
            var inputOptions = RegistrationFormFactory.createInputOptions(schemaProperty);
            var subSchemas = schemaProperty.get('subSchemas');
            var name = schemaProperty.get('name');
            form.addInput(inputOptions);
            if (name === 'password' && subSchemas) {
              form.add(SubSchema.extend({id: 'subschemas-' + name, subSchemas: subSchemas}));
            }
          });
          var requiredFieldsLabel =  hbs('<span class="required-fields-label">{{label}}</span>')({
            label: Okta.loc('registration.required.fields.label', 'login')
          });
          form.add(requiredFieldsLabel);
        }
      });
      // fetch schema from API, returns a jqXHR. Wrap it in a Q
      return Q(this.state.get('schema').fetch());
    },
    Footer: Footer,
  });
});
