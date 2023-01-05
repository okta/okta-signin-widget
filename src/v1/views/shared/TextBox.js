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

//note: not including Okta here and explicitly including jquery and Handlebars
//because we want to be explicit about which TextBox we are extending here
//and want to avoid the cirucular dependency that occurs if we
//include Okta
import { internal } from '@okta/courage';
import '@okta/qtip';
import BrowserFeatures from 'util/BrowserFeatures';
const { TextBox } = internal.views.forms.inputs;
export default TextBox.extend({
  postRender: function() {
    if (this.options.type === 'number') {
      const input = this.$('input');

      input.attr({
        pattern: '[0-9]*',
        inputmode: 'numeric',
      });
    }
    TextBox.prototype.postRender.apply(this, arguments);
  },
  // Override the focus() to ignore focus in IE. IE (8-11) has a known bug where
  // the placeholder text disappears when the input field is focused.
  focus: function() {
    if (BrowserFeatures.isIE()) {
      return;
    }
    return TextBox.prototype.focus.apply(this, arguments);
  },
});
