/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { _, loc } from '@okta/courage';
import FactorList from './FactorList';
export default FactorList.extend({
  listTitle: _.partial(loc, 'enroll.choices.list.setup', 'login'),

  className: function() {
    return FactorList.prototype.className + ' enroll-required-factor-list';
  },

  postRender: function() {
    let currentModel;
    let currentRow;

    FactorList.prototype.postRender.apply(this, arguments);
    currentModel = this.options.appState.get('factors').getFirstUnenrolledRequiredFactor();
    currentRow = this.find(function(view) {
      return view.model === currentModel;
    });
    currentRow.maximize();
  },
});
