/*!
 * Copyright (c) 2018-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { $ } from 'okta';
const fn = {};

// visible for testing
fn.lighten = function(hex, lum) {
  lum = lum || 0;
  hex = hex.substr(1);
  let newHex = '#';

  for (var i = 0; i < 3; i++) {
    let c = parseInt(hex.substr(i * 2, 2), 16);

    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
    newHex += ('00' + c).substr(c.length);
  }
  return newHex;
};

fn.addStyle = function($containerEl, colors) {
  const $primaryButton = $containerEl.find('.button-primary');
  $primaryButton
    .css('background', colors.brand)
    .on('mouseenter', function() {
      $(this).css('background', fn.lighten(colors.brand, 0.05));
    })
    .on('mouseleave', function() {
      $(this).css('background', colors.brand);
    });
};

export default fn;
