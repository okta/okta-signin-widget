/* eslint max-statements: [2, 22],  complexity: [2, 12] */

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

import { _, Model, loc, internal } from 'okta';
import config from 'config/config.json';
import hbs from 'handlebars-inline-precompile';
import Q from 'q';
import BrowserFeatures from 'util/BrowserFeatures';
import Errors from 'util/Errors';
import IDP from 'util/IDP';
import Logger from 'util/Logger';
import Util from 'util/Util';
import CountryUtil from 'util/CountryUtil';
const SharedUtil = internal.util.Util;
const DEFAULT_LANGUAGE = 'en';
const ConfigError = Errors.ConfigError;
const UnsupportedBrowserError = Errors.UnsupportedBrowserError;
const assetBaseUrlTpl = hbs('https://global.oktacdn.com/okta-signin-widget/{{version}}');
export default Model.extend({
  authClient: undefined,

  local: {
    baseUrl: ['string', true],
    recoveryToken: ['string', false, undefined],
    stateToken: ['string', false, undefined],
    username: ['string', false],
    signOutLink: ['string', false],
    relayState: ['string', false],

    redirect: {
      type: 'string',
      values: ['never', 'always', 'auto'],
      value: 'auto',
    },

    // Function to transform the username before passing it to the API
    // for Primary Auth, Forgot Password and Unlock Account.
    transformUsername: ['function', false],

    // CALLBACKS
    globalSuccessFn: 'function',
    globalErrorFn: 'function',
    processCreds: 'function',
    hooks: 'object',

    // IMAGES
    logo: 'string',
    logoText: ['string', false],
    helpSupportNumber: 'string',

    // IDX API VERSION
    apiVersion: ['string', true, '1.0.0'],

    // <OIE>
    // attribute to hold proxy (fake) idx response
    // to render static pages without initiating idx pipeline
    proxyIdxResponse: ['object', false],

    // <OIE>
    // By default, state handle will be saved to session storage
    // and will be clear when terminal error or success redirect.
    // Set this flag to true if you want to override this behavior.
    // a.k.a dishonor the state handle stored in session storage.
    overrideExistingStateToken: ['boolean', false, false],

    // FEATURES
    'features.router': ['boolean', true, false],
    'features.securityImage': ['boolean', true, false],
    'features.rememberMe': ['boolean', true, true],
    'features.autoPush': ['boolean', true, false],
    'features.smsRecovery': ['boolean', true, false],
    'features.callRecovery': ['boolean', true, false],
    'features.emailRecovery': ['boolean', false, true],
    'features.webauthn': ['boolean', true, false],
    'features.selfServiceUnlock': ['boolean', true, false],
    'features.multiOptionalFactorEnroll': ['boolean', true, false],
    'features.deviceFingerprinting': ['boolean', false, false],
    'features.hideSignOutLinkInMFA': ['boolean', false, false],
    'features.hideBackToSignInForReset': ['boolean', false, false],
    'features.customExpiredPassword': ['boolean', true, false],
    'features.registration': ['boolean', false, false],
    'features.idpDiscovery': ['boolean', false, false],
    'features.passwordlessAuth': ['boolean', false, false],
    'features.showPasswordToggleOnSignInPage': ['boolean', false, false],
    'features.trackTypingPattern': ['boolean', false, false],
    'features.redirectByFormSubmit': ['boolean', false, false],
    'features.useDeviceFingerprintForSecurityImage': ['boolean', false, true],
    'features.showPasswordRequirementsAsHtmlList': ['boolean', false, false],
    'features.mfaOnlyFlow': ['boolean', false, false],
    'features.scrollOnError': ['boolean', false, true],
    'features.showKeepMeSignedIn': ['boolean', false, true],
    
    defaultCountryCode: ['string', false, 'US'],

    // I18N
    language: ['any', false], // Can be a string or a function
    i18n: ['object', false],

    // ASSETS
    'assets.baseUrl': ['string', false],
    'assets.rewrite': {
      type: 'function',
      value: _.identity,
    },

    // OAUTH2
    clientId: 'string',
    redirectUri: 'string',
    state: 'string',
    scopes: 'array',
    codeChallenge: 'string',
    codeChallengeMethod: ['string', false],
    oAuthTimeout: ['number', false],

    authScheme: ['string', false, 'OAUTH2'],

    // External IdPs
    idps: ['array', false, []],
    idpDisplay: {
      type: 'string',
      values: ['PRIMARY', 'SECONDARY'],
      value: 'SECONDARY',
    },

    // HELP LINKS
    'helpLinks.help': 'string',
    'helpLinks.forgotPassword': 'string',
    'helpLinks.unlock': 'string',
    'helpLinks.custom': 'array',
    'helpLinks.factorPage.href': 'string',
    'helpLinks.factorPage.text': 'string',

    //Custom Buttons
    customButtons: ['array', false, []],

    //Registration
    policyId: 'string',
    'registration.click': 'function',
    'registration.parseSchema': 'function',
    'registration.preSubmit': 'function',
    'registration.postSubmit': 'function',

    //Consent
    'consent.cancel': 'function',

    //IDP Discovery
    'idpDiscovery.requestContext': 'string',

    //Colors
    'colors.brand': 'string',

    //Descriptions
    brandName: 'string',

    //PIV
    piv: ['object', false, {}],
  },

  derived: {
    showPasswordToggle: {
      deps: ['features.showPasswordToggleOnSignInPage'],
      fn: function() {
        // showPasswordToggle is for OIE only.
        // Used to default showPasswordToggleOnSignInPage to true.
        const defaultValue = true;
        const customizedValue = this.options?.features?.showPasswordToggleOnSignInPage ??
          this.options?.['features.showPasswordToggleOnSignInPage'];
        return customizedValue ?? defaultValue;
      },
      cache: true,
    },
    redirectUtilFn: {
      deps: ['features.redirectByFormSubmit'],
      fn: function(redirectByFormSubmit) {
        return redirectByFormSubmit ? Util.redirectWithFormGet.bind(Util) : SharedUtil.redirect.bind(SharedUtil);
      },
      cache: true,
    },
    supportedLanguages: {
      deps: ['i18n'],
      fn: function(i18n) {
        // Developers can pass in their own languages
        return _.union(config.supportedLanguages, _.keys(i18n));
      },
      cache: true,
    },
    languageCode: {
      deps: ['language', 'supportedLanguages'],
      fn: function(language, supportedLanguages) {
        const userLanguages = BrowserFeatures.getUserLanguages();

        const preferred = _.clone(userLanguages);

        const supportedLowerCase = Util.toLower(supportedLanguages);
        let expanded;

        // Any developer defined "language" takes highest priority:
        // As a string, i.e. 'en', 'ja', 'zh-CN'
        if (_.isString(language)) {
          preferred.unshift(language);
        } else if (_.isFunction(language)) {
          // As a callback function, which is passed the list of supported
          // languages and detected user languages. This function must return
          // a languageCode, i.e. 'en', 'ja', 'zh-CN'
          preferred.unshift(language(supportedLanguages, userLanguages));
        }

        // Add english as the default, and expand to include any language
        // codes that do not include region, dialect, etc.
        preferred.push(DEFAULT_LANGUAGE);
        expanded = Util.toLower(Util.expandLanguages(preferred));

        // Perform a case insensitive search - this is necessary in the case
        // of browsers like Safari
        let i;
        let supportedPos;

        for (i = 0; i < expanded.length; i++) {
          supportedPos = supportedLowerCase.indexOf(expanded[i]);
          if (supportedPos > -1) {
            return supportedLanguages[supportedPos];
          }
        }
      },
    },
    countryCode: {
      deps: ['defaultCountryCode'],
      fn: function(defaultCountryCode) {
        const countries = CountryUtil.getCountries();
        return Object.keys(countries).includes(defaultCountryCode)
          ? defaultCountryCode : 'US';
      },
    },
    mode: {
      deps: ['useInteractionCodeFlow', 'codeChallenge'],
      fn: function(useInteractionCodeFlow, codeChallenge) {
        if (useInteractionCodeFlow && codeChallenge) {
          return 'remediation';
        }
        return 'relying-party';
      }
    },
    oauth2Enabled: {
      deps: ['clientId', 'authScheme'],
      fn: function(clientId, authScheme) {
        return (!!clientId) && authScheme.toLowerCase() === 'oauth2';
      },
      cache: true,
    },
    oieEnabled: {
      deps: ['stateToken', 'proxyIdxResponse', 'useInteractionCodeFlow'],
      fn: function(stateToken, proxyIdxResponse, useInteractionCodeFlow) {
        return stateToken || proxyIdxResponse || useInteractionCodeFlow;
      },
      cache: true,
    },
    // Redirect Uri to provide in the oauth API
    oauthRedirectUri: {
      deps: ['redirectUri'],
      fn: function(redirectUri) {
        if (redirectUri) {
          return redirectUri;
        }

        let origin = window.location.origin;

        // IE8
        if (!origin) {
          const href = window.location.href;
          const path = window.location.pathname;

          if (path !== '') {
            origin = href.substring(0, href.lastIndexOf(path));
          }
        }

        return encodeURI(origin);
      },
    },
    // Adjusts the idps passed into the widget based on if they get explicit support
    configuredSocialIdps: {
      deps: ['idps'],
      fn: function(idps) {
        return _.map(idps, function(idpConfig) {
          const idp = _.clone(idpConfig);

          let type = idp.type && idp.type.toLowerCase();

          if (!(type && _.contains(IDP.SUPPORTED_SOCIAL_IDPS, type))) {
            type = 'general-idp';
            idp.text = idp.text || '{ Please provide a text value }';
          }

          idp.className = [
            'social-auth-button',
            'social-auth-' + type + '-button ',
            idp.className ? idp.className : '',
          ].join(' ');
          idp.dataAttr = 'social-auth-' + type + '-button';
          idp.i18nKey = 'socialauth.' + type + '.label';
          return idp;
        });
      },
      cache: true,
    },
    // Can support piv authentication
    hasPivCard: {
      deps: ['piv'],
      fn: function(piv) {
        return piv && piv.certAuthUrl;
      },
      cache: true,
    },
    // social auth buttons order - 'above'/'below' the primary auth form (boolean)
    socialAuthPositionTop: {
      deps: ['configuredSocialIdps', 'hasPivCard', 'idpDisplay'],
      fn: function(configuredSocialIdps, hasPivCard, idpDisplay) {
        return (!_.isEmpty(configuredSocialIdps) || hasPivCard) && idpDisplay.toUpperCase() === 'PRIMARY';
      },
      cache: true,
    },
    hasConfiguredButtons: {
      deps: ['configuredSocialIdps', 'customButtons', 'hasPivCard'],
      fn: function(configuredSocialIdps, customButtons, hasPivCard) {
        return !_.isEmpty(configuredSocialIdps) || !_.isEmpty(customButtons) || hasPivCard;
      },
      cache: true,
    },
  },

  initialize: function(options) {
    if (!options.baseUrl) {
      this.callGlobalError(new ConfigError(loc('error.required.baseUrl')));
    } else if (options.colors && _.isString(options.colors.brand) && !options.colors.brand.match(/^#[0-9A-Fa-f]{6}$/)) {
      this.callGlobalError(new ConfigError(loc('error.invalid.colors.brand')));
    } else if (BrowserFeatures.corsIsNotSupported()) {
      this.callGlobalError(new UnsupportedBrowserError(loc('error.unsupported.cors')));
    }
  },

  setAcceptLanguageHeader: function(authClient) {
    if (authClient && authClient.options && authClient.options.headers) {
      authClient.options.headers['Accept-Language'] = this.get('languageCode');
    }
  },

  setAuthClient: function(authClient) {
    this.setAcceptLanguageHeader(authClient);
    this.authClient = authClient;
  },

  getAuthClient: function() {
    return this.authClient;
  },

  set: function() {
    try {
      return Model.prototype.set.apply(this, arguments);
    } catch (e) {
      const message = e.message ? e.message : e;

      this.callGlobalError(new ConfigError(message));
    }
  },

  // Invokes the global success function. This should only be called on a
  // terminal part of the code (i.e. authStatus SUCCESS or after sending
  // a recovery email)
  callGlobalSuccess: function(status, data) {
    const res = _.extend(data, { status: status });
    // Defer this to ensure that our functions have rendered completely
    // before invoking their function

    _.defer(_.partial(this.get('globalSuccessFn'), res));
  },

  // Invokes the global error function. This should only be called on non
  // recoverable errors (i.e. configuration errors, browser unsupported
  // errors, etc)
  callGlobalError: function(err) {
    const globalErrorFn = this.get('globalErrorFn') || this.options.globalErrorFn;
    // Note: Must use "this.options.globalErrorFn" when they've passed invalid
    // arguments - globalErrorFn will not have been set yet

    if (globalErrorFn) {
      globalErrorFn(err);
    } else {
      // Only throw the error if they have not registered a globalErrorFn
      throw err;
    }
  },

  // Get the username by applying the transform function if it exists.
  transformUsername: function(username, operation) {
    const transformFn = this.get('transformUsername');

    if (transformFn && _.isFunction(transformFn)) {
      return transformFn(username, operation);
    }
    return username;
  },

  processCreds: function(creds) {
    const processCreds = this.get('processCreds');

    return Q.Promise(function(resolve) {
      if (!_.isFunction(processCreds)) {
        resolve();
      } else if (processCreds.length === 2) {
        processCreds(creds, resolve);
      } else {
        processCreds(creds);
        resolve();
      }
    });
  },

  parseRegistrationSchema: function(schema, onSuccess, onFailure) {
    const parseSchema = this.get('registration.parseSchema');

    //check for parseSchema callback
    if (_.isFunction(parseSchema)) {
      parseSchema(
        schema,
        function(schema) {
          onSuccess(schema);
        },
        function(error) {
          error = error || { errorSummary: loc('registration.default.callbackhook.error') };
          error['callback'] = 'parseSchema';
          onFailure(error);
        }
      );
    } else {
      //no callback
      onSuccess(schema);
    }
  },

  preRegistrationSubmit: function(postData, onSuccess, onFailure) {
    const preSubmit = this.get('registration.preSubmit');

    //check for preSubmit callback
    if (_.isFunction(preSubmit)) {
      preSubmit(
        postData,
        function(postData) {
          onSuccess(postData);
        },
        function(error) {
          error = error || { errorSummary: loc('registration.default.callbackhook.error') };
          error['callback'] = 'preSubmit';
          onFailure(error);
        }
      );
    } else {
      //no callback
      onSuccess(postData);
    }
  },

  postRegistrationSubmit: function(response, onSuccess, onFailure) {
    const postSubmit = this.get('registration.postSubmit');

    //check for postSubmit callback
    if (_.isFunction(postSubmit)) {
      postSubmit(
        response,
        function(response) {
          onSuccess(response);
        },
        function(error) {
          error = error || { errorSummary: loc('registration.default.callbackhook.error') };
          error['callback'] = 'postSubmit';
          onFailure(error);
        }
      );
    } else {
      //no callback
      onSuccess(response);
    }
  },

  // Use the parse function to transform config options to the standard
  // settings we currently support. This is a good place to deprecate old
  // option formats.
  parse: function(options) {
    if (options.labels || options.country) {
      Logger.deprecate('Use "i18n" instead of "labels" and "country"');
      const overrides = options.labels || {};

      _.each(options.country, function(val, key) {
        overrides['country.' + key] = val;
      });
      // Old behavior is to treat the override as a global override, so we
      // need to add these overrides to each language
      options.i18n = {};
      _.each(config.supportedLanguages, function(language) {
        options.i18n[language] = overrides;
      });
      delete options.labels;
      delete options.country;
    }

    // Default the assets.baseUrl to the cdn, or remove any trailing slashes
    if (!options.assets) {
      options.assets = {};
    }
    const abu = options.assets.baseUrl;

    if (!abu) {
      options.assets.baseUrl = assetBaseUrlTpl({ version: config.version });
    } else if (abu[abu.length - 1] === '/') {
      options.assets.baseUrl = abu.substring(0, abu.length - 1);
    }

    return options;
  },

  isDsTheme: function() {
    return false;
  },

});
