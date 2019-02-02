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

define([
  'okta'
],
function (Okta) {
  var _ = Okta._;
  var { BaseSchema, SchemaProperty } = Okta.internal.models;

  var ProfileSchemaPropertyCollection = SchemaProperty.Collection.extend({
    createModelProperties: function () {
      var modelProperties = SchemaProperty.Collection.prototype.createModelProperties.apply(this);
      _.each(modelProperties, function (modelProperty, name) {
        this.get(name).attributes.title = this.get(name).get('label');
      }, this);
      return modelProperties;
    }
  });

  return BaseSchema.Model.extend({
    expand: ['schema'],
    constructor: function () {
      this.properties = new ProfileSchemaPropertyCollection();
      Okta.BaseModel.apply(this, arguments);
    }, 
    initialize: function () {      
      var profileAttributes = this.appState.get('profileSchemaAttributes');
      if (profileAttributes) {
        var userProfileSchema = {
          'properties': {}
        };
        for (var i = 0; i < profileAttributes.length; i++) {
          var profileAttributeObject = profileAttributes[i];
          userProfileSchema.properties[profileAttributeObject.name] = profileAttributeObject;
        }
        BaseSchema.Model.prototype.parse.apply(this, [{ 'schema': userProfileSchema }]);
      }
    }
  });
});