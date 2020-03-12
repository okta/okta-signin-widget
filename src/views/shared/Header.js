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

import hbs from 'handlebars-inline-precompile';

define([
  'okta',
  'util/Animations',
  'views/shared/LoadingBeacon'
],
function (Okta, Animations, LoadingBeacon) {

  var NO_BEACON_CLS = 'no-beacon';
  var LOADING_BEACON_CLS = 'beacon-small beacon-loading';

  function isLoadingBeacon (beacon) {
    return beacon && beacon.equals(LoadingBeacon);
  }

  function removeBeacon (view) {
    // There are some timing issues with removing beacons (i.e. the case of
    // transitioning from loadingBeacon -> loadingBeacon)
    if (!view.currentBeacon) {
      return;
    }
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
    // Show Loading beacon
    if (!currentBeacon && options.loading) {
      return 'load';
    }
    // Swap/Hide Loading beacon
    if (currentBeacon && isLoadingBeacon(currentBeacon)) {
      return NextBeacon ? 'swap' : 'unload';
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

    template: hbs('\
      <div class="okta-sign-in-header auth-header">\
        {{#if logo}}\
        <img src="{{logo}}" class="auth-org-logo" alt="{{logoText}}"/>\
        {{/if}}\
        <div data-type="beacon-container" class="beacon-container"></div>\
      </div>\
      <div class="auth-content"><div class="auth-content-inner"></div></div>\
    '),

    // Attach a 'no-beacon' class if the security image feature
    // is not passed in to prevent the beacon from jumping.
    initialize: function (options) {
      if (!options.settings.get('features.securityImage')) {
        this.$el.addClass(NO_BEACON_CLS);
        // To show/hide the spinner when there is no security image,
        // listen to the appState's loading/removeLoading events.
        this.listenTo(options.appState, 'loading', this.setLoadingBeacon);
        this.listenTo(options.appState, 'removeLoading', this.removeLoadingBeacon);
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
        this.$el.addClass(NO_BEACON_CLS);
        return;
      case 'same':
        return;
      case 'add':
        this.$el.removeClass(NO_BEACON_CLS);
        addBeacon(this, NextBeacon, selector, options);
        return Animations.explode(container);
      case 'remove':
        this.$el.addClass(NO_BEACON_CLS);
        return Animations.implode(container)
          .then(function () {
            removeBeacon(self);
          })
          .done(); // TODO: can this be removed if Animations.implode returns standard ES6 Promise?
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
          })
          .done(); // TODO: can this be removed if fadeOut returns standard ES6 Promise?
      case 'swap':
        return Animations.swapBeacons({
          $el: container,
          swap: function () {
            var isLoading = isLoadingBeacon(self.currentBeacon);
            // Order of these calls is important for -
            // loader --> security/factor beacon swap.
            removeBeacon(self);
            if (isLoading) {
              container.removeClass(LOADING_BEACON_CLS);
              self.$el.removeClass(NO_BEACON_CLS);
            }
            addBeacon(self, NextBeacon, selector, options);
          }
        })
          .done(); // TODO: can this be removed if Animations.swapBeacons returns standard ES6 Promise?
      case 'load':
        // Show the loading beacon. Add a couple of classes
        // before triggering the add beacon code.
        container.addClass(LOADING_BEACON_CLS);
        addBeacon(self, NextBeacon, selector, options);
        return Animations.explode(container);
      case 'unload':
        // Hide the loading beacon.
        return this.removeLoadingBeacon();
      default:
        throw new Error('the "' + transition + '" is not recognized');
      }
    },

    // Show the loading beacon when the security image feature is not enabled.
    setLoadingBeacon: function (isLoading) {
      if (!isLoading || isLoadingBeacon(this.currentBeacon)) {
        return;
      }
      this.setBeacon(LoadingBeacon, { loading: true });
    },

    // Hide the beacon on primary auth failure. On primary auth success, setBeacon does this job.
    removeLoadingBeacon: function () {
      var self = this,
          container = this.$('[data-type="beacon-container"]');

      return Animations.implode(container)
        .then(function () {
          removeBeacon(self);
          container.removeClass(LOADING_BEACON_CLS);
        })
        .done(); // TODO: can this be removed if Animations.implode returns standard ES6 Promise?
    },

    getTemplateData: function () {
      return this.settings.toJSON({ verbose: true });
    },

    getContentEl: function () {
      return this.$('.auth-content-inner');
    }

  });

});
