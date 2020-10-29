/*!
 * Copyright (c) 2020, Okta, Inc. and/or its affiliates. All rights reserved.
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
import Bundles from 'util/Bundles';
import ColorsUtil from 'util/ColorsUtil';
import Enums from 'util/Enums';
import Errors from 'util/Errors';
import Logger from 'util/Logger';
import LanguageUtil from 'util/LanguageUtil';
import AuthContainer from 'views/shared/AuthContainer';
import Header from 'views/shared/Header';
import AppState from './models/AppState';
import i18nTransformer from './ion/i18nTransformer';
import uiSchemaTransformer from './ion/uiSchemaTransformer';
import responseTransformer from './ion/responseTransformer';

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
      return LanguageUtil.loadLanguage(this.appState, this.settings)
        .done(() => {
          this.render(Controller, options);
        });
    }

    const deviceEnrollmentValue = this.settings.options.deviceEnrollment;
    const rawIdxStateForDeviceEnrollment = {
      stateHandle: 'dkKY',
      version: '1.0.0',
      expiresAt: '2020-06-14T22:15:50.000Z',
      intent: 'LOGIN',
      deviceEnrollment: {
        type: 'object',
        value: deviceEnrollmentValue
      }
    };

    this.handleIdxDeviceEnrollmentCase(rawIdxStateForDeviceEnrollment);

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

    // Bubble up all controller events
    this.listenTo(this.controller, 'all', this.trigger);

    this.controller.render();
  },

  handleIdxDeviceEnrollmentCase (rawIdxStateForDeviceEnrollment = {}) {
    // No API call, directly render device enrollment view
    this.handleIdxResponseSuccess({
      rawIdxState: rawIdxStateForDeviceEnrollment,
      context: rawIdxStateForDeviceEnrollment,
      neededToProceed: [],
    });
  },

  handleIdxResponseSuccess (idxResponse) {
    // transform response
    const ionResponse = _.compose(
      i18nTransformer,
      uiSchemaTransformer,
      responseTransformer.bind({}, this.settings),
    )(idxResponse);
    this.appState.setIonResponse(ionResponse);
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
