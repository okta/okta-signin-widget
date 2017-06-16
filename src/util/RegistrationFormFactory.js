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
  'shared/views/forms/helpers/SchemaFormFactory'
], function (Okta, SchemaFormFactory) {

  var _ = Okta._;

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

    if (schemaProperty.get('name') === 'password') {
      inputOptions.type = 'password';
    }
    return inputOptions;
  };

  return {
    createInputOptions : fnCreateInputOptions
  };
});
