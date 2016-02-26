/*!
 * Okta Sign-In Widget SDK LEGAL NOTICES
 *
 * The Okta software accompanied by this notice is provided pursuant to the
 * following terms:
 *
 * Copyright © 2015, Okta, Inc. Licensed under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0. Unless required by applicable
 * law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * The Okta software accompanied by this notice has build dependencies on
 * certain third party software licensed under separate terms ("Third Party
 * Components").
 *
 * Okta makes the following disclaimers regarding the Third Party Components on
 * behalf of itself, the copyright holders, contributors, and licensors of such
 * Third Party Components:
 * TO THE FULLEST EXTENT PERMITTED UNDER APPLICABLE LAW, THE THIRD PARTY
 * COMPONENTS ARE PROVIDED BY THE COPYRIGHT HOLDERS, CONTRIBUTORS, LICENSORS,
 * AND OKTA "AS IS" AND ANY REPRESENTATIONS OR WARRANTIES OF ANY KIND, WHETHER
 * ORAL OR WRITTEN, WHETHER EXPRESS, IMPLIED, OR ARISING BY STATUTE, CUSTOM,
 * COURSE OF DEALING, OR TRADE USAGE, INCLUDING WITHOUT LIMITATION THE IMPLIED
 * WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
 * NON-INFRINGEMENT, ARE DISCLAIMED. IN NO EVENT WILL THE COPYRIGHT OWNER,
 * CONTRIBUTORS, LICENSORS, OR OKTA BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION), HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE THIRD
 * PARTY COMPONENTS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

//note: not including Okta here and explicitly including jquery and Handlebars
//because we want to be explicit about which TextBox we are extending here
//and want to avoid the cirucular dependency that occurs if we
//include Okta
define([
  'jquery',
  'vendor/lib/handlebars-wrapper',
  'shared/views/forms/inputs/TextBox',
  'qtip'
],
function ($, Handlebars, TextBox) {

  function hasTitleAndText(options) {
    var title = options.title,
        text = options.text;

    if (title && text && title !== text) {
      return true;
    }
    return false;
  }

  // options may be a string or an object.
  function createQtipContent(options) {
    if (hasTitleAndText(options)) {
      return options;
    }
    return {text: options.text || options};
  }

  return TextBox.extend({

    template: Handlebars.compile('\
      {{#if params}}\
        {{#if params.innerTooltip}}\
          <span class="input-tooltip icon form-help-16"></span>\
        {{/if}}\
        {{#if params.icon}}\
          <span class="icon input-icon {{params.icon}}"></span>\
        {{/if}}\
      {{/if}}\
      <input type="{{type}}" placeholder="{{placeholder}}" name="{{name}}" \
        id="{{inputId}}" value="{{value}}" autocomplete="off"/>\
    '),

    postRender: function () {
      var params = this.options.params,
          content;

      if (params && params.innerTooltip) {
        content = createQtipContent(params.innerTooltip);
        this.$('.input-tooltip').qtip({
          content: content,
          style: {classes: 'okta-sign-in-tooltip qtip-custom qtip-shadow'},
          position: {
            my: 'bottom left',
            at: 'top center',
            adjust: {
              method: 'flip'
            },
            viewport: $('body')
          },
          hide: {fixed: true},
          show: {delay: 0}
        });
      }
    }

  });

});
