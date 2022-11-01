/*!
 * Copyright (c) 2018, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
import TypingDNA from '@okta/typingdna';
let tdna;
export default {
  track: function(selectorId) {
    try {
      tdna = new TypingDNA();
      tdna.addTarget(selectorId);
      tdna.start();
    } catch (e) {
      // Issues in typing should not stop Primary auth.
    }
  },
  getTypingPattern: function() {
    try {
      return tdna.getTypingPattern({
        type: 1,
      });
    } catch (e) {
      return null;
    }
  },
};
