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
  'util/RegistrationFormFactory',
  'util/RouterUtil',
  'views/registration/SubSchema'
],
function (
  Okta,
  RegistrationSchema,
  BaseLoginController,
  Enums,
  RegistrationFormFactory,
  RouterUtil,
  SubSchema
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
      var clientId = this.options.settings.get('registration.clientId');
      var registrationApi = this.options.settings.get('baseUrl')+'/api/v1/registration/'+clientId;

      if (!clientId) {
        return false;
      }
      var Schema = RegistrationSchema.extend({
        url: registrationApi+'/form'
      });
      
      var schema = new Schema();

      var createRegistrationModel = _.bind(function(modelProperties){
        var Model = Okta.Model.extend({
          url: registrationApi+'/register',
          settings: this.settings,
          appState: this.options.appState,
          props: modelProperties,
          local: {
            activationToken: 'string'
          },
          toJSON: function() {
            var data = Okta.Model.prototype.toJSON.apply(this, arguments);
            return {userProfile: data};
          },
          parse: function(resp) {
            this.set('activationToken', resp.activationToken);
            delete resp.activationToken;
            return resp;
          }
        });
        return new Model();
      }, this);

      var postSchemaFetch = _.bind(function(){
        var properties = schema.properties;
        var modelProperties = properties.createModelProperties();

        this.model = createRegistrationModel(modelProperties);

        var form = new Form(this.toJSON());

        this.listenTo(form, 'saved', _.bind(function() {
          var activationToken = this.get('activationToken');
          if (activationToken) {
            var authClient = this.appState.settings.authClient;
            authClient.signIn({
              token: activationToken
            })
            .then(_.bind(function(transaction) {
              RouterUtil.routeAfterAuthStatusChange(this, null, transaction.data);
            }, this));
          } else {
            this.appState.set('username', this.get('userName'));
            this.appState.trigger('navigate', 'signin/register-complete');
          }
        }, this.model));

        properties.each(function(schemaProperty) {
          var inputOptions = RegistrationFormFactory.createInputOptions(schemaProperty);
          var subSchemas = schemaProperty.get('subSchemas');
          var name = schemaProperty.get('name');
          form.addInput(inputOptions);
          if (name === 'password' && subSchemas) {
            form.add(SubSchema.extend({id: 'subschemas-' + name, subSchemas: subSchemas}));
          }
        });
        this.add(form);
        this.footer = new this.Footer(this.toJSON());
        this.add(this.footer);
        this.addListeners();
      }, this);

      schema.fetch().then(function(){
        postSchemaFetch();
      });
    },
    Footer: Footer
  });
});