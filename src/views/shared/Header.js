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

    /* jshint maxcomplexity:false */
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
