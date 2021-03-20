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

/* eslint max-params: [2, 16], max-statements: [2, 18] */
// BaseLoginRouter contains the more complicated router logic - rendering/
// transition, etc. Most router changes should happen in LoginRouter (which is
// responsible for adding new routes)
import { _, $, Backbone, Router, loc } from 'okta';
import AppState from 'models/AppState';
import Settings from 'models/Settings';
import Bundles from 'util/Bundles';
import Logger from 'util/Logger';
import AuthContainer from 'views/shared/AuthContainer';
import Header from 'views/shared/Header';
import SecurityBeacon from 'views/shared/SecurityBeacon';
import Animations from './Animations';
import BrowserFeatures from './BrowserFeatures';
import ColorsUtil from './ColorsUtil';
import Enums from './Enums';
import Errors from './Errors';
import RouterUtil from './RouterUtil';
import Util from './Util';

function isStateLessRouteHandler (router, fn) {
  return _.find(router.stateLessRouteHandlers, function (routeName) {
    return fn === router[routeName];
  });
}

function beaconIsAvailable (Beacon, settings) {
  if (!Beacon) {
    return false;
  }
  if (Beacon === SecurityBeacon) {
    return settings.get('features.securityImage');
  }
  return true;
}

/**
 * TODO: deprecated by `util/LanguageUtil.loadLanguage`
 */
function loadLanguage (appState, i18n, assetBaseUrl, assetRewrite) {
  const timeout = setTimeout(function () {
    // Trigger a spinner if we're waiting on a request for a new language.
    appState.trigger('loading', true);
  }, 200);

  return Bundles.loadLanguage(appState.get('languageCode'), i18n, {
    baseUrl: assetBaseUrl,
    rewrite: assetRewrite,
  }).then(function () {
    clearTimeout(timeout);
    appState.trigger('loading', false);
  });
}

