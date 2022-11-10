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
import { _, Backbone, Model, loc, Form, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import LoginModel from 'v1/models/LoginModel';
import RegistrationSchema from 'v1/models/RegistrationSchema';
import Q from 'q';
import BaseLoginController from 'v1/util/BaseLoginController';
import Enums from 'util/Enums';
import { RegistrationError } from 'util/Errors';
import RegistrationFormFactory from 'v1/util/RegistrationFormFactory';
import Util from 'util/Util';
import SubSchema from 'v1/views/registration/SubSchema';
const RegistrationControllerFooter = View.extend({
  template: hbs(
    '\
      <a href="#" class="link help" data-se="back-link">\
        {{i18n code="goback" bundle="login"}}\
      </a>\
    '
  ),
  className: 'auth-footer',
  events: {
    'click .help': function(e) {
      e.preventDefault();
      this.back();
    },
  },
  back: function() {
    this.state.set('navigateDir', Enums.DIRECTION_BACK);
    this.options.appState.trigger('navigate', '');
  },
});
export default BaseLoginController.extend({
  className: 'registration',
  initialize: function() {
    const RegistrationControllerSchema = RegistrationSchema.extend({
      settings: this.options.settings,
      url: this.options.settings.get('baseUrl') + '/api/v1/registration/form',
    });
    // setup schema

    const schema = new RegistrationControllerSchema();

    this.state.set('schema', schema);
  },
  getRegistrationApiUrl: function() {
    const defaultPolicyId = this.settings.get('defaultPolicyId');
    // default policyId

    const orgPolicyId = this.options.settings.get('policyId');
    // org policyId

    const apiUrl = defaultPolicyId
      ? this.getRegistrationPolicyApi(defaultPolicyId)
      : this.getRegistrationPolicyApi(orgPolicyId);

    return apiUrl;
  },
  getRegistrationPolicyApi: function(policyId) {
    return this.options.settings.get('baseUrl') + '/api/v1/registration/' + policyId;
  },
  doPostSubmit: function() {
    if (this.model.get('activationToken')) {
      const self = this;
      // register via activation token

      self.settings.callGlobalSuccess(Enums.REGISTRATION_COMPLETE, {
        activationToken: this.model.get('activationToken'),
      });

      const loginModel = new LoginModel({
        settings: self.model.appState.settings,
      });

      loginModel.loginWithActivationToken(this.model.get('activationToken')).then(function(transaction) {
        self.model.trigger('setTransaction', transaction);
      });
    } else {
      // register via activation email
      this.model.appState.set('username', this.model.get('email'));
      this.model.appState.trigger('navigate', 'signin/register-complete');
    }
  },
  registerUser: function(postData) {
    const self = this;

    Object.keys(postData).forEach((k) =>
      (_.isNull(postData[k]) || _.isUndefined(postData[k]) || postData[k] === '') && delete postData[k]);
    this.model.attributes = postData;
    // Model.save returns a jqXHR
    Backbone.Model.prototype.save
      .call(this.model)
      .then(function() {
        self.model.trigger('startSaving');
        const activationToken = self.model.get('activationToken');
        const postSubmitData = activationToken ? activationToken : self.model.get('email');

        self.settings.postRegistrationSubmit(
          postSubmitData,
          function() {
            self.doPostSubmit();
          },
          function(errors) {
            self.showErrors(errors);
          }
        );
      })
      .fail((err) => {
        const responseJSON = err.responseJSON;

        if (responseJSON && responseJSON.errorCauses.length) {
          const { errorCode, errorCauses } = responseJSON;
          const { errorSummary, reason, location } = errorCauses[0];

          const isNotUniqueValue =
            errorCode === 'E0000001' &&
            reason === 'UNIQUE_CONSTRAINT';

          if (isNotUniqueValue) {
            this.renderIsNotUniqueError(responseJSON);
          }

          this.renderLegacyLocationErrorIfNeeded(location, errorSummary);

          Util.triggerAfterError(
            this,
            new RegistrationError(errorSummary)
          );
        }
      });
  },

  renderIsNotUniqueError: function(error) {
    const { location } = error.errorCauses[0];
    const errorSummary = loc(
      'registration.error.userName.notUniqueWithinOrg',
      'login',
      [location]
    );
    // replace generic error message with more specific one
    // without using backbone events because there was a race condition
    // between clearing and triggering errors
    this.$el.find('.okta-form-infobox-error p').text(errorSummary);
  },

  renderLegacyLocationErrorIfNeeded: function(location, errorSummary) {
    // replace generic error message with errorSummary for v1 SIW
    // this makes sure that with legacy location that starts with `data.userProfile`
    // we still see the errorSummary in the error banner instead of only a generic error
    // See example in https://developer.okta.com/docs/reference/registration-hook/#sample-json-payload-of-request
    if (location && /^data\.userProfile.*/.test(location)) {
      this.$el.find('.okta-form-infobox-error p').text(errorSummary);
    }
  },

  createRegistrationModel: function(modelProperties) {
    const self = this;
    const RegistrationControllerModel = Model.extend({
      url: self.getRegistrationApiUrl() + '/register',
      settings: this.settings,
      appState: this.options.appState,
      props: modelProperties,
      local: {
        activationToken: 'string',
      },
      toJSON: function() {
        const data = Model.prototype.toJSON.apply(this, arguments);

        return {
          userProfile: data,
          relayState: this.settings.get('relayState'),
        };
      },
      parse: function(resp) {
        this.set('activationToken', resp.activationToken);
        delete resp.activationToken;
        return resp;
      },
      save: function() {
        this.settings.preRegistrationSubmit(
          this.attributes,
          function(postData) {
            self.registerUser(postData);
          },
          function(errors) {
            self.showErrors(errors);
          }
        );
      },
    });

    return new RegistrationControllerModel();
  },
  showErrors: function(error, hideRegisterButton) {
    //for parseSchema error hide form and show error at form level
    if (error.callback === 'parseRegistrationSchema' && error.errorCauses) {
      error.errorSummary = _.clone(error.errorCauses[0].errorSummary);
      delete error.errorCauses;
    }
    //show error on form
    this.model.trigger('error', this.model, {
      responseJSON: error,
    });

    //throw registration error
    const errMsg = error.callback ? error.callback + ':' + error.errorSummary : error.errorSummary;

    Util.triggerAfterError(this, new RegistrationError(errMsg));

    if (hideRegisterButton) {
      this.$el.find('.button-primary').hide();
    }
  },
  fetchInitialData: function() {
    const self = this;

    // register parse complete event listener
    self.state.get('schema').on('parseComplete', function(updatedSchema) {
      const modelProperties = updatedSchema.properties.createModelProperties();

      self.settings.set('defaultPolicyId', updatedSchema.properties.defaultPolicyId);

      // create model
      self.model = self.createRegistrationModel(modelProperties);
      // create form
      const RegistrationControllerForm = Form.extend({
        layout: 'o-form-theme',
        autoSave: true,
        noCancelButton: true,
        title: loc('registration.form.title', 'login'),
        save: loc('registration.form.submit', 'login'),
        modelEvents : { 'invalid' : 'modifyErrors' },
        hasSavingState: true,
        customSavingState: {
          start: 'startSaving',
          stop: 'stopSaving',
        },
        modifyErrors: function(model, errorResp) {
          // overwrite courage errorResp object to show custom error message
          for (let formFieldName in errorResp) {
            if (errorResp[formFieldName] === 'model.validation.field.string.minLength') {
              errorResp[formFieldName] = loc('registration.model.validation.field.string.too.short', 'login', 
                [model.props[formFieldName].minLength]
              );
            } else if (errorResp[formFieldName] === 'model.validation.field.string.maxLength') {
              errorResp[formFieldName] = loc('registration.model.validation.field.string.too.long', 'login', 
                [model.props[formFieldName].maxLength + 1]
              );
            }
          }
        },
      });
      const form = new RegistrationControllerForm(self.toJSON());

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
        updatedSchema.properties.each(function(schemaProperty) {
          const inputOptions = RegistrationFormFactory.createInputOptions(schemaProperty);
          const subSchemas = schemaProperty.get('subSchemas');
          const name = schemaProperty.get('name');

          form.addInput(inputOptions);
          if (name === 'password' && subSchemas) {
            form.add(SubSchema.extend({ id: 'subschemas-' + name, subSchemas: subSchemas }));
          }
        });
        const requiredFieldsLabel = hbs('<span class="required-fields-label">{{label}}</span>')({
          label: loc('registration.required.fields.label', 'login'),
        });

        form.add(requiredFieldsLabel);
      }
    });
    // fetch schema from API, returns a jqXHR. Wrap it in a Q
    return Q(this.state.get('schema').fetch());
  },
  Footer: RegistrationControllerFooter,
});
