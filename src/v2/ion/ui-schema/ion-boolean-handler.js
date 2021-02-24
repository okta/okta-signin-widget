/*!
 * Copyright (c) 2020, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
import { FORMS } from '../RemediationConstants';

const getCheckboxUiSchema = ({ label, type, required }) => ({
  // For Remember Me checkbox, we need the label only on the right side of it.
  placeholder: label,
  label: false,
  // Separating prop type for Backbone.Model
  // from html input type
  modelType: type,
  // uiSchema type is the html input type desired.
  type: 'checkbox',
  required: required || false,
});

const createUiSchemaForBoolean = (ionFormField, remediationForm) => {
  if ([FORMS.CONSENT_ENDUSER, FORMS.CONSENT_ADMIN].includes(remediationForm.name)) {
    const scopes = remediationForm.scopes.map(({name, label, desc}) => {
      return {name, displayName: label, description: desc};
    });

    // setting 'type' here to add a specific View in FormInputFactory.create
    const type = remediationForm.name;

    return {type, scopes, options: ionFormField.options};
  } else {
    return getCheckboxUiSchema(ionFormField);
  }
};

export default createUiSchemaForBoolean;
