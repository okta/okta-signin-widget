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

define(['okta', 'util/Animations'], function (Okta, Animations) {

  function removeBeacon (view) {
    view.currentBeacon.remove();
    view.currentBeacon = null;
  }

  function addBeacon (view, NextBeacon, selector, options) {
    view.add(NextBeacon, {
      selector: selector,
      options: options
    });
    view.currentBeacon = view.first();
  }

  function typeOfTransition (currentBeacon, NextBeacon, options) {
    if (!currentBeacon && !NextBeacon) {
      return 'none';
    }
    if (currentBeacon && currentBeacon.equals(NextBeacon, options)) {
      return 'same';
    }
    if (!currentBeacon && NextBeacon) {
      return 'add';
    }
    if (currentBeacon && !NextBeacon) {
      return 'remove';
    }
    if (currentBeacon instanceof NextBeacon) {
      return 'fade';
    }
    // If none of the above
    // then we are changing the type of beacon
    // ex. from SecurityBeacon to FactorBeacon
    return 'swap';
  }

  return Okta.View.extend({

    currentBeacon: null,

    template: '\
      <div class="okta-sign-in-header auth-header">\
        {{#if logo}}\
        <img src="{{logo}}" class="auth-org-logo"/>\
        {{/if}}\
        <div data-type="beacon-container" class="beacon-container"></div>\
      </div>\
      <div class="auth-content"><div class="auth-content-inner"></div></div>\
    ',

    // Attach a 'no-beacon' class if the security image feature
    // is not passed in to prevent the beacon from jumping.
    initialize: function (options) {
      if (!options.settings.get('features.securityImage')) {
        this.$el.addClass('no-beacon');
      }
    },

    /* eslint complexity: 0 */
    setBeacon: function (NextBeacon, options) {
      var selector = '[data-type="beacon-container"]',
          container = this.$(selector),
          transition = typeOfTransition(this.currentBeacon, NextBeacon, options),
          self = this;

      switch (transition) {
        case 'none':
          this.$el.addClass('no-beacon');
          return;
        case 'same':
          return;
        case 'add':
          this.$el.removeClass('no-beacon');
          addBeacon(this, NextBeacon, selector, options);
          return Animations.explode(container);
        case 'remove':
          this.$el.addClass('no-beacon');
          return Animations.implode(container)
          .then(function () {
            removeBeacon(self);
          });
        case 'fade':
          // Other transitions are performed on the beacon container,
          // but this transition is on the content inside the beacon.
          // For a SecurityBeacon the username change will update the
          // AppState and trigger an transition to a new Becon
          // Since there is no url change this method is not called.
          // For a FactorBeacon a page refresh has occurred
          // so we execute the beacon's own transition method.
          if (!this.currentBeacon.fadeOut) {
            throw new Error('The current beacon is missing the "fadeOut" method');
          }
          options.animate = true;
          return this.currentBeacon.fadeOut()
          .then(function () {
            removeBeacon(self);
            addBeacon(self, NextBeacon, selector, options);
          });
        case 'swap':
          return Animations.swapBeacons({
            $el: container,
            swap: function () {
              removeBeacon(self);
              addBeacon(self, NextBeacon, selector, options);
            }
          });
        default:
          throw new Error('the "' + transition + '" is not recognized');
      }
    },

    getTemplateData: function () {
      return this.settings.toJSON({ verbose: true });
    },

    getContentEl: function () {
      return this.$('.auth-content-inner');
    }

  });

});
