/*!
 * Copyright (c) 2019 Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { _, Controller } from 'okta';
import Q from 'q';
export default Controller.extend({
  // Override this method to delay switching to this screen until return
  // promise is resolved. This is useful for cases like enrolling a security
  // question, which requires an additional request to fetch the question
  // list.
  fetchInitialData: function () {
    return Q();
  },

  toJSON: function () {
    const data = Controller.prototype.toJSON.apply(this, arguments);

    return _.extend(_.pick(this.options, 'appState'), data);
  },

  postRenderAnimation: function () {
    // Event triggered after a page is rendered along with the classname to identify the page
    this.trigger('afterRender', { controller: this.className });
  },
});
