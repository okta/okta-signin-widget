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
import { loc } from 'okta';

const factorData = {
  'email': {
    label: loc('factor.email', 'login'),
    description: '',
    iconClassName: 'mfa-okta-email',
  },

  'password': {
    label: loc('factor.password', 'login'),
    description: '',
    iconClassName: 'mfa-okta-password',
  },
};

const getFactorData = function (factorName) {
  return factorData[factorName];
};

module.exports = {
  getFactorData,
};
