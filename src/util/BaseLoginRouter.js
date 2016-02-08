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

/* jshint maxparams: 100 */
// BaseLoginRouter contains the more complicated router logic - rendering/
// transition, etc. Most router changes should happen in LoginRouter (which is
// responsible for adding new routes)
define([
  'okta',
  'backbone',
  'xdomain',
  'RefreshAuthStateController',
  'models/Settings',
  'views/shared/Header',
  'views/shared/SecurityBeacon',
  'models/AppState',
  './RouterUtil',
  './Animations',
  './BrowserFeatures',
  './Errors'
],
function (Okta, Backbone, xdomain, RefreshAuthStateController, Settings, Header,
          SecurityBeacon, AppState, RouterUtil, Animations,
          BrowserFeatures, Errors) {

  var _ = Okta._,
      $ = Okta.$;

  function isStateLessRouteHandler(router, fn) {
    return _.find(router.stateLessRouteHandlers, function (routeName) {
      return fn === router[routeName];
    });
  }

  function beaconIsAvailable(Beacon, settings) {
    if (!Beacon) {
      return false;
    }
    if (Beacon === SecurityBeacon) {
      return settings.get('features.securityImage');
    }
    return true;
  }

  return Okta.Router.extend({

    initialize: function (options) {
      var xdomainSlaves;

      this.settings = new Settings(_.omit(options, 'el', 'authClient'), { parse: true });
      this.settings.setAuthClient(options.authClient);

      if (!options.el) {
        this.settings.callGlobalError(new Errors.ConfigError(
          Okta.loc('error.required.el')
        ));
      }

      // Use xdomain for IE8 and IE9 cross origin requests
      // Note: xdomain only runs in a cross origin context, so it is safe to
      // always start it (even if, for example, we're using this code on the
      // okta login page)
      if (BrowserFeatures.corsIsLimited()) {
        // Notes:
        // 1. Must manually set $.support.cors here since this is called after
        //    jQuery has already determined cors support
        // 2. After updating OktaAuth to not use reqwest, we should also add:
        //    xhook.addWithCredentials = false
        $.support.cors = true;
        xdomainSlaves = {};
        xdomainSlaves[this.settings.get('baseUrl')] = '/cors/proxy';
        xdomain.slaves(xdomainSlaves);
      }

      $('body > div').on('click', function () {
        // OKTA-69769 Tooltip wont close on iPhone/iPad
        // Registering a click handler on the first div
        // allows a tap that falls outside the tooltip
        // to be registered as a tap by iOS
        // and then the open tooltip will lose focus and close.
      });

      Okta.$(options.el).append('<div id="okta-sign-in" class="auth-container main-container"></div>');
      this.el = '#okta-sign-in';

      this.appState = new AppState({
        baseUrl: this.settings.get('baseUrl'),
        settings: this.settings
      }, { parse: true });
      this.header = new Header({
        el: this.el,
        appState: this.appState,
        settings: this.settings
      });

      this.settings.getAuthClient().subscribe(
        _.partial(RouterUtil.routeAfterAuthStatusChange, this)
      );

      this.listenTo(this.appState, 'navigate', function (url) {
        this.navigate(url, { trigger: true });
      });
    },

    execute: function (cb, args) {

      // Recovery flow with a token passed through widget settings
      var recoveryToken = this.settings.get('recoveryToken');
      if (recoveryToken) {
        this.settings.unset('recoveryToken');
        this.navigate(RouterUtil.createRecoveryUrl(recoveryToken), { trigger: true });
        return;
      }

      // Refresh flow with a stateToken passed through widget settings
      var stateToken = this.settings.get('stateToken');
      if (stateToken) {
        this.settings.unset('stateToken');
        this.navigate(RouterUtil.createRefreshUrl(stateToken), { trigger: true });
        return;
      }

      // Normal flow - we've either navigated to a stateless page, or are
      // in the middle of an auth flow
      var lastResponse = this.settings.getAuthClient().getLastResponse();
      if (lastResponse || isStateLessRouteHandler(this, cb)) {
        cb.apply(this, args);
        return;
      }

      // StateToken cookie exists on page load, and we are on a stateful url
      if (this.settings.getAuthClient().authStateNeedsRefresh()) {
        this.navigate(RouterUtil.createRefreshUrl(), { trigger: true });
        return;
      }

      // We've hit a page that requires state, but have no stateToken - redirect
      // back to primary auth
      this.navigate('', { trigger: true });
    },

    // Overriding the default navigate method to allow the widget consumer
    // to "turn off" routing - if features.router is false, the browser
    // location bar will not update when the router navigates
    navigate: function (fragment, options) {
      if (this.settings.get('features.router')) {
        return Okta.Router.prototype.navigate.apply(this, arguments);
      }
      if (options && options.trigger) {
        return Backbone.history.loadUrl(fragment);
      }
    },

    render: function (Controller, options) {
      options || (options = {});

      var Beacon = options.Beacon;
      var controllerOptions = _.extend(
        { settings: this.settings, appState: this.appState },
        _.omit(options, 'Beacon')
      );

      // Since we have a wrapper view, render our wrapper and use its content
      // element as our new el.
      // Note: Render it here because we know dom is ready at this point
      if (!this.header.rendered()) {
        this.el = this.header.render().getContentEl();
      }

      var oldController = this.controller;
      this.controller = new Controller(controllerOptions);

      // First run fetchInitialData, in case the next controller needs data
      // before it's initial render. This will leave the current page in a
      // loading state.
      this.controller.fetchInitialData()
      .then(_.bind(function () {

        // Beacon transition occurs in parallel to page swap
        if (!beaconIsAvailable(Beacon, this.settings)) {
          Beacon = null;
        }
        this.header.setBeacon(Beacon, controllerOptions);

        this.controller.render();

        if (!oldController) {
          this.el.append(this.controller.el);
          return;
        }

        return Animations.swapPages({
          $parent: this.el,
          $oldRoot: oldController.$el,
          $newRoot: this.controller.$el,
          dir: oldController.state.get('navigateDir'),
          ctx: this,
          success: function () {
            var flashError = this.appState.get('flashError'),
                model = this.controller.model;
            oldController.remove();
            oldController.$el.remove();
            if (flashError) {
              model.trigger('error', model, {
                responseJSON: {
                  errorSummary: flashError
                }
              });
              this.appState.unset('flashError');
            }
          }
        });

      }, this))
      .fail(function () {
        // OKTA-69665 - if an error occurs in fetchInitialData, we're left in
        // a state with two active controllers. Therefore, we clean up the
        // old one. Note: This explicitly handles the invalid token case -
        // if we get some other type of error which doesn't force a redirect,
        // we will probably be left in a bad state. I.e. old controller is
        // dropped and new controller is not rendered.
        oldController.remove();
        oldController.$el.remove();
      })
      .done();

    },

    start: function () {
      var options = [];
      // Support for browser's back button.
      if (window.addEventListener) {
        window.addEventListener('popstate', _.bind(function(e) {
          if (this.controller.back) {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.controller.back();
          }
        }, this));
        options.push({pushState: true});
      }
      Okta.Router.prototype.start.apply(this, options);
    }

  });

});
