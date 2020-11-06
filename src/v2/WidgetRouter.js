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

import FormController from './controllers/FormController';
import BaseLoginRouter from './BaseLoginRouter';
import DeviceEnrollmentTerminalViewController from './controllers/DeviceEnrollmentTerminalViewController';

module.exports = BaseLoginRouter.extend({
  routes: {
    '': 'defaultAuth',
    'authenticators/ov-not-installed': 'deviceEnrollmentTerminalView',
    '*wildcard': 'defaultAuth',
  },

  defaultAuth: function () {
    this.render(FormController);
  },

  deviceEnrollmentTerminalView: function () {
    this.render(DeviceEnrollmentTerminalViewController, {
      terminalStateWithNoRemediation : true,
      deviceEnrollmentTerminalResponse: {
        stateHandle: this.settings.get('stateToken'),
        version: this.settings.get('apiVersion'),
        deviceEnrollment: {
          type: 'object',
          value: {
            name: this.settings.get('deviceEnrollment.name'),
            platform: this.settings.get('deviceEnrollment.platform'),
            signInUrl: this.settings.get('deviceEnrollment.signInUrl'),
            vendor: this.settings.get('deviceEnrollment.vendor'),
            enrollmentLink: this.settings.get('deviceEnrollment.enrollmentLink')
          }
        }
      }
    });
  },

});