export default Router.extend({
  Events: Backbone.Events,

  initialize: function (options) {
    // Create a default success and/or error handler if
    // one is not provided.
    if (!options.globalSuccessFn) {
      options.globalSuccessFn = function () {};
    }
    if (!options.globalErrorFn) {
      options.globalErrorFn = function (err) {
        Logger.error(err);
      };
    }

    this.settings = new Settings(_.omit(options, 'el', 'authClient'), { parse: true });
    this.settings.setAuthClient(options.authClient);

    if (!options.el) {
      this.settings.callGlobalError(new Errors.ConfigError(loc('error.required.el')));
    }

    $('body > div').on('click', function () {
      // OKTA-69769 Tooltip wont close on iPhone/iPad
      // Registering a click handler on the first div
      // allows a tap that falls outside the tooltip
      // to be registered as a tap by iOS
      // and then the open tooltip will lose focus and close.
    });

    this.appState = new AppState(
      {
        baseUrl: this.settings.get('baseUrl'),
        settings: this.settings,
      },
      { parse: true }
    );

    const wrapper = new AuthContainer({ appState: this.appState });

    $(options.el).append(wrapper.render().$el);
    this.el = `#${Enums.WIDGET_CONTAINER_ID}`;

    this.header = new Header({
      el: this.el,
      appState: this.appState,
      settings: this.settings,
    });

    this.listenTo(this.appState, 'change:transactionError', function (appState, err) {
      RouterUtil.routeAfterAuthStatusChangeError(this, err);
    });

    this.listenTo(this.appState, 'change:transaction', function (appState, trans) {
      RouterUtil.routeAfterAuthStatusChange(this, trans.data);
    });

    this.listenTo(this.appState, 'navigate', function (url) {
      this.navigate(url, { trigger: true });
    });
  },

  execute: function (cb, args) {
    const recoveryToken = this.settings.get('recoveryToken');
    // Recovery flow with a token passed through widget settings

    if (recoveryToken) {
      this.settings.unset('recoveryToken');
      this.navigate(RouterUtil.createRecoveryUrl(recoveryToken), { trigger: true });
      return;
    }

    // Refresh flow with a stateToken passed through widget settings
    const stateToken = this.settings.get('stateToken');

    if (stateToken) {
      this.settings.unset('stateToken');
      this.navigate(RouterUtil.createRefreshUrl(stateToken), { trigger: true });
      return;
    }

    // Normal flow - we've either navigated to a stateless page, or are
    // in the middle of an auth flow
    const trans = this.appState.get('transaction');

    if ((trans && trans.data) || isStateLessRouteHandler(this, cb)) {
      cb.apply(this, args);
      return;
    }

    // StateToken cookie exists on page load, and we are on a stateful url
    if (this.settings.getAuthClient().tx.exists()) {
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
      return Router.prototype.navigate.apply(this, arguments);
    }
    if (options && options.trigger) {
      return Backbone.history.loadUrl(fragment);
    }
  },

  render: function (Controller, options) {
    options || (options = {});

    let Beacon = options.Beacon;

    const controllerOptions = _.extend({ settings: this.settings, appState: this.appState }, _.omit(options, 'Beacon'));

    // Since we have a wrapper view, render our wrapper and use its content
    // element as our new el.
    // Note: Render it here because we know dom is ready at this point
    if (!this.header.rendered()) {
      this.el = this.header.render().getContentEl();
    }

    // If we need to load a language (or apply custom i18n overrides), do
    // this now and re-run render after it's finished.
    if (!Bundles.isLoaded(this.appState.get('languageCode'))) {
      return loadLanguage(
        this.appState,
        this.settings.get('i18n'),
        this.settings.get('assets.baseUrl'),
        this.settings.get('assets.rewrite')
      ).then(_.bind(this.render, this, Controller, options));
    }

    // Load the custom colors only on the first render
    if (this.settings.get('colors.brand') && !ColorsUtil.isLoaded()) {
      const colors = {
        brand: this.settings.get('colors.brand'),
      };

      ColorsUtil.addStyle(colors);
    }

    const oldController = this.controller;

    this.controller = new Controller(controllerOptions);

    // Bubble up all controller events
    this.listenTo(this.controller, 'all', this.trigger);

    // First run fetchInitialData, in case the next controller needs data
    // before it's initial render. This will leave the current page in a
    // loading state.
    return this.controller
      .fetchInitialData()
      .then(() => {
        // Beacon transition occurs in parallel to page swap
        if (!beaconIsAvailable(Beacon, this.settings)) {
          Beacon = null;
        }
        this.header.setBeacon(Beacon, controllerOptions);

        this.controller.render();

        if (!oldController) {
          this.el.append(this.controller.el);
          this.controller.postRenderAnimation();
          return;
        }

        return Animations.swapPages({
          $parent: this.el,
          $oldRoot: oldController.$el,
          $newRoot: this.controller.$el,
          dir: oldController.state.get('navigateDir'),
          ctx: this,
          success: function () {
            const flashError = this.appState.get('flashError');
            const model = this.controller.model;

            oldController.remove();
            oldController.$el.remove();
            this.controller.postRenderAnimation();
            if (flashError) {
              const errorKey = (this.settings.get('features.mfaOnlyFlow')) ?
                'error.mfa.only.expired.session' : 'error.expired.session';
              model.trigger('error', model, {
                responseJSON: {
                  errorSummary: loc(errorKey),
                },
              });
              this.appState.unset('flashError');
              Util.triggerAfterError(this.controller, flashError);
            }
          },
        });
      })
      .catch(function () {
        // OKTA-69665 - if an error occurs in fetchInitialData, we're left in
        // a state with two active controllers. Therefore, we clean up the
        // old one. Note: This explicitly handles the invalid token case -
        // if we get some other type of error which doesn't force a redirect,
        // we will probably be left in a bad state. I.e. old controller is
        // dropped and new controller is not rendered.
        if (oldController) {
          oldController.remove();
          oldController.$el.remove();
        }
      });
  },

  start: function () {
    let pushState = false;

    // Support for browser's back button.
    if (window.addEventListener && this.settings.get('features.router')) {
      window.addEventListener('popstate', e => {
        if (this.controller.back) {
          e.preventDefault();
          e.stopImmediatePropagation();
          this.controller.back();
        }
      });
      pushState = BrowserFeatures.supportsPushState();
    }
    Router.prototype.start.call(this, { pushState: pushState });
  },

  hide: function () {
    this.header.$el.hide();
  },

  show: function () {
    this.header.$el.show();
  },

  remove: function () {
    if (this.controller) {
      this.controller.remove();
    }

    this.header.$el.remove();
    Bundles.remove();
    Backbone.history.stop();
  },
});
