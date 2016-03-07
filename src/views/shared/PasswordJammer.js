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

define(['okta'], function (Okta) {

  // To disable the various browsers' mechanisms for saving passwords, we do this:
  // 1) Safari requires an empty extra password field at the top, which is "visible"
  //    (we get around this by positioning it off-screen)
  // 2) Other browsers require an extra, bogus filled password element
  // Note: Firefox is not fooled by these techniques.
  // Note: Styles are inline to prevent ever showing these (i.e. even if stylesheet does not load)
  return Okta.View.extend({
    template: '\
      <input name="hidden-password-1" type="password" autocomplete="off"\
        style="position:absolute;top:-10000px"/>\
      <input name="hidden-password-2" type="password" autocomplete="off" \
        value="test" style="display:none"/>',
    className: 'password-jammer'
  });

});
