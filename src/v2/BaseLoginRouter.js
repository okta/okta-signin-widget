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

// BaseLoginRouter contains the more complicated router logic - rendering/
// transition, etc. Most router changes should happen in LoginRouter (which is
// responsible for adding new routes)
import { _, $, Backbone, Router, loc } from 'okta';
import Settings from 'models/Settings';
import BrowserFeatures from 'util/BrowserFeatures';
import Bundles from 'util/Bundles';
import ColorsUtil from 'util/ColorsUtil';
import Enums from 'util/Enums';
import Errors from 'util/Errors';
import Logger from 'util/Logger';
import AuthContainer from 'views/shared/AuthContainer';
import Header from 'views/shared/Header';
import responseTransformer from './ion/responseTransformer';
import uiSchemaTransformer from './ion/uiSchemaTransformer';
import uiSchemaLabelTransformer from './ion/uiSchemaLabelTransformer';
import AppState from './models/AppState';

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

    this.appState = new AppState();

    const wrapper = new AuthContainer({ appState: this.appState });

    $(options.el).append(wrapper.render().$el);
    this.el = `#${Enums.WIDGET_CONTAINER_ID}`;
    this.header = new Header({
      el: this.el,
      appState: this.appState,
      settings: this.settings,
    });

    // TODO: OKTA-244631 How to suface up the CORS error in IDX?
    // Since in new pipeline, it invokes introspect API first
    // hence no way to call GlobalError when CORS failure.
    this.listenTo(this.appState, 'change:introspectError', function (appState, err) {
      // Global error handling for CORS enabled errors
      if (err.xhr && BrowserFeatures.corsIsNotEnabled(err.xhr)) {
        this.settings.callGlobalError(new Errors.UnsupportedBrowserError(loc('error.enabled.cors')));
        return;
      }
      this.settings.callGlobalError(new Errors.ConfigError(
        err
      ));
      this.defaultAuth();
    });

    this.listenTo(this.appState, 'change:introspectSuccess', function (appState, idxResponse) {
      this.appState.trigger('remediationSuccess', idxResponse);
    });

    this.listenTo(this.appState, 'remediationSuccess', this.handleRemediationSuccess);

  },

  handleRemediationSuccess: function (idxResponse) {
    // transform response
    const ionResponse = _.compose(
      uiSchemaLabelTransformer,
      uiSchemaTransformer,
      responseTransformer.bind({}, this.settings),
    )(idxResponse);
    this.appState.setIonResponse(ionResponse);
  },

  render: function (Controller, options = {}) {

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
        .then(_.bind(this.render, this, Controller, options));
    }

    // Load the custom colors only on the first render
    if (this.settings.get('colors.brand') && !ColorsUtil.isLoaded()) {
      const colors = {
        brand: this.settings.get('colors.brand'),
      };

      ColorsUtil.addStyle(colors);
    }

    // render Controller
    this.unload();
    const controllerOptions = _.extend({
      el: this.el,
      settings: this.settings,
      appState: this.appState
    }, options);
    this.controller = new Controller(controllerOptions);
    this.controller.render();
  },

  hide: function () {
    this.header.$el.hide();
  },

  show: function () {
    this.header.$el.show();
  },

  remove: function () {
    this.unload();
    this.header.$el.remove();
    this.stopListening(this.appState);
    this.stopListening(this.settings);
    Bundles.remove();
    Backbone.history.stop();
  },
});
