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

import { _, Model, loc, internal, ModelProperty } from '@okta/courage';
import config from 'config/config.json';
import hbs from '@okta/handlebars-inline-precompile';
import Q from 'q';
import BrowserFeatures from 'util/BrowserFeatures';
import {
  ConfigError,
  UnsupportedBrowserError
} from 'util/Errors';
import IDP from 'util/IDP';
import Logger from 'util/Logger';
import Util from 'util/Util';
import CountryUtil from 'util/CountryUtil';
import { OktaAuth } from '@okta/okta-auth-js';
const SharedUtil = internal.util.Util;
const assetBaseUrlTpl = hbs('https://global.oktacdn.com/okta-signin-widget/{{version}}');

const local: Record<string, ModelProperty> = {
  authClient: ['object', false, undefined],
  baseUrl: ['string', true],
  recoveryToken: ['string', false, undefined],
  stateToken: ['string', false, undefined],
  username: ['string', false],
  relayState: ['string', false],

  // These two settings are aliases. Setting either value will set `backToSignInUri`
  signOutLink: ['string', false], // for backward compatibility
  backToSignInLink: ['string', false], // preferred setting

  redirect: {
    type: 'string',
    values: ['never', 'always', 'auto'],
    value: 'auto',
  },

  // allows bootstrapping the Widget into a specific view such
  // as register or forgot password
  flow: ['string', false, 'default'],

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
  'features.skipIdpFactorVerificationBtn': ['boolean', false, false],
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
  'features.showIdentifier': ['boolean', false, true],
  'features.autoFocus': ['boolean', false, true],
  'features.sameDeviceOVEnrollmentEnabled': ['boolean', false, false],
  'features.showSessionRevocation': ['boolean', false, false],
  'features.disableAutocomplete': ['boolean', false, false],

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
  'assets.languages': ['array', false],

  // OAUTH2
  issuer: 'string',
  clientId: 'string',
  redirectUri: 'string',
  state: 'string',
  nonce: 'string',
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

  //cspNonce
  'cspNonce': 'string',

  //Descriptions
  brandName: 'string',

  //PIV
  piv: ['object', false, {}],

  //Email verify callback
  otp: 'string',

  //Support classic engine
  useClassicEngine: ['boolean', false, false],

  //hCaptcha script source URI
  'hcaptcha.scriptSource': ['string', false],
  //query params for hCaptcha script source URI
  'hcaptcha.scriptParams': ['object', false, {}],

  //reCAPTCHA script source URI
  'recaptcha.scriptSource': ['string', false],
};

