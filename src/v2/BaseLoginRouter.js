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
/* global Promise */
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
import responseTransformer from './ion/responseTransformer';
import uiSchemaTransformer from './ion/uiSchemaTransformer';
import i18nTransformer from './ion/i18nTransformer';
import AppState from './models/AppState';
import idx from 'idx';
import { OKTA_STATE_TOKEN_KEY } from './view-builder/utils/Constants';

const setStateHandleInStorage = (stateToken) => {
  if(!sessionStorage.getItem(OKTA_STATE_TOKEN_KEY) && stateToken) {
    sessionStorage.setItem(OKTA_STATE_TOKEN_KEY, stateToken);
  }
};

const startLoginFlow = (settings) => {
  let stateHandle = sessionStorage.getItem(OKTA_STATE_TOKEN_KEY);
  const clientId = settings.get('clientId');
  const domain = settings.get('baseUrl');
  const scopes = settings.get('scopes');
  const redirectUri = settings.get('redirectUri');
  const version = settings.get('apiVersion');

  const interact = () => {
    const authClient = settings.getAuthClient();
    return authClient.token
      .prepareTokenParams()
      .then(({ codeVerifier, codeChallenge, codeChallengeMethod }) => {
        // set "codeVerifier" in settings for future access when interaction code is available
        settings.set('codeVerifier', codeVerifier);

        return idx.start({ 
          clientId, 
          issuer: domain + '/oauth2/default', 
          scopes, 
          stateHandle, 
          redirectUri, 
          version,
          codeVerifier,
          codeChallenge,
          codeChallengeMethod
        });
      });
  };

  const introspect = () => {
    return idx.start({ domain, stateHandle, version });
  };
  
  if (stateHandle) {
    return introspect();
  } else if (settings.get('useInteractionCodeFlow')) {
    return interact().then(idxResp => {
      setStateHandleInStorage(idxResp.rawIdxState.stateHandle);
      return idxResp;
    });
  } else {
    return Promise.reject(new Errors.ConfigError('Set "useInteractionCodeFlow" to true in configuration' + 
    'to enable the interaction_code" flow for self-hosted widget.'));
  }
};

const handleProxyIdxResponse = (settings) => {
  return Promise.resolve({
    rawIdxState: settings.get('proxyIdxResponse'),
    context: settings.get('proxyIdxResponse'),
    neededToProceed: [],
  });
};

export default Router.extend({
  Events: Backbone.Events,

  initialize: function (options) {
    setStateHandleInStorage(this.settings.get('stateToken'));
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

    this.listenTo(this.appState, 'remediationSuccess', this.handleIdxResponseSuccess);
    this.listenTo(this.appState, 'remediationError', this.handleIdxResponseFailure);
  },

  handleIdxResponseSuccess (idxResponse) {
    const { interactionCode } = idxResponse;
    if (interactionCode) {
      const authClient = this.settings.getAuthClient();
      const codeVerifier = this.settings.get('codeVerifier');
      this.settings.unset('codeVerifier');
      return authClient.token.exchangeCodeForTokens({ codeVerifier, interactionCode })
        .then(({ tokens }) => {
          this.settings.callGlobalSuccess(Enums.SUCCESS, { tokens });
        })
        .catch(err => {
          this.settings.callGlobalError(err);
        });
    }

    // transform response
    const ionResponse = _.compose(
      i18nTransformer,
      uiSchemaTransformer,
      responseTransformer.bind({}, this.settings),
    )(idxResponse);

    this.appState.setIonResponse(ionResponse);
  },

  handleIdxResponseFailure (error = {}) {
    // 1. loosely check whether is IDX error response
    // see idx for details: https://github.com/okta/okta-idx-js/blob/master/src/index.js
    if (error?.details) {
      // Populate generic error message if there isnt any.
      if (!error.details.messages ) {
        error.details.messages = {
          type: 'array',
          'value': [
            {
              message: loc('oform.error.unexpected', 'login'),
              class: 'ERROR'
            }
          ]
        };
      }
      // Need to mimic IdxRespones as idx returns raw response at error case
      this.handleIdxResponseSuccess({
        rawIdxState: error.details,
        context: _.pick(error.details, 'messages'),
        neededToProceed: [],
      });
    } else {
      // 2. otherwise, assume it's config error
      this.settings.callGlobalError(new Errors.ConfigError(
        error
      ));

      // -- TODO: OKTA-244631 How to suface up the CORS error in IDX?
      // -- The `err` object from idx.js doesn't have XHR object
      // Global error handling for CORS enabled errors
      // if (err.xhr && BrowserFeatures.corsIsNotEnabled(err.xhr)) {
      //   this.settings.callGlobalError(new Errors.UnsupportedBrowserError(loc('error.enabled.cors')));
      //   return;
      // }
    }
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

    // IDX response always has stateToken, that will be set to AppState
    const renderCallbackSuccess = (idxResp) => {
      this.unsetAttributes();
      this.appState.trigger('remediationSuccess', idxResp);
      this.render(Controller, options);
    };

    const renderCallbackError = (idxError) => {
      this.unsetAttributes();
      this.appState.trigger('remediationError', idxError.error);
      this.render(Controller, options);
    };

    // Start loginflow
    if (this.settings.get('oieEnabled')) {
      const idxRespPromise = this.settings.get('proxyIdxResponse') ?
        handleProxyIdxResponse(this.settings) : startLoginFlow(this.settings);
      return idxRespPromise
        .then(renderCallbackSuccess)
        .catch(errorResp => {
          // Try again with new stateToken if it's not a config error
          if(sessionStorage.getItem(OKTA_STATE_TOKEN_KEY) !== this.settings.get('stateToken')
              && errorResp.name !== 'CONFIG_ERROR') {
            setStateHandleInStorage(this.settings.get('stateToken'));
            startLoginFlow(this.settings).then(renderCallbackSuccess).catch(renderCallbackError);
          } else {
            renderCallbackError(errorResp);
          }
        });
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

    // Bubble up all controller events
    this.listenTo(this.controller, 'all', this.trigger);

    this.controller.render();
  },

  unsetAttributes () {
    this.settings.unset('stateToken');
    this.settings.unset('useInteractionCodeFlow');
    this.settings.unset('proxyIdxResponse');
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
