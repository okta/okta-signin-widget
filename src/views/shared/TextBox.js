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
define([
  'jquery',
  'vendor/lib/handlebars-wrapper',
  'util/BrowserFeatures',
  'shared/views/forms/inputs/TextBox',
  'qtip'
],
function ($, Handlebars, BrowserFeatures, TextBox) {

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
      <input type="{{type}}" placeholder="{{placeholder}}" aria-label="{{placeholder}}"\
        name="{{name}}" id="{{inputId}}" value="{{value}}" autocomplete="off"/>\
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
            // Note: qTip2 has a known issue calculating the tooltip offset when:
            // 1. A container element has both:
            //    a) position: relative/absolute
            //    b) overlay: value other than 'visible'
            // 2. The page is scrolled
            //
            // We set position:relative and overlay:auto on the body element,
            // where both are required for:
            // - Positioning the footer correctly
            // - Displaying long pages in embedded browsers
            //
            // The original design called for a fixed position relative to the
            // tooltip icon - this has been switched to "relative to mouse, and
            // update position when mouse moves" because of this constraint.
            target: 'mouse',
            adjust: {
              method: 'flip',
              mouse: true,
              y: -5,
              x: 5
            },
            viewport: $('body')
          }
        });
      }
    },

    // Override the focus() to ignore focus in IE. IE (8-11) has a known bug where
    // the placeholder text disappears when the input field is focused.
    focus: function () {
      if (BrowserFeatures.isIE()) {
        return;
      }
      return TextBox.prototype.focus.apply(this, arguments);
    }

  });

});
