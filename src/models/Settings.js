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
  'q',
  'util/Errors',
  'util/BrowserFeatures',
  'util/Util',
  'util/Logger',
  'config/config.json'
],
function (Okta, Q, Errors, BrowserFeatures, Util, Logger, config) {

  var SharedUtil = Okta.internal.util.Util;

  var DEFAULT_LANGUAGE = 'en';

  var supportedIdps = ['facebook', 'google', 'linkedin', 'microsoft'],
      supportedResponseTypes = ['token', 'id_token', 'code'],
      oauthRedirectTpl = Okta.tpl('{{origin}}');

  var _ = Okta._,
      ConfigError = Errors.ConfigError,
      UnsupportedBrowserError = Errors.UnsupportedBrowserError;

  var assetBaseUrlTpl = Okta.tpl(
    'https://ok1static.oktacdn.com/assets/js/sdk/okta-signin-widget/{{version}}'
  );

  return Okta.Model.extend({

    flat: true,
    authClient: undefined,

    local: {
      'baseUrl': ['string', true],
      'recoveryToken': ['string', false, undefined],
      'stateToken': ['string', false, undefined],
      'username' : ['string', false],
      'signOutLink': ['string', false],
      'relayState': ['string', false],

      // Function to transform the username before passing it to the API
      // for Primary Auth, Forgot Password and Unlock Account.
      'transformUsername' : ['function', false],

      // CALLBACKS
      'globalSuccessFn': 'function',
      'globalErrorFn': 'function',
      'processCreds': 'function',

      // IMAGES
      'logo': 'string',
      'logoText' : ['string', false],
      'helpSupportNumber': 'string',

      // FEATURES
      'features.router': ['boolean', true, false],
      'features.securityImage': ['boolean', true, false],
      'features.rememberMe': ['boolean', true, true],
      'features.autoPush': ['boolean', true, false],
      'features.smsRecovery': ['boolean', true, false],
      'features.callRecovery': ['boolean', true, false],
      'features.emailRecovery': ['boolean', false, true],
      'features.windowsVerify': ['boolean', true, false],
      'features.webauthn': ['boolean', true, false],
      'features.selfServiceUnlock': ['boolean', true, false],
      'features.multiOptionalFactorEnroll': ['boolean', true, false],
      'features.preventBrowserFromSavingOktaPassword': ['boolean', true, true],
      'features.deviceFingerprinting': ['boolean', false, false],
      'features.hideSignOutLinkInMFA' : ['boolean', false, false],
      'features.hideBackToSignInForReset' : ['boolean', false, false],
      'features.customExpiredPassword': ['boolean', true, false],
      'features.registration': ['boolean', false, false],
      'features.consent': ['boolean', false, false],
      'features.idpDiscovery': ['boolean', false, false],
      'features.passwordlessAuth': ['boolean', false, false],
      'features.showPasswordToggleOnSignInPage': ['boolean', false, false],
      'features.trackTypingPattern': ['boolean', false, false],
      'features.redirectByFormSubmit': ['boolean', false, false],
      'features.useDeviceFingerprintForSecurityImage': ['boolean', false, true],

      // I18N
      'language': ['any', false], // Can be a string or a function
      'i18n': ['object', false],

      // ASSETS
      'assets.baseUrl': ['string', false],
      'assets.rewrite': {
        type: 'function',
        value: _.identity
      },

      // OAUTH2
      'authScheme': ['string', false, 'OAUTH2'],
      'authParams.display': {
        type: 'string',
        values: ['none', 'popup', 'page']
      },

      // Note: It shouldn't be necessary to override/pass in this property -
      // it will be set correctly depending on what the value of display is
      // and whether we are using Okta or a social IDP.
      'authParams.responseMode': {
        type: 'string',
        values: ['query', 'fragment', 'form_post', 'okta_post_message']
      },

      // Can either be a string or an array, i.e.
      // - Single value: 'id_token', 'token', or 'code'
      // - Multiple values: ['id_token', 'token']
      'authParams.responseType': ['any', false, 'id_token'],
      'authParams.scopes': ['array', false],

      'authParams.issuer': ['string', false],
      'authParams.authorizeUrl': ['string', false],
      'authParams.state': ['string', false],
      'authParams.nonce': ['string', false],

      'policyId': 'string',
      'clientId': 'string',
      'redirectUri': 'string',
      'idps': ['array', false, []],
      'idpDisplay': {
        type: 'string',
        values: ['PRIMARY', 'SECONDARY'],
        value: 'SECONDARY'
      },
      'oAuthTimeout': ['number', false],

      // HELP LINKS
      'helpLinks.help': 'string',
      'helpLinks.forgotPassword': 'string',
      'helpLinks.unlock': 'string',
      'helpLinks.custom': 'array',

      //Custom Buttons
      'customButtons': ['array', false, []],

      //Registration
      'registration.click': 'function',
      'registration.parseSchema': 'function',
      'registration.preSubmit': 'function',
      'registration.postSubmit': 'function',

      //Consent
      'consent.cancel': 'function',

      //Colors
      'colors.brand': 'string'
    },

    derived: {
      redirectUtilFn: {
        deps: ['features.redirectByFormSubmit'],
        fn: function (redirectByFormSubmit) {
          return redirectByFormSubmit
            ? Util.redirectWithFormGet.bind(Util)
            : SharedUtil.redirect.bind(SharedUtil);
        },
        cache: true
      },
      supportedLanguages: {
        deps: ['i18n'],
        fn: function (i18n) {
          // Developers can pass in their own languages
          return _.union(config.supportedLanguages, _.keys(i18n));
        },
        cache: true
      },
      languageCode: {
        deps: ['language', 'supportedLanguages'],
        fn: function (language, supportedLanguages) {
          var userLanguages = BrowserFeatures.getUserLanguages(),
              preferred = _.clone(userLanguages),
              supportedLowerCase = Util.toLower(supportedLanguages),
              expanded;

          // Any developer defined "language" takes highest priority:
          // As a string, i.e. 'en', 'ja', 'zh-CN'
          if (_.isString(language)) {
            preferred.unshift(language);
          }
          // As a callback function, which is passed the list of supported
          // languages and detected user languages. This function must return
          // a languageCode, i.e. 'en', 'ja', 'zh-CN'
          else if (_.isFunction(language)) {
            preferred.unshift(language(supportedLanguages, userLanguages));
          }

          // Add english as the default, and expand to include any language
          // codes that do not include region, dialect, etc.
          preferred.push(DEFAULT_LANGUAGE);
          expanded = Util.toLower(Util.expandLanguages(preferred));

          // Perform a case insensitive search - this is necessary in the case
          // of browsers like Safari
          var i, supportedPos;
          for (i = 0; i < expanded.length; i++) {
            supportedPos = supportedLowerCase.indexOf(expanded[i]);
            if (supportedPos > -1) {
              return supportedLanguages[supportedPos];
            }
          }
        }
      },
      oauth2Enabled: {
        deps: ['clientId', 'authScheme', 'authParams.responseType'],
        fn: function (clientId, authScheme, responseType) {
          if (!clientId) {
            return false;
          }
          if (authScheme.toLowerCase() !== 'oauth2') {
            return false;
          }
          var responseTypes = _.isArray(responseType) ? responseType : [responseType];
          return _.intersection(responseTypes, supportedResponseTypes).length > 0;
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
      // Adjusts the idps passed into the widget based on if they get explicit support
      configuredSocialIdps: {
        deps: ['idps'],
        fn: function (idps) {
          return _.map(idps, function (idp) { 
            var type = idp.type && idp.type.toLowerCase();
            if ( !( type && _.contains(supportedIdps, type) ) ) {
              type = 'general-idp';
              idp.text = idp.text || '{ Please provide a text value }';
            }

            idp.className = [
              'social-auth-button',
              'social-auth-' + type + '-button ',
              idp.className ? idp.className : ''
            ].join(' ');
            idp.dataAttr = 'social-auth-' + type + '-button';
            idp.i18nKey = 'socialauth.' + type + '.label';
            return idp;
          });
        },
        cache: true
      },
      // social auth buttons order - 'above'/'below' the primary auth form (boolean)
      socialAuthPositionTop: {
        deps: ['configuredSocialIdps', 'idpDisplay'],
        fn: function (configuredSocialIdps, idpDisplay) {
          return !_.isEmpty(configuredSocialIdps) && idpDisplay.toUpperCase() === 'PRIMARY';
        },
        cache: true
      },
      hasConfiguredButtons: {
        deps: ['configuredSocialIdps', 'customButtons'],
        fn: function (configuredSocialIdps, customButtons) {
          return !_.isEmpty(configuredSocialIdps) || !_.isEmpty(customButtons);
        },
        cache: true
      }
    },

    initialize: function (options) {
      if (!options.baseUrl) {
        this.callGlobalError(new ConfigError(Okta.loc('error.required.baseUrl')));
      }
      else if (options.colors && _.isString(options.colors.brand) && !options.colors.brand.match(/^#[0-9A-Fa-f]{6}$/)) {
        this.callGlobalError(new ConfigError(Okta.loc('error.invalid.colors.brand')));
      }
      else if (BrowserFeatures.corsIsNotSupported()) {
        this.callGlobalError(new UnsupportedBrowserError(Okta.loc('error.unsupported.cors')));
      }
    },

    setAcceptLanguageHeader: function (authClient) {
      if (authClient && authClient.options && authClient.options.headers) {
        authClient.options.headers['Accept-Language'] = this.get('languageCode');
      }
    },

    setAuthClient: function (authClient) {
      this.setAcceptLanguageHeader(authClient);
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
        globalErrorFn(err);
      }
      else {
        // Only throw the error if they have not registered a globalErrorFn
        throw err;
      }
    },

    // Get the username by applying the transform function if it exists.
    transformUsername: function (username, operation) {
      var transformFn = this.get('transformUsername');
      if (transformFn && _.isFunction(transformFn)) {
        return transformFn(username, operation);
      }
      return username;
    },

    processCreds: function (creds) {
      var processCreds = this.get('processCreds');
      return Q.Promise(function (resolve) {
        if (!_.isFunction(processCreds)) {
          resolve();
        }
        else if (processCreds.length === 2) {
          processCreds(creds, resolve);
        }
        else {
          processCreds(creds);
          resolve();
        }
      });
    },

    parseSchema: function (schema, onSuccess, onFailure) {
      var parseSchema = this.get('registration.parseSchema');
      //check for parseSchema callback
      if (_.isFunction(parseSchema)) {
        parseSchema(schema, function (schema) {
          onSuccess(schema);
        }, function (error) {
          error = error || {'errorSummary': Okta.loc('registration.default.callbackhook.error')};
          error['callback'] = 'parseSchema';
          onFailure(error);
        });
      } else {
        //no callback
        onSuccess(schema);
      }
    },

    preSubmit: function (postData, onSuccess, onFailure) {
      var preSubmit = this.get('registration.preSubmit');
      //check for preSubmit callback
      if (_.isFunction(preSubmit)) {
        preSubmit(postData, function (postData) {
          onSuccess(postData);
        }, function (error) {
          error = error || {'errorSummary': Okta.loc('registration.default.callbackhook.error')};
          error['callback'] = 'preSubmit';
          onFailure(error);
        });
      } else {
        //no callback
        onSuccess(postData);
      }
    },

    postSubmit: function (response, onSuccess, onFailure) {
      var postSubmit = this.get('registration.postSubmit');
      //check for postSubmit callback
      if (_.isFunction(postSubmit)) {
        postSubmit(response, function (response) {
          onSuccess(response);
        }, function (error) {
          error = error || {'errorSummary': Okta.loc('registration.default.callbackhook.error')};
          error['callback'] = 'postSubmit';
          onFailure(error);
        });
      } else {
        //no callback
        onSuccess(response);
      }
    },

    // Use the parse function to transform config options to the standard
    // settings we currently support. This is a good place to deprecate old
    // option formats.
    parse: function (options) {
      if (options.authParams && options.authParams.scope) {
        Logger.deprecate('Use "scopes" instead of "scope"');
        options.authParams.scopes = options.authParams.scope;
        delete options.authParams.scope;
      }

      if (options.labels || options.country) {
        Logger.deprecate('Use "i18n" instead of "labels" and "country"');
        var overrides = options.labels || {};
        _.each(options.country, function (val, key) {
          overrides['country.' + key] = val;
        });
        // Old behavior is to treat the override as a global override, so we
        // need to add these overrides to each language
        options.i18n = {};
        _.each(config.supportedLanguages, function (language) {
          options.i18n[language] = overrides;
        });
        delete options.labels;
        delete options.country;
      }

      // Default the assets.baseUrl to the cdn, or remove any trailing slashes
      if (!options.assets) {
        options.assets = {};
      }
      var abu = options.assets.baseUrl;
      if (!abu) {
        options.assets.baseUrl = assetBaseUrlTpl({ version: config.version });
      }
      else if (abu[abu.length - 1] === '/') {
        options.assets.baseUrl = abu.substring(0, abu.length - 1);
      }

      return options;
    }

  });

});
