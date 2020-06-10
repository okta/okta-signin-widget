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
import { View } from 'okta';

const BeaconView = View.extend({

  template: '\
    <div data-type="beacon-container" class="beacon-container">\
      <div class="beacon-blank auth-beacon">\
        <div class="beacon-blank js-blank-beacon-border auth-beacon-border"></div>\
      </div>\
      <div class="bg-helper auth-beacon auth-beacon-factor {{className}}" data-se="factor-beacon">\
        <div class="okta-sign-in-beacon-border auth-beacon-border"></div>\
      </div>\
    </div >\
    ',

  getTemplateData: function () {
    return { className: this.getBeaconClassName() || '' };
  },
  getBeaconClassName () {
    return 'undefined-user';
  }
});

module.exports = BeaconView;
