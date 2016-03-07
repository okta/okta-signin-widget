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

define([
  'okta',
  'util/Errors',
  'util/BrowserFeatures'
],
function (Okta, Errors, BrowserFeatures) {

  var supportedIdps = ['facebook', 'google', 'linkedin'],
      oauthRedirectTpl = Okta.tpl('{{origin}}');
  var _ = Okta._,
      ConfigError = Errors.ConfigError,
      UnsupportedBrowserError = Errors.UnsupportedBrowserError;

  return Okta.Model.extend({

    flat: true,
    authClient: undefined,

    local: {
      'baseUrl': ['string', true],
      'recoveryToken': ['string', false, undefined],
      'stateToken': ['string', false, undefined],
      'username' : ['string', false],

      // CALLBACKS
      'globalSuccessFn': 'function',
      'globalErrorFn': 'function',
      'processCreds': 'function',

      // IMAGES
      'logo': 'string',
      'helpSupportNumber': 'string',

      // FEATURES
      'features.router': ['boolean', true, false],
      'features.securityImage': ['boolean', true, false],
      'features.rememberMe': ['boolean', true, true],
      'features.smsRecovery': ['boolean', true, false],
      'features.windowsVerify': ['boolean', true, false],
      'features.selfServiceUnlock': ['boolean', true, false],
      'features.multiOptionalFactorEnroll': ['boolean', true, false],
      'features.preventBrowserFromSavingOktaPassword': ['boolean', true, true],
      // forces "remember device" instead of reading from the cookie.
      'features.forceRememberDevice': 'boolean',

      // OAUTH2
      'authScheme': ['string', false, 'OAUTH2'],
      'authParams.display': ['string', false],
      'authParams.responseMode': ['string', false],
      'authParams.responseType': ['string', false, 'id_token'],
      'authParams.scope': ['array', false],
      'clientId': 'string',
      'redirectUri': 'string',
      'idps': ['array', false, []],
      'idpDisplay': ['string', false, 'SECONDARY'], // PRIMARY | SECONDARY
      'oAuthTimeout': ['number', false],

      // HELP LINKS
      'helpLinks.help': 'string',
      'helpLinks.forgotPassword': 'string',
      'helpLinks.unlock': 'string',
      'helpLinks.custom': 'array'
    },

    derived: {
      // checks if authscheme is 'OAUTH2' and if responseType is 'id_token'
      oauth2Enabled: {
        deps: ['clientId', 'authScheme', 'authParams.responseType'],
        fn: function (clientId, authScheme, responseType) {
          var enabled = false;
          if (clientId) {
            enabled = (authScheme.toLowerCase() === 'oauth2') &&
                (responseType.toLowerCase() === 'id_token');
          }
          return enabled;
        },
        cache: true
      },
      // Redirect Uri to provide in the oauth API
      oauthRedirectUri: {
        deps: ['redirectUri'],
        fn: function (redirectUri) {
          if (redirectUri) {
            return redirectUri;
          }

          var origin = window.location.origin;
          // IE8
          if (!origin) {
            var href = window.location.href;
            var path = window.location.pathname;
            if (path !== '') {
              origin = href.substring(0, href.lastIndexOf(path));
            }
          }

          return oauthRedirectTpl({
            origin: origin
          });
        }
      },
      // filters the idps passed into the widget to include only the ones we support.
      configuredSocialIdps: {
        deps: ['idps'],
        fn: function (idps) {
          return _.filter(idps, function (idp) {
            return _.contains(supportedIdps, idp.type.toLowerCase());
          });
        },
        cache: true
      },
      // checks if there are any valid configured idps.
      socialAuthConfigured: {
        deps: ['configuredSocialIdps'],
        fn: function (idps) {
          return !_.isEmpty(idps);
        },
        cache: true
      },
      // social auth buttons order - 'above'/'below' the primary auth form (boolean)
      socialAuthPositionTop: {
        deps: ['socialAuthConfigured', 'idpDisplay'],
        fn: function (socialAuthConfigured, idpDisplay) {
          return !!(socialAuthConfigured && idpDisplay.toUpperCase() === 'PRIMARY');
        },
        cache: true
      }
    },

    initialize: function (options) {
      if (!options.baseUrl) {
        this.callGlobalError(new ConfigError(Okta.loc('error.required.baseUrl')));
      }
      else if (!options.globalSuccessFn) {
        this.callGlobalError(new ConfigError(Okta.loc('error.required.success')));
      }
      else if (BrowserFeatures.corsIsNotSupported()) {
        this.callGlobalError(new UnsupportedBrowserError(Okta.loc('error.unsupported.cors')));
      }
    },

    setAuthClient: function (authClient) {
      this.authClient = authClient;
    },

    getAuthClient: function () {
      return this.authClient;
    },

    set: function () {
      try {
        return Okta.Model.prototype.set.apply(this, arguments);
      }
      catch (e) {
        var message = e.message ? e.message : e;
        this.callGlobalError(new ConfigError(message));
      }
    },

    // Invokes the global success function. This should only be called on a
    // terminal part of the code (i.e. authStatus SUCCESS or after sending
    // a recovery email)
    callGlobalSuccess: function (status, data) {
      // Defer this to ensure that our functions have rendered completely
      // before invoking their function
      var res = _.extend(data, { status: status });
      _.defer(_.partial(this.get('globalSuccessFn'), res));
    },

    // Invokes the global error function. This should only be called on non
    // recoverable errors (i.e. configuration errors, browser unsupported
    // errors, etc)
    callGlobalError: function (err) {
      // Note: Must use "this.options.globalErrorFn" when they've passed invalid
      // arguments - globalErrorFn will not have been set yet
      var globalErrorFn = this.get('globalErrorFn') || this.options.globalErrorFn;
      if (globalErrorFn) {
        // Call their function immediately to ensure that they get a chance
        // to react before the error is thrown
        globalErrorFn(err);
      }
      throw err;
    }

  });

});