const derived: Record<string, ModelProperty>  = {
  backToSignInUri: {
    deps: ['backToSignInLink', 'signOutLink'],
    fn: function(backToSignInLink, signOutLink) {
      return backToSignInLink || signOutLink; // prefer backToSignInLink over signOutLink, but they are aliases
    }
  },
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
    deps: ['i18n', 'language', 'assets.languages'],
    fn: function(i18n, language, hostedLanguages) {
      // By default, the language be automatically detected from the browser
      // Developers can specify the language. It will be added to the supportedLanguages list.
      // Developers can also provide a list of languages with hosted assets, these replace the default list
      const supportedLanguages = hostedLanguages || config.supportedLanguages;
      return _.union(
        supportedLanguages,
        _.keys(i18n),
        _.isString(language) ? [language] : []
      );
    },
    cache: true,
  },
  languageCode: {
    deps: ['language', 'supportedLanguages'],
    fn: function(language, supportedLanguages) {
      const userLanguages = BrowserFeatures.getUserLanguages();

      // TODO: revisit this fix - OKTA-491150
      userLanguages.forEach((val, idx) => {
        if (val === 'nl') {
          userLanguages[idx] = 'nl-NL';
        }
        else if (val === 'pt') {
          userLanguages[idx] = 'pt-BR';
        }
      });

      const preferred = _.clone(userLanguages);

      const supportedLowerCase = Util.toLower(supportedLanguages);

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

      // Add default language, and expand to include any language
      // codes that do not include region, dialect, etc.
      preferred.push(config.defaultLanguage);
      const expanded = Util.toLower(Util.expandLanguages(preferred));

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
    deps: ['codeChallenge'],
    fn: function(codeChallenge) {
      if (codeChallenge) {
        return 'remediation';
      }
      return 'relying-party';
    }
  },
  oauth2Enabled: {
    deps: ['clientId', 'authScheme', 'authClient'],
    fn: function(clientId, authScheme, authClient) {
       if (!clientId && authClient) {
        clientId = authClient.options.clientId;
      }
      return (!!clientId) && authScheme.toLowerCase() === 'oauth2';
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
  }
};

type SettingsProps = typeof local & typeof derived;

export default class Settings extends Model {
  authClient:OktaAuth;

  constructor(attributes, options) {
    // base class constructor will call preinitialize() and initialize() and compute derived properties
    super(attributes, options);

    // apply languageCode
    const authClient = this.getAuthClient();
    this.setAcceptLanguageHeader(authClient);
  }

  get<A extends Backbone._StringKey<SettingsProps>>(attributeName: A): any {
    return Model.prototype.get.call(this, attributeName);
  }

  preinitialize(...args) {
    this.local = local;
    this.derived = derived;
    Model.prototype.preinitialize.apply(this, args);
  }

  initialize(options) {
    options = options || {};
    const { colors, authClient, flow } = options;
    let { baseUrl } = options;

    if (!baseUrl) {
      // infer baseUrl from the issuer
      // favor authClient API first
      if (authClient) {
        baseUrl = authClient.getIssuerOrigin();
      } else {
        // issuer can also be passed a top-level option or exist in authParams
        const { authParams } = options;
        let { issuer } = options;
        issuer = issuer || authParams?.issuer;
        baseUrl = issuer?.split('/oauth2/')[0];
      }
      this.set('baseUrl', baseUrl);
    }

    // If `flow` and `authClient` instance are passed to settings, set flow in auth client
    if (authClient && flow) {
      authClient.idx.setFlow(flow);
    }

    if (!baseUrl) {
      this.callGlobalError(new ConfigError(loc('error.required.baseUrl')));
    } else if (colors && _.isString(colors.brand) && !colors.brand.match(/^#[0-9A-Fa-f]{6}$/)) {
      this.callGlobalError(new ConfigError(loc('error.invalid.colors.brand')));
    } else if (BrowserFeatures.corsIsNotSupported()) {
      this.callGlobalError(new UnsupportedBrowserError(loc('error.unsupported.cors')));
    }
  }

  setAcceptLanguageHeader(authClient) {
    if (authClient) {
      authClient.http.setRequestHeader('Accept-Language', this.get('languageCode'));
    }
  }

  setAuthClient(authClient) {
    this.set('authClient', authClient);
    this.setAcceptLanguageHeader(authClient);
  }

  getAuthClient() {
    return this.get('authClient');
  }

  set(...args: any[]) {
    try {
      return Model.prototype.set.apply(this, args);
    } catch (e) {
      const message = e.message ? e.message : e;

      this.callGlobalError(new ConfigError(message));
    }
  }

  // Invokes the global success function. This should only be called on a
  // terminal part of the code (i.e. authStatus SUCCESS or after sending
  // a recovery email)
  callGlobalSuccess(status, data) {
    const res = _.extend(data, { status: status });
    // Defer this to ensure that our functions have rendered completely
    // before invoking their function

    _.defer(_.partial(this.get('globalSuccessFn'), res));
  }

  // Invokes the global error function. This should only be called on non
  // recoverable errors (i.e. configuration errors, browser unsupported
  // errors, etc)
  callGlobalError(err) {
    const globalErrorFn = this.get('globalErrorFn') || this.options.globalErrorFn;
    // Note: Must use "this.options.globalErrorFn" when they've passed invalid
    // arguments - globalErrorFn will not have been set yet

    if (globalErrorFn) {
      globalErrorFn(err);
    } else {
      // Only throw the error if they have not registered a globalErrorFn
      throw err;
    }
  }

  // Get the username by applying the transform function if it exists.
  transformUsername(username, operation) {
    const transformFn = this.get('transformUsername');

    if (transformFn && _.isFunction(transformFn)) {
      return transformFn(username, operation);
    }
    return username;
  }

  processCreds(creds) {
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
  }

  parseRegistrationSchema(schema, onSuccess, onFailure) {
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
  }

  preRegistrationSubmit(postData, onSuccess, onFailure) {
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
  }

  postRegistrationSubmit(response, onSuccess, onFailure) {
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
  }

  // Use the parse function to transform config options to the standard
  // settings we currently support. This is a good place to deprecate old
  // option formats.
  parse(options) {
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
  }

  isDsTheme() {
    return false;
  }

}
