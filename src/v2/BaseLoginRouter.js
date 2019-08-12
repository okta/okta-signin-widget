/*!
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint max-params: [2, 18], max-statements: [2, 21] */
// BaseLoginRouter contains the more complicated router logic - rendering/
// transition, etc. Most router changes should happen in LoginRouter (which is
// responsible for adding new routes)
import { _, $, Backbone, Router, loc } from 'okta';
import Settings from 'models/Settings';
import Animations from 'util/Animations';
import BrowserFeatures from 'util/BrowserFeatures';
import Bundles from 'util/Bundles';
import ColorsUtil from 'util/ColorsUtil';
import Enums from 'util/Enums';
import Errors from 'util/Errors';
import Logger from 'util/Logger';
import Util from 'util/Util';
import AuthContainer from 'views/shared/AuthContainer';
import Header from 'views/shared/Header';
import SecurityBeacon from 'views/shared/SecurityBeacon';
import actionsTransformer from './ion/actionsTransformer';
import responseTransformer from './ion/responseTransformer';
import uiSchemaTransformer from './ion/uiSchemaTransformer';
import AppState from './models/AppState';

function beaconIsAvailable (Beacon, settings) {
  if (!Beacon) {
    return false;
  }
  if (Beacon === SecurityBeacon) {
    return settings.get('features.securityImage');
  }
  return true;
}

function loadLanguage (appState, languageCode, i18n, assetBaseUrl, assetRewrite) {
  const timeout = setTimeout(function () {
    // Trigger a spinner if we're waiting on a request for a new language.
    appState.trigger('loading', true);
  }, 200);

  return Bundles.loadLanguage(languageCode, i18n, {
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

    this.listenTo(this.appState, 'change:remediationFailure', function (appState, err) {
      // Global error handling for CORS enabled errors
      if (err.xhr && BrowserFeatures.corsIsNotEnabled(err.xhr)) {
        this.settings.callGlobalError(new Errors.UnsupportedBrowserError(loc('error.enabled.cors')));
        return;
      }
      //set flashError
      this.appState.set('flashError', err);
      this.defaultAuth();
    });

    this.listenTo(this.appState, 'change:introspectSuccess', function (appState, trans) {
      //transfer introspectSuccess into remediationSuccess response
      this.appState.trigger('remediationSuccess', trans);
    });

    this.listenTo(this.appState, 'remediationSuccess', this.handleRemediationSuccess);

    this.listenTo(this.appState, 'navigate', function (url) {
      this.navigate(url, { trigger: true });
    });
  },

  handleRemediationSuccess: function (trans) {
    // transform response
    const ionResponse = _.compose(
      uiSchemaTransformer,
      actionsTransformer,
      responseTransformer
    )(trans);
    this.appState.setIonResponse(ionResponse);
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
    if (!Bundles.isLoaded(this.settings.get('languageCode'))) {
      return loadLanguage(
        this.appState,
        this.settings.get('languageCode'),
        this.settings.get('i18n'),
        this.settings.get('assets.baseUrl'),
        this.settings.get('assets.rewrite')
      )
        .then(_.bind(this.render, this, Controller, options))
        .done();
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
    this.controller
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

            oldController.remove();
            oldController.$el.remove();
            this.controller.postRenderAnimation();
            if (flashError) {
              this.appState.unset('flashError');
              Util.triggerAfterError(this.controller, flashError);
            }
          },
        });
      })
      .fail(function () {
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
      })
      .done();
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
    this.controller.remove();
    this.header.$el.remove();
    Bundles.remove();
    Backbone.history.stop();
  },
});
