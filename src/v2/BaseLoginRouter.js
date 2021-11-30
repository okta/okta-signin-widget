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
import BrowserFeatures from 'util/BrowserFeatures';
import ColorsUtil from 'util/ColorsUtil';
import Enums from 'util/Enums';
import Errors from 'util/Errors';
import Logger from 'util/Logger';
import LanguageUtil from 'util/LanguageUtil';
import AuthContainer from 'views/shared/AuthContainer';
import Header from 'views/shared/Header';
import AppState from './models/AppState';
import sessionStorageHelper from './client/sessionStorageHelper';
import {
  startLoginFlow,
  interactionCodeFlow,
  configIdxJsClient,
  handleConfiguredFlow
} from './client';

import transformIdxResponse from './ion/transformIdxResponse';
import { FORMS } from './ion/RemediationConstants';
import CookieUtil from 'util/CookieUtil';

export default Router.extend({
  Events: Backbone.Events,

  initialize: function(options) {
    // Create a default success and/or error handler if
    // one is not provided.
    if (!options.globalSuccessFn) {
      options.globalSuccessFn = function() { };
    }
    if (!options.globalErrorFn) {
      options.globalErrorFn = function(err) {
        Logger.error(err);
      };
    }

    this.settings = new Settings(_.omit(options, 'el', 'authClient', 'hooks'), { parse: true });
    this.settings.setAuthClient(options.authClient);

    if (!options.el) {
      this.settings.callGlobalError(new Errors.ConfigError(loc('error.required.el')));
    }

    $('body > div').on('click', function() {
      // OKTA-69769 Tooltip wont close on iPhone/iPad
      // Registering a click handler on the first div
      // allows a tap that falls outside the tooltip
      // to be registered as a tap by iOS
      // and then the open tooltip will lose focus and close.
    });

    this.hooks = options.hooks;
    this.appState = new AppState();

    const wrapper = new AuthContainer({ appState: this.appState });

    $(options.el).append(wrapper.render().$el);
    this.el = `#${Enums.WIDGET_CONTAINER_ID}`;
    this.header = new Header({
      el: this.el,
      appState: this.appState,
      settings: this.settings,
    });

    // Hide until unitial render
    this.hide();

    configIdxJsClient(this.appState);
    this.listenTo(this.appState, 'updateAppState', this.handleUpdateAppState);
    this.listenTo(this.appState, 'remediationError', this.handleIdxResponseFailure);
    this.listenTo(this.appState, 'restartLoginFlow', this.restartLoginFlow);
  },

  async handleUpdateAppState(idxResponse) {
    // Only update the cookie when the user has successfully authenticated themselves 
    // to avoid incorrect/unnecessary updates.
    if (this.hasAuthenticationSucceeded(idxResponse) 
      && this.settings.get('features.rememberMyUsernameOnOIE')) {
      this.updateIdentifierCookie(idxResponse);
    }    

    if (idxResponse.interactionCode) {
      // Although session.stateHandle isn't used by interation flow,
      // it's better to clean up at the end of the flow.
      sessionStorageHelper.removeStateHandle();
      // This is the end of the IDX flow, now entering OAuth
      return interactionCodeFlow(this.settings, idxResponse);
    }

    const lastResponse = this.appState.get('idx');

    // Do not save state handle for the first page loads.
    // Because there shall be no difference between following behavior
    // 1. bootstrap widget
    //    -> save state handle to session storage
    //    -> refresh page
    //    -> introspect using sessionStorage.stateHandle
    // 2. bootstrap widget
    //    -> do not save state handle to session storage
    //    -> refresh page
    //    -> introspect using options.stateHandle
    if (lastResponse) {
      sessionStorageHelper.setStateHandle(idxResponse?.context?.stateHandle);
    }
    // Login flows that mimic step up (moving forward in login pipeline) via internal api calls,
    // need to clear stored stateHandles.
    // This way the flow can maintain the latest state handle. For eg. Device probe calls
    if (this.appState.get('currentFormName') === FORMS.CANCEL_TRANSACTION) {
      sessionStorageHelper.removeStateHandle();
    }

    // transform response
    const ionResponse = transformIdxResponse(this.settings, idxResponse, lastResponse);

    await this.appState.setIonResponse(ionResponse, this.hooks);
  },

  handleIdxResponseFailure(error = {}) {
    // special case: `useInteractionCodeFlow` is true but the Org does not have OIE enabled
    // The response is not in IDX format. See playground/mocks/data/oauth2/error-feature-not-enabled.json
    if (error?.error === 'access_denied' && error.error_description) {
      // simulate an IDX error response
      const idxMessages = {
        messages: {
          type: 'array',
          value: [
            {
              message: error.error_description,
              i18n: {
                key: 'oie.feature.disabled'
              },
              class: 'ERROR'
            }
          ],
        },
      };

      // Format the error to resemble an IdX error
      error = Object.assign({
        details: {
          rawIdxState: idxMessages,
          context: idxMessages,
          neededToProceed: [],
        }
      }, error);
    }

    // loosely check whether is IDX error response
    // see idx for details: https://github.com/okta/okta-idx-js/blob/master/src/index.js
    if (error?.details?.rawIdxState) {
      // Populate generic error message if there isn't any.
      if (!error.details.rawIdxState.messages) {
        const idxMessage = {
          type: 'array',
          value: [
            {
              message: loc('oform.error.unexpected', 'login'),
              class: 'ERROR'
            }
          ]
        };
        // Format the error to resemble an IdX error
        error.details.rawIdxState.messages = idxMessage;
        error.details.context = { messages: idxMessage };
      }

      return this.handleUpdateAppState(error.details);
    }

    // If the error is a string, wrap it in an Error object
    if (typeof error === 'string') {
      error = new Error(error);
    }
    this.settings.callGlobalError(error);

    // -- TODO: OKTA-244631 How to surface up the CORS error in IDX?
    // -- The `err` object from idx.js doesn't have XHR object
    // Global error handling for CORS enabled errors
    // if (err.xhr && BrowserFeatures.corsIsNotEnabled(err.xhr)) {
    //   this.settings.callGlobalError(new Errors.UnsupportedBrowserError(loc('error.enabled.cors')));
    //   return;
    // }
  },

  /* eslint max-statements: [2, 22] */
  render: async function(Controller, options = {}) {
    // If url changes then widget assumes that user's intention was to initiate a new login flow,
    // so clear stored token to use the latest token.
    if (sessionStorageHelper.getLastInitiatedLoginUrl() !== window.location.href) {
      sessionStorageHelper.removeStateHandle();
    }
    // Since we have a wrapper view, render our wrapper and use its content
    // element as our new el.
    // Note: Render it here because we know dom is ready at this point
    if (!this.header.rendered()) {
      this.el = this.header.render().getContentEl();
    }

    // If we need to load a language (or apply custom i18n overrides), do
    // this now and re-run render after it's finished.
    if (!Bundles.isLoaded(this.settings.get('languageCode'))) {
      await LanguageUtil.loadLanguage(this.appState, this.settings);
    }

    // introspect stateToken when widget is bootstrap with state token
    // and remove it from `settings` afterwards as IDX response always has
    // state token (which will be set into AppState)
    if (this.settings.get('oieEnabled')) {
      try {
        let idxResp = await startLoginFlow(this.settings);
        if (this.settings.get('useInteractionCodeFlow')) {
          idxResp = await handleConfiguredFlow(idxResp, this.settings);
        }
        this.appState.trigger('updateAppState', idxResp);
      } catch (errorResp) {
        this.appState.trigger('remediationError', errorResp.error || errorResp);
      } finally {
        this.settings.unset('stateToken');
        this.settings.unset('proxyIdxResponse');
      }
    }

    // Load the custom colors only on the first render
    if (this.settings.get('colors.brand') && !ColorsUtil.isLoaded()) {
      const colors = {
        brand: this.settings.get('colors.brand'),
      };

      ColorsUtil.addStyle(colors);
    }

    // Show before initial render
    this.show();

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

  /**
    * When "Remember My Username" is enabled, we save the identifier in a cookie
    * so that the next time the user visits the SIW, the identifier field can be 
    * pre-filled with this value.
   */
  updateIdentifierCookie: function(idxResponse) {
    if (this.settings.get('features.rememberMe')) {
      // Update the cookie with the identifier
      const user = idxResponse?.context?.user;
      const { identifier } = user?.value || {};
      if (identifier) {
        CookieUtil.setUsernameCookie(identifier);
      }
    } else {
      // We remove the cookie explicitly if this feature is disabled.
      CookieUtil.removeUsernameCookie();
    }    
  },

  hasAuthenticationSucceeded(idxResponse) {
    // Check whether authentication has succeeded. This is done by checking the server response
    // and seeing if either the 'success' or 'successWithInteractionCode' objects are present.
    return idxResponse?.rawIdxState?.success || idxResponse?.rawIdxState?.successWithInteractionCode;
  },

  restartLoginFlow() {
    this.render(this.controller.constructor);
  },

  start: function() {
    const pushState = BrowserFeatures.supportsPushState();
    Router.prototype.start.call(this, { pushState: pushState });
  },

  hide: function() {
    this.header.$el.hide();
  },

  show: function() {
    this.header.$el.show();
  },

  remove: function() {
    this.unload();
    this.header.$el.remove();
    this.stopListening(this.appState);
    this.stopListening(this.settings);
    Bundles.remove();
    Backbone.history.stop();
  },
});
