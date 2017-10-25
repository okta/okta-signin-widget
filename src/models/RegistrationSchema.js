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
  'shared/models/BaseSchema',
  'shared/models/SchemaProperty',
],
function (Okta, BaseSchema, SchemaProperty) {

  var _ = Okta._;

  var RegistrationSchemaPropertyCollection = SchemaProperty.Collection.extend({
    createModelProperties: function () {
      var modelProperties = SchemaProperty.Collection.prototype.createModelProperties.apply(this);
      _.each(modelProperties, function(modelProperty, name) {
        modelProperty.required = !!this.get(name).get('required');
      }, this);
      return modelProperties;
    }
  });

  return BaseSchema.Model.extend({
    expand: ['schema'],

    constructor: function () {
      this.properties = new RegistrationSchemaPropertyCollection();
      Okta.BaseModel.apply(this, arguments);
    },

    parse: function (resp) {

      var parseResponseData = _.bind(function (resp) {
        var requireFields = resp.schema.required;
        if (_.isArray(requireFields)) {
          _.each(requireFields, function(requireField) {
            var field = this.properties.get(requireField);
            if (field) {
              field.set('required', true);
            }
          }, this);
        }

        var fieldOrderIds = resp.schema.fieldOrder;
        if (_.isArray(fieldOrderIds)) {
          _.each(fieldOrderIds, function(fieldOrderId, sortOrder) {
            var field = this.properties.get(fieldOrderId);
            if (field) {
              field.set('sortOrder', sortOrder);
            }
          }, this);
          this.properties.comparator = 'sortOrder';
          this.properties.sort();
        }
        return resp;
      }, this);
      
      var preRender = this.preRender;
      var postSchemaFetch = this.postSchemaFetch;
      var properties = this.properties;
      var DEFAULT_CALLBACK_ERROR = 'We could not process your registration at this time. Please try again later';

      var processCallback = _.bind(function(resp, callback, args, error){
        resp.schema = resp.profileSchema;
        BaseSchema.Model.prototype.parse.apply(this, [resp]);
        resp = parseResponseData(resp);
        if (callback) {
          callback(args, error);
        }
      }, this);

      //check for preRender
      if (_.isFunction(preRender)) {
        //async callback
        preRender(resp, function(resp) {
          processCallback(resp, postSchemaFetch, properties);
        }, _.bind(function (error) {
          error = error || {'errorSummary': DEFAULT_CALLBACK_ERROR};
          error['callback'] = 'preRender';
          processCallback(resp, postSchemaFetch, properties, error);
        }, this));
      } else {
        //no callback
        processCallback(resp, postSchemaFetch, properties);
      }
    }
  });
});