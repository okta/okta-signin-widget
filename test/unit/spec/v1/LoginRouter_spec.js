/* eslint-disable no-prototype-builtins */
/* eslint max-params: [2, 34], max-statements: 0, max-len: [2, 210], camelcase:0 */
import { _, $, Backbone, Router, internal } from '@okta/courage';
import MockDate from 'mockdate';
import getAuthClient from 'helpers/getAuthClient';
import LoginRouter from 'v1/LoginRouter';
import PrimaryAuthController from 'v1/controllers/PrimaryAuthController';
import SecurityBeacon from 'v1/views/shared/SecurityBeacon';
import config from 'config/config.json';
import EnrollCallForm from 'helpers/dom/EnrollCallForm';
import IDPDiscoveryForm from 'helpers/dom/IDPDiscoveryForm';
import MfaVerifyForm from 'helpers/dom/MfaVerifyForm';
import PrimaryAuthForm from 'helpers/dom/PrimaryAuthForm';
import ErrorStateForm from 'helpers/dom/ErrorStateForm';
import RecoveryForm from 'helpers/dom/RecoveryQuestionForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import errorInvalidToken from 'helpers/xhr/ERROR_invalid_token';
import resMfaChallengeDuo from 'helpers/xhr/MFA_CHALLENGE_duo';
import resMfaChallengePush from 'helpers/xhr/MFA_CHALLENGE_push';
import resMfaEnroll from 'helpers/xhr/MFA_ENROLL_allFactors';
import resMfa from 'helpers/xhr/MFA_REQUIRED_allFactors';
import resMfaRequiredDuo from 'helpers/xhr/MFA_REQUIRED_duo';
import resMfaRequiredOktaVerify from 'helpers/xhr/MFA_REQUIRED_oktaVerify';
import resRecovery from 'helpers/xhr/RECOVERY';
import resSuccess from 'helpers/xhr/SUCCESS';
import resSuccessNext from 'helpers/xhr/SUCCESS_next';
import resSuccessOriginal from 'helpers/xhr/SUCCESS_original';
import resSuccessWithSTAF from 'helpers/xhr/SUCCESS_with_STAF';
import resSuccessStepUp from 'helpers/xhr/SUCCESS_session_step_up';
import resUnauthenticated from 'helpers/xhr/UNAUTHENTICATED';
import labelsCountryJa from 'helpers/xhr/labels_country_ja';
import labelsLoginJa from 'helpers/xhr/labels_login_ja';
import resWellKnownSR from 'helpers/xhr/well-known-shared-resource';
import Q from 'q';
import $sandbox from 'sandbox';
import BrowserFeatures from 'util/BrowserFeatures';
import Bundles from 'util/Bundles';
import { ConfigError, UnsupportedBrowserError } from 'util/Errors';
import Logger from 'util/Logger';
import WidgetUtil from 'util/Util';

jest.mock('cross-fetch', () => {
  const fetchMock = require('jest-fetch-mock');
  // Require the original module to not be mocked...
  const originalFetch = jest.requireActual('cross-fetch');
  return {
    __esModule: true,
    ...originalFetch,
    default: fetchMock
  };
});
import fetch from 'cross-fetch';
fetch.dontMock();

let { Util: SharedUtil, Logger: CourageLogger } = internal.util;
const itp = Expect.itp;
const OIDC_IFRAME_ID = 'okta-oauth-helper-frame';
const OIDC_STATE = 'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg';
const OIDC_NONCE = 'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg';
const VALID_ID_TOKEN =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6IlU1UjhjSGJHdzQ0NVFicTh6' +
  'Vk8xUGNDcFhMOHlHNkljb3ZWYTNsYUNveE0iLCJ0eXAiOiJKV1Qi' +
  'fQ.eyJ2ZXIiOjEsImlzcyI6Imh0dHBzOi8vZm9vLmNvbSIsInN1Y' +
  'iI6IjAwdWlsdE5RSzJXc3pzMlJWMGczIiwibG9naW4iOiJzYW1sa' +
  'mFja3NvbkBnYWNrLm1lIiwiYXVkIjoic29tZUNsaWVudElkIiwia' +
  'WF0IjoxNDUxNjA2NDAwLCJleHAiOjE2MDk0NTkyMDAsImFtciI6W' +
  'yJwd2QiXSwiaWRwIjoiMG9haWRpdzl1ZE9TY2VEcXcwZzMiLCJub' +
  '25jZSI6ImdnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ' +
  '2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2ciLCJhdXRoX' +
  '3RpbWUiOjE0NTE2MDY0MDAsImlkcF90eXBlIjoiRkFDRUJPT0siL' +
  'CJuYW1lIjoiU2FtbCBKYWNrc29uIiwicHJvZmlsZSI6Imh0dHBzO' +
  'i8vd3d3LmZhY2Vib29rLmNvbS9hcHBfc2NvcGVkX3VzZXJfaWQvM' +
  'TIyODE5NjU4MDc2MzU3LyIsImdpdmVuX25hbWUiOiJTYW1sIiwiZ' +
  'mFtaWx5X25hbWUiOiJKYWNrc29uIiwidXBkYXRlZF9hdCI6MTQ1M' +
  'TYwNjQwMCwiZW1haWwiOiJzYW1samFja3NvbkBnYWNrLm1lIiwiZ' +
  'W1haWxfdmVyaWZpZWQiOnRydWV9.fJ8ZzLojgQKdZLvssGrSshTH' +
  'DhhUF6G2bPm9zRLPeZBh1zUiVccvV-0UzJERuWoL07hFt7QGGoxR' +
  'lXvxoMVtFk-fcdCkn1DnTtIzsFPOjysBl2vjwVBJXg9h1Nymd91l' +
  'dI5eorOMrbamRfxOFkEUC9P9mgO6DcVfR5oxY0pjfMA';

Expect.describe('v1/LoginRouter', function() {
  function setup(settings, resp) {
    settings = settings || {};
    const setNextResponse = settings.mockAjax === false ? function() {} : Util.mockAjax();
    const baseUrl = settings.hasOwnProperty('baseUrl') ? settings.baseUrl : 'https://foo.com';
    const authParams = { issuer: baseUrl, headers: {}, ignoreSignature: true };
    const setLocationSpy = jasmine.createSpy('setLocation');
    authParams.setLocation = setLocationSpy;
    Object.keys(settings).forEach(key => {
      const parts = key.split('.');
      if (parts[0] === 'authParams') {
        authParams[parts[1]] = settings[key];
      }
    });
    const authClient = settings.hasOwnProperty('authClient') ? settings.authClient : getAuthClient({ authParams });
    const eventSpy = jasmine.createSpy('eventSpy');
    const afterRenderHandler = jasmine.createSpy('afterRenderHandler');
    const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
    const router = new LoginRouter(
      _.extend(
        {
          el: $sandbox,
          baseUrl: baseUrl,
          useClassicEngine: true,
          authClient: authClient,
        },
        settings
      )
    );

    Util.registerRouter(router);
    router.on('pageRendered', eventSpy);
    router.on('afterRender', afterRenderHandler);
    router.on('afterError', afterErrorHandler);
    if (authClient) {
      spyOn(authClient.token, 'getWithoutPrompt').and.callThrough();
    }
    setNextResponse(resp);

    return Q({
      router: router,
      ac: authClient,
      setNextResponse: setNextResponse,
      eventSpy: eventSpy,
      afterRenderHandler: afterRenderHandler,
      afterErrorHandler: afterErrorHandler,
      setLocationSpy: setLocationSpy,
    });
  }

  function setupOAuth2(settings, options = {}) {
    spyOn(window, 'addEventListener');
    Util.mockOIDCStateGenerator();
    return setup(
      _.extend(
        {
          clientId: 'someClientId',
          redirectUri: 'https://0.0.0.0:9999',
        },
        settings
      ),
      resMfaRequiredOktaVerify
    )
      .then(function(test) {
        // Start in MFA_REQUIRED, and then call success. This allows us to test
        // that we are registering our handler independent of the controller we
        // are on
        Util.mockRouterNavigate(test.router);
        test.setNextResponse(resMfaRequiredOktaVerify);
        test.router.refreshAuthState('dummy-token');
        return Expect.waitForMfaVerify(test);
      })
      .then(function(test) {
        const origAppend = document.appendChild;

        spyOn(document.body, 'appendChild').and.callFake(function(element) {
          if (element.tagName.toLowerCase() === 'iframe') {
            // Don't want to actually append the original iframe since it loads
            // an external url. However, we will append one without the src so
            // that we can test that we remove it
            test.iframeElem = element;
            $sandbox.append('<iframe id=' + OIDC_IFRAME_ID + '></iframe>');
            // return the iframe dom element so that the element can be used in the later flows.
            return $sandbox.find('#' + OIDC_IFRAME_ID)[0];
          }
          return origAppend.apply(this, arguments);
        });

        const form = new MfaVerifyForm($sandbox);
        const next = [resSuccess];

        // mock .well-known for PKCE flow
        if (options.mockWellKnown) {
          next.push({ 
            ...resWellKnownSR, 
            response: { ...resWellKnownSR.response, issuer: 'https://foo.com' }
          });
        }
        test.setNextResponse(next);
        form.setAnswer('wrong');
        form.submit();

        const spy = options.expectRedirect ? test.setLocationSpy : test.ac.token.getWithoutPrompt;

        return Expect.waitForSpyCall(spy, test);
      });
  }

  function expectUnsuportedLanguageLoad(test, delay = 0) {
    test.setNextResponse([_.extend({ delay }, labelsLoginJa), _.extend({ delay }, labelsCountryJa)]);
  }

  // { settings, userLanguages, supportedLanguages }
  function setupLanguage(options) {
    const loadingSpy = jasmine.createSpy('loading');
    const delay = options.delay || 0;
    // TODO: remove delay from tests
    spyOn(BrowserFeatures, 'getUserLanguages').and.returnValue(options.userLanguages || []);
    spyOn(BrowserFeatures, 'localStorageIsNotSupported').and.returnValue(options.localStorageIsNotSupported);

    return setup(options.settings)
      .then(function(test) {
        test.router.appState.on('loading', loadingSpy);
        // Use the encrollCallAndSms controller because it uses both the login
        // and country bundles
        Util.mockRouterNavigate(test.router);
        test.setNextResponse(resMfaEnroll);
        if (options.mockLanguageRequest) {
          switch (options.mockLanguageRequest) {
          case 'ja':
            test.setNextResponse([_.extend({ delay }, labelsLoginJa), _.extend({ delay }, labelsCountryJa)]);
            break;
          // Unsupported languages
          case 'zz-zz':
          case 'zz-ZZ':
          case 'nl':
          case 'NL':
            expectUnsuportedLanguageLoad(test, delay);
            break;
          }
        }
        test.router.refreshAuthState('dummy-token');
        return Expect.waitForEnrollChoices(test);
      })
      .then(function(test) {
        test.router.appState.off('loading');
        test.router.enrollCall();
        return Expect.waitForEnrollCall(
          _.extend(test, {
            form: new EnrollCallForm($sandbox),
            loadingSpy: loadingSpy,
          })
        );
      })
      .then(function(test) {
        return Expect.wait(function() {
          return test.form.hasCountriesList();
        }, test);
      });
  }

  function expectPrimaryAuthRender(options = {}, path = '') {
    // Reusable stub to assert that the Primary Auth for renders
    // given Widget parameters and a navigation path.
    return setup(options)
      .then(function(test) {
        Util.mockRouterNavigate(test.router);
        test.router.navigate(path);
        return Expect.waitForPrimaryAuth();
      })
      .then(function() {
        const form = new PrimaryAuthForm($sandbox);

        expect(form.isPrimaryAuth()).toBe(true);
      });
  }

  function expectUnexpectedFieldLog(arg1) {
    // These console warnings are called from Courage's Logger class, not
    // the Widget's. We need to assert that the following is called in specific
    // environments (window.okta && window.okta.debug are defined).
    expect(CourageLogger.warn).toHaveBeenCalledWith('Field not defined in schema', arg1);
  }

  Expect.describe('Loads json bundles', function() {
    config.supportedLanguages
      .filter(function(lang) {
        return lang !== 'en'; // no bundles are loaded for english
      })
      .forEach(function(lang) {
        const loginBundle = require('@okta/i18n/src/json/login_' + lang.replace(/-/g, '_') + '.json');
        it(`for language: "${lang}"`, function() {
          const loadingSpy = jasmine.createSpy('loading');

          spyOn(BrowserFeatures, 'localStorageIsNotSupported').and.returnValue(false);
          return setup({
            mockAjax: false,
            language: lang,
            assets: {
              baseUrl: '/base/target', // local json bundles are served to us from mocked fetch
            },
          })
            .then(function(test) {
              fetch.mockResponse(JSON.stringify(loginBundle));
              fetch.doMock();
              test.router.appState.on('loading', loadingSpy);
              spyOn(Bundles, 'loadLanguage').and.callThrough();
              test.router.passwordExpired(); // choosing a simple view with text
              return Expect.wait(function() {
                const call = loadingSpy.calls.mostRecent();

                return call && call.args.length === 1 && call.args[0] === false;
              }, test);
            })
            .then(function() {
              expect(Bundles.loadLanguage).toHaveBeenCalled();
              expect(Bundles.currentLanguage).toBe(lang);
              // Verify that the translation is being applied

              const title = loginBundle['password.expired.title.generic'];
              const $title = $sandbox.find('.password-expired .okta-form-title');

              expect($title.length).toBe(1);
              expect($title.text()).toBe(title);

              // Loading bundles modifies internal structures of the global singleton "Bundles"
              // Loading English here so that other tests will not be affected.
              return Bundles.loadLanguage('en');
            })
            .then(function() {
              expect(Bundles.currentLanguage).toBe('en');
            })
            .finally(() => {
              fetch.dontMock();
            });
        });
      });
  });

  it('logs a ConfigError error if unknown option is passed as a widget param', function() {
    spyOn(CourageLogger, 'warn');

    const fn = function() {
      setup({ foo: 'bla' });
    };

    expect(fn).not.toThrowError(ConfigError);
    expectUnexpectedFieldLog('foo');
  });
  it('has the correct error message if unknown option is passed as a widget param', function() {
    spyOn(CourageLogger, 'warn');

    const fn = function() {
      setup({ foo: 'bla' });
    };

    expect(fn).not.toThrow();
    expectUnexpectedFieldLog('foo');
  });
  it('logs a ConfigError error if el is not passed as a widget param', function() {
    spyOn(Logger, 'error');

    const fn = function() {
      setup({ el: undefined });
    };

    expect(fn).not.toThrow();
    expect(Logger.error).toHaveBeenCalled();
  });
  it('has the correct error message if el is not passed as a widget param', function() {
    spyOn(Logger, 'error');

    const fn = function() {
      setup({ el: undefined });
    };

    expect(fn).not.toThrow();
    const err = Logger.error.calls.mostRecent().args[0];

    expect(err.name).toBe('CONFIG_ERROR');
    expect(err.message).toEqual('"el" is a required widget parameter');
  });
  itp(
    'renders the primary autenthentication form when no globalSuccessFn and globalErrorFn are passed as widget params',
    function() {
      return expectPrimaryAuthRender({ globalSuccessFn: undefined, globalErrorFn: undefined });
    }
  );
  itp(
    'renders the primary autenthentication form when a null globalSuccessFn and globalErrorFn are passed as widget params',
    function() {
      return expectPrimaryAuthRender({ globalSuccessFn: null, globalErrorFn: null });
    }
  );
  itp('set pushState true if pushState is supported', function() {
    spyOn(BrowserFeatures, 'supportsPushState').and.returnValue(true);
    spyOn(Router.prototype, 'start');
    return setup({ 'features.router': true }).then(function(test) {
      test.router.start();
      expect(Router.prototype.start).toHaveBeenCalledWith({ pushState: true });
    });
  });
  itp('set pushState false if pushState is not supported', function() {
    spyOn(BrowserFeatures, 'supportsPushState').and.returnValue(false);
    spyOn(Router.prototype, 'start');
    return setup({ 'features.router': true }).then(function(test) {
      test.router.start();
      expect(Router.prototype.start).toHaveBeenCalledWith({ pushState: false });
    });
  });

  itp('invokes success callback if SUCCESS auth status is returned', function() {
    const successSpy = jasmine.createSpy('successSpy');

    return setup({ globalSuccessFn: successSpy }, resSuccess)
      .then(function(test) {
        test.setNextResponse(resSuccess);
        test.router.refreshAuthState('dummy-token');
        return Expect.waitForSpyCall(successSpy);
      })
      .then(function() {
        const res = successSpy.calls.mostRecent().args[0];

        expect(res.status).toBe('SUCCESS');
        expect(res.user).toEqual({
          id: '00ui0jgywTAHxYGMM0g3',
          profile: {
            login: 'administrator1@clouditude.net',
            firstName: 'Add-Min',
            lastName: 'O\'Cloudy Tud',
            locale: 'en_US',
            timeZone: 'America/Los_Angeles',
          },
        });
        expect(res.session.token).toBe('THE_SESSION_TOKEN');
        expect(_.isFunction(res.session.setCookieAndRedirect)).toBe(true);
      });
  });
  itp('has a success callback which correctly implements the setCookieAndRedirect function', function() {
    const spied = {};

    spied.successFn = function(resp) {
      if (resp.status === 'SUCCESS') {
        resp.session.setCookieAndRedirect('http://baz.com/foo');
      }
    };
    spyOn(spied, 'successFn').and.callThrough();
    spyOn(SharedUtil, 'redirect');
    return setup({ globalSuccessFn: spied.successFn }, resSuccess)
      .then(function(test) {
        test.setNextResponse(resSuccess);
        test.router.refreshAuthState('dummy-token');
        return Expect.waitForSpyCall(spied.successFn);
      })
      .then(function() {
        expect(SharedUtil.redirect).toHaveBeenCalledWith(
          'https://foo.com/login/sessionCookieRedirect?checkAccountSetupComplete=true' +
            '&token=THE_SESSION_TOKEN&redirectUrl=http%3A%2F%2Fbaz.com%2Ffoo'
        );
      });
  });
  itp(
    'has a success callback which correctly implements the setCookieAndRedirect function when features.redirectByFormSubmit is on',
    function() {
      const spied = {};

      spied.successFn = function(resp) {
        if (resp.status === 'SUCCESS') {
          resp.session.setCookieAndRedirect('http://baz.com/foo');
        }
      };
      spyOn(spied, 'successFn').and.callThrough();
      spyOn(WidgetUtil, 'redirectWithFormGet');
      return setup({ globalSuccessFn: spied.successFn, 'features.redirectByFormSubmit': true }, resSuccess)
        .then(function(test) {
          test.setNextResponse(resSuccess);
          test.router.refreshAuthState('dummy-token');
          return Expect.waitForSpyCall(spied.successFn);
        })
        .then(function() {
          expect(WidgetUtil.redirectWithFormGet).toHaveBeenCalledWith(
            'https://foo.com/login/sessionCookieRedirect?checkAccountSetupComplete=true' +
              '&token=THE_SESSION_TOKEN&redirectUrl=http%3A%2F%2Fbaz.com%2Ffoo'
          );
        });
    }
  );
  itp(
    'for SESSION_STEP_UP type, success callback data contains the target resource url and a finish function',
    function() {
      let targetUrl;
      const spied = {};

      spied.successFn = function(resp) {
        if (resp.status === 'SUCCESS') {
          if (resp.type === 'SESSION_STEP_UP') {
            targetUrl = resp.stepUp.url;
            resp.stepUp.finish();
          }
        }
      };
      spyOn(spied, 'successFn').and.callThrough();
      spyOn(SharedUtil, 'redirect');
      return setup({ stateToken: 'aStateToken', globalSuccessFn: spied.successFn }, resSuccessStepUp)
        .then(function(test) {
          test.setNextResponse(resSuccessStepUp);
          test.router.refreshAuthState('dummy-token');
          return Expect.waitForSpyCall(spied.successFn);
        })
        .then(function() {
          expect(targetUrl).toBe('http://foo.okta.com/login/step-up/redirect?stateToken=aStateToken');
          expect(SharedUtil.redirect).toHaveBeenCalledWith(
            'http://foo.okta.com/login/step-up/redirect?stateToken=aStateToken'
          );
        });
    }
  );
  itp(
    'for SESSION_STEP_UP type, success callback data contains the target resource url and a finish function when features.redirectByFormSubmit is on',
    function() {
      let targetUrl;
      const spied = {};

      spied.successFn = function(resp) {
        if (resp.status === 'SUCCESS') {
          if (resp.type === 'SESSION_STEP_UP') {
            targetUrl = resp.stepUp.url;
            resp.stepUp.finish();
          }
        }
      };
      spyOn(spied, 'successFn').and.callThrough();
      spyOn(WidgetUtil, 'redirectWithFormGet');
      const opt = {
        'features.redirectByFormSubmit': true,
        stateToken: 'aStateToken',
        globalSuccessFn: spied.successFn,
      };

      return setup(opt, resSuccessStepUp)
        .then(function(test) {
          test.setNextResponse(resSuccessStepUp);
          test.router.refreshAuthState('dummy-token');
          return Expect.waitForSpyCall(spied.successFn);
        })
        .then(function() {
          expect(targetUrl).toBe('http://foo.okta.com/login/step-up/redirect?stateToken=aStateToken');
          expect(WidgetUtil.redirectWithFormGet).toHaveBeenCalledWith(
            'http://foo.okta.com/login/step-up/redirect?stateToken=aStateToken'
          );
        });
    }
  );
  itp(
    'for success with an original link, success callback data contains a next function that redirects to original.href',
    function() {
      const spied = {};

      spied.successFn = function(resp) {
        if (resp.status === 'SUCCESS') {
          if (resp.type === 'NEW_TYPE' && resp.next) {
            resp.next();
          }
        }
      };
      spyOn(spied, 'successFn').and.callThrough();
      spyOn(SharedUtil, 'redirect');
      return setup({ stateToken: 'aStateToken', globalSuccessFn: spied.successFn }, resSuccessOriginal)
        .then(function(test) {
          test.setNextResponse(resSuccessOriginal);
          test.router.refreshAuthState('dummy-token');
          return Expect.waitForSpyCall(spied.successFn);
        })
        .then(function() {
          expect(SharedUtil.redirect).toHaveBeenCalledWith(
            'http://foo.okta.com/original/redirect?stateToken=aStateToken'
          );
        });
    }
  );
  itp(
    'for success with an original link, success callback data contains a next function that redirects to original.href when features.redirectByFormSubmit is on',
    function() {
      const spied = {};

      spied.successFn = function(resp) {
        if (resp.status === 'SUCCESS') {
          if (resp.type === 'NEW_TYPE' && resp.next) {
            resp.next();
          }
        }
      };
      spyOn(spied, 'successFn').and.callThrough();
      spyOn(WidgetUtil, 'redirectWithFormGet');
      const opt = {
        'features.redirectByFormSubmit': true,
        stateToken: 'aStateToken',
        globalSuccessFn: spied.successFn,
      };

      return setup(opt, resSuccessOriginal)
        .then(function(test) {
          test.setNextResponse(resSuccessOriginal);
          test.router.refreshAuthState('dummy-token');
          return Expect.waitForSpyCall(spied.successFn);
        })
        .then(function() {
          expect(WidgetUtil.redirectWithFormGet).toHaveBeenCalledWith(
            'http://foo.okta.com/original/redirect?stateToken=aStateToken'
          );
        });
    }
  );
  itp(
    'for success with a next link, success callback data contains a next function that redirects to next.href',
    function() {
      const spied = {};

      spied.successFn = function(resp) {
        if (resp.status === 'SUCCESS') {
          if (resp.type === 'NEW_TYPE' && resp.next) {
            resp.next();
          }
        }
      };
      spyOn(spied, 'successFn').and.callThrough();
      spyOn(SharedUtil, 'redirect');
      return setup({ stateToken: 'aStateToken', globalSuccessFn: spied.successFn }, resSuccessNext)
        .then(function(test) {
          test.setNextResponse(resSuccessNext);
          test.router.refreshAuthState('dummy-token');
          return Expect.waitForSpyCall(spied.successFn);
        })
        .then(function() {
          expect(SharedUtil.redirect).toHaveBeenCalledWith('http://foo.okta.com/next/redirect?stateToken=aStateToken');
        });
    }
  );
  itp(
    'for success with a next link, success callback data contains a next function that redirects to next.href when features.redirectByFormSubmit is on',
    function() {
      const spied = {};

      spied.successFn = function(resp) {
        if (resp.status === 'SUCCESS') {
          if (resp.type === 'NEW_TYPE' && resp.next) {
            resp.next();
          }
        }
      };
      spyOn(spied, 'successFn').and.callThrough();
      spyOn(WidgetUtil, 'redirectWithFormGet');
      const opt = {
        'features.redirectByFormSubmit': true,
        stateToken: 'aStateToken',
        globalSuccessFn: spied.successFn,
      };

      return setup(opt, resSuccessNext)
        .then(function(test) {
          test.setNextResponse(resSuccessNext);
          test.router.refreshAuthState('dummy-token');
          return Expect.waitForSpyCall(spied.successFn);
        })
        .then(function() {
          expect(WidgetUtil.redirectWithFormGet).toHaveBeenCalledWith(
            'http://foo.okta.com/next/redirect?stateToken=aStateToken'
          );
        });
    }
  );
  itp(
    'for success with session token and next link, success callback data contains a next function and session object that implements setCookieAndRedirect function (when STATE_TOKEN_ALL_FLOWS is enabled)',
    function() {
      const spied = {};
      spied.successFn = function(resp) {
        if (resp.status === 'SUCCESS') {
          if (resp.session) {
            resp.session.setCookieAndRedirect('http://baz.com/foo');
          }
          if (resp.next) {
            resp.next();
          }
        }
      };
      const successSpy = spyOn(spied, 'successFn').and.callThrough();
      spyOn(SharedUtil, 'redirect');
      const opt = {
        stateToken: 'aStateToken',
        globalSuccessFn: successSpy,
      };

      return setup(opt, resSuccessWithSTAF)
        .then(function(test) {
          test.setNextResponse(resSuccessWithSTAF);
          test.router.refreshAuthState('dummy-token');
          return Expect.waitForSpyCall(successSpy);
        })
        .then(function() {
          const res = successSpy.calls.mostRecent().args[0];
          expect(res.status).toBe('SUCCESS');
          expect(res.session.token).toBe('THE_SESSION_TOKEN');
          expect(_.isFunction(res.session.setCookieAndRedirect)).toBe(true);
          expect(_.isFunction(res.next)).toBe(true);

          expect(SharedUtil.redirect).toHaveBeenCalledWith(
            'https://foo.com/login/sessionCookieRedirect?checkAccountSetupComplete=true' +
              '&token=THE_SESSION_TOKEN&redirectUrl=http%3A%2F%2Fbaz.com%2Ffoo'
          );
          expect(SharedUtil.redirect).toHaveBeenCalledWith(
            'http://foo.okta.com/login/token/redirect?stateToken=aStateToken'
          );
        });
    }
  );
  it('logs an error on unrecoverable errors if no globalErrorFn is defined', function() {
    const fn = function() {
      setup({ foo: 'bar' });
    };

    spyOn(CourageLogger, 'warn');
    expect(fn).not.toThrow('field not allowed: foo');
    expectUnexpectedFieldLog('foo');
  });
  it('calls globalErrorFn on unrecoverable errors if it is defined', function() {
    const errorSpy = jasmine.createSpy('errorSpy');

    const fn = function() {
      setup({ globalErrorFn: errorSpy, baseUrl: undefined, authClient: undefined });
    };

    expect(fn).not.toThrow();
    const err = errorSpy.calls.mostRecent().args[0];

    expect(err.name).toBe('CONFIG_ERROR');
    expect(err.message).toEqual('"baseUrl" is a required widget parameter');
  });
  it('calls globalErrorFn if colors.brand is in rgb format', function() {
    const errorSpy = jasmine.createSpy('errorSpy');
    const colors = {
      brand: 'rgb(255,0,0)',
    };

    const fn = function() {
      setup({ globalErrorFn: errorSpy, colors });
    };

    expect(fn).not.toThrow();
    const err = errorSpy.calls.mostRecent().args[0];

    expect(err.name).toBe('CONFIG_ERROR');
    expect(err.message).toEqual('"colors.brand" must be in six-digit hex format');
  });
  it('calls globalErrorFn if colors.brand is in color name format', function() {
    const errorSpy = jasmine.createSpy('errorSpy');
    const colors = {
      brand: 'red',
    };

    const fn = function() {
      setup({ globalErrorFn: errorSpy, colors });
    };

    expect(fn).not.toThrow();
    const err = errorSpy.calls.mostRecent().args[0];

    expect(err.name).toBe('CONFIG_ERROR');
    expect(err.message).toEqual('"colors.brand" must be in six-digit hex format');
  });
  it('does not call globalErrorFn if colors.brand is in 6 digits Hex format', function() {
    const errorSpy = jasmine.createSpy('errorSpy');
    const colors = {
      brand: '#FF0000',
    };

    const fn = function() {
      setup({ globalErrorFn: errorSpy, colors: colors });
    };

    expect(fn).not.toThrow();
    expect(errorSpy).not.toHaveBeenCalled();
  });
  it('calls globalErrorFn if cors is not supported by the browser', function() {
    const errorSpy = jasmine.createSpy('errorSpy');

    spyOn(BrowserFeatures, 'corsIsNotSupported').and.returnValue(true);

    const fn = function() {
      setup({ globalErrorFn: errorSpy });
    };

    expect(fn).not.toThrow();
    const err = errorSpy.calls.mostRecent().args[0];

    expect(err instanceof UnsupportedBrowserError).toBe(true);
    expect(err.name).toBe('UNSUPPORTED_BROWSER_ERROR');
    expect(err.message).toEqual('Unsupported browser - missing CORS support');
  });
  itp('uses default router navigate if features.router param is true', function() {
    spyOn(Router.prototype, 'navigate');
    return setup({ 'features.router': true }).then(function(test) {
      test.router.navigate('signin/forgot-password', { trigger: true });
      expect(Router.prototype.navigate).toHaveBeenCalledWith('signin/forgot-password', { trigger: true });
    });
  });
  itp('uses history loadUrl if features.router param is false', function() {
    spyOn(Router.prototype, 'navigate');
    spyOn(Backbone.history, 'loadUrl');
    return setup({ 'features.router': false }).then(function(test) {
      test.router.navigate('signin/forgot-password', { trigger: true });
      expect(Router.prototype.navigate).not.toHaveBeenCalled();
      expect(Backbone.history.loadUrl).toHaveBeenCalledWith('signin/forgot-password');
    });
  });
  itp('navigates to PrimaryAuth if requesting a stateful url without a stateToken', function() {
    return expectPrimaryAuthRender({}, 'signin/recovery-question');
  });
  itp('navigates to IDPDiscovery if features.idpDiscovery is set to true', function() {
    return setup({ 'features.idpDiscovery': true })
      .then(function(test) {
        Util.mockRouterNavigate(test.router);
        test.router.navigate('');
        return Expect.waitForIDPDiscovery();
      })
      .then(function() {
        const form = new IDPDiscoveryForm($sandbox);

        expect(form.isIDPDiscovery()).toBe(true);
      });
  });
  itp('navigates to IDPDiscovery for /login/login.htm when features.idpDiscovery is true', function() {
    return setup({ 'features.idpDiscovery': true })
      .then(function(test) {
        Util.mockRouterNavigate(test.router);
        test.router.navigate('login/login.htm');
        return Expect.waitForIDPDiscovery();
      })
      .then(function() {
        const form = new IDPDiscoveryForm($sandbox);

        expect(form.isIDPDiscovery()).toBe(true);
      });
  });
  itp('navigates to PrimaryAuth for /login/login.htm when features.idpDiscovery is false', function() {
    return expectPrimaryAuthRender({}, 'login/login.htm');
  });
  itp('navigates to IDPDiscovery for /app/salesforce/{id}/sso/saml when features.idpDiscovery is true', function() {
    return setup({ 'features.idpDiscovery': true })
      .then(function(test) {
        Util.mockRouterNavigate(test.router);
        test.router.navigate('/app/salesforce/abc123sef/sso/saml');
        return Expect.waitForIDPDiscovery();
      })
      .then(function() {
        const form = new IDPDiscoveryForm($sandbox);

        expect(form.isIDPDiscovery()).toBe(true);
      });
  });
  itp('navigates to PrimaryAuth for /app/salesforce/{id}/sso/saml when features.idpDiscovery is false', function() {
    return expectPrimaryAuthRender({ 'features.idpDiscovery': false }, '/app/salesforce/abc123sef/sso/saml');
  });
  itp('navigates to IDPDiscovery for /any/other when features.idpDiscovery is true', function() {
    return setup({ 'features.idpDiscovery': true })
      .then(function(test) {
        Util.mockRouterNavigate(test.router);
        test.router.navigate('any/other');
        return Expect.waitForIDPDiscovery();
      })
      .then(function() {
        const form = new IDPDiscoveryForm($sandbox);

        expect(form.isIDPDiscovery()).toBe(true);
      });
  });
  itp('navigates to PrimaryAuth for /any/other when features.idpDiscovery is false', function() {
    return expectPrimaryAuthRender({ 'features.idpDiscovery': false }, 'any/other');
  });
  itp('refreshes auth state on stateful url if it needs a refresh', function() {
    return setup({}, resRecovery)
      .then(function(test) {
        Util.mockRouterNavigate(test.router);
        Util.mockSDKCookie(test.ac);
        test.setNextResponse(resRecovery);
        test.router.navigate('signin/recovery-question');
        return Expect.waitForRecoveryQuestion();
      })
      .then(function() {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn',
          data: {
            stateToken: 'testStateToken',
          },
        });
        const form = new RecoveryForm($sandbox);

        expect(form.isRecoveryQuestion()).toBe(true);
      });
  });
  itp('calls status and redirects if initialized with a stateToken', function() {
    return setup({ stateToken: 'dummy-token' }, resRecovery)
      .then(function(test) {
        Util.mockRouterNavigate(test.router);
        test.setNextResponse(resRecovery);
        test.router.navigate('');
        return Expect.waitForRecoveryQuestion();
      })
      .then(function() {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/introspect',
          data: {
            stateToken: 'dummy-token',
          },
        });
        const form = new RecoveryForm($sandbox);

        expect(form.isRecoveryQuestion()).toBe(true);
      });
  });

  itp('navigates to PrimaryAuth and shows a flash error if the stateToken expires', async function() {
    // flashError is set in RouterUtil, shown in courage BaseForm method: __showErrors
    // BaseLoginRouter will see the flashError and trigger the error on PrimaryAuth model after render 
    const test = await setup({}, resRecovery);
    Util.mockRouterNavigate(test.router);
    test.setNextResponse(resRecovery);
    test.router.refreshAuthState('dummy-token');
    await Expect.waitForRecoveryQuestion(test);
    
    test.setNextResponse(errorInvalidToken);
    let form = new RecoveryForm($sandbox);

    form.setAnswer('4444');
    form.submit();
    await Expect.waitForPrimaryAuth(test);

    expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
    expect(test.afterErrorHandler.calls.allArgs()).toEqual([
      [
        { controller: 'primary-auth' },
        {
          name: 'AuthApiError',
          message: 'Invalid token provided',
          statusCode: 401,
          xhr: {
            status: 401,
            headers: { 'content-type': 'application/json' },
            responseType: 'json',
            responseText: '{"errorCode":"E0000011","errorSummary":"Invalid token provided","errorLink":"E0000011","errorId":"oaeuiUWCPr6TUSkOclgVGlWqw","errorCauses":[]}',
            responseJSON: {
              errorCode: 'E0000011',
              errorSummary: 'Invalid token provided',
              errorLink: 'E0000011',
              errorId: 'oaeuiUWCPr6TUSkOclgVGlWqw',
              errorCauses: [],
            },
          },
        },
      ],
    ]);
    
    form = new PrimaryAuthForm($sandbox);
    expect(form.isPrimaryAuth()).toBe(true);
    expect(form.hasErrors()).toBe(true);
    expect(form.errorMessage()).toBe('Your session has expired. Please try to sign in again.');

    // Submit the form and verify that we no longer have the flash error message
    test.setNextResponse(resMfa);
    form.setUsername('testuser');
    form.setPassword('pass');
    form.submit();
    await Expect.waitForMfaVerify(test);

    form = new MfaVerifyForm($sandbox);

    expect(form.isSecurityQuestion()).toBe(true);
    expect(form.hasErrors()).toBe(false);
  });
  itp('navigates to ErrorState page and shows a flash error if the stateToken expires', function() {
    return setup({'features.mfaOnlyFlow': true }, resRecovery)
      .then(function(test) {
        Util.mockRouterNavigate(test.router);
        test.setNextResponse(resRecovery);
        test.router.refreshAuthState('dummy-token');
        return Expect.waitForRecoveryQuestion(test);
      })
      .then(function(test) {
        test.setNextResponse(errorInvalidToken);
        const form = new RecoveryForm($sandbox);

        form.setAnswer('4444');
        form.submit();
        return Expect.waitForErrorState(test);
      })
      .then(function(test) {
        expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
        expect(test.afterErrorHandler.calls.allArgs()).toEqual([
          [
            { controller: 'error-state' },
            {
              name: 'AuthApiError',
              message: 'Invalid token provided',
              statusCode: 401,
              xhr: {
                status: 401,
                headers: { 'content-type': 'application/json' },
                responseType: 'json',
                responseText: '{"errorCode":"E0000011","errorSummary":"Invalid token provided","errorLink":"E0000011","errorId":"oaeuiUWCPr6TUSkOclgVGlWqw","errorCauses":[]}',
                responseJSON: {
                  errorCode: 'E0000011',
                  errorSummary: 'Invalid token provided',
                  errorLink: 'E0000011',
                  errorId: 'oaeuiUWCPr6TUSkOclgVGlWqw',
                  errorCauses: [],
                },
              },
            },
          ],
        ]);
        const form = new ErrorStateForm($sandbox);
        expect(form.isErrorStateView()).toBe(true);
        expect(form.hasErrors()).toBe(true);
        expect(form.errorMessage()).toBe('Unable to authenticate at this time.');
      });
  });
  itp('navigates to PrimaryAuth if status is UNAUTHENTICATED, and IDP_DISCOVERY is disabled', function() {
    return setup({ stateToken: 'dummy-token' }, resUnauthenticated)
      .then(function(test) {
        Util.mockRouterNavigate(test.router);
        test.setNextResponse(resUnauthenticated);
        test.router.navigate('/app/sso');
        return Expect.waitForPrimaryAuth(test);
      })
      .then(function(test) {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/introspect',
          data: {
            stateToken: 'dummy-token',
          },
        });
        expect(test.router.appState.get('isUnauthenticated')).toBe(true);
        const form = new PrimaryAuthForm($sandbox);

        expect(form.isPrimaryAuth()).toBe(true);
      });
  });
  itp('navigates to IDPDiscovery if status is UNAUTHENTICATED, and IDP_DISCOVERY is enabled', function() {
    return setup({ stateToken: 'dummy-token', 'features.idpDiscovery': true }, resUnauthenticated)
      .then(function(test) {
        Util.mockRouterNavigate(test.router);
        test.setNextResponse(resUnauthenticated);
        test.router.navigate('/app/sso');
        return Expect.waitForIDPDiscovery(test);
      })
      .then(function(test) {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/introspect',
          data: {
            stateToken: 'dummy-token',
          },
        });
        expect(test.router.appState.get('isUnauthenticated')).toBe(true);
        const form = new IDPDiscoveryForm($sandbox);

        expect(form.isIDPDiscovery()).toBe(true);
      });
  });
  itp('navigates to default route when status is UNAUTHENTICATED', function() {
    return setup({ stateToken: 'aStateToken' }, resUnauthenticated)
      .then(function(test) {
        Util.mockRouterNavigate(test.router);
        test.setNextResponse(resUnauthenticated);
        test.router.navigate('/app/sso');
        return Expect.waitForPrimaryAuth(test);
      })
      .then(function(test) {
        expect(test.router.navigate).toHaveBeenCalledWith('', { trigger: true });
      });
  });
  itp('triggers an afterRender event when routing to default route and when status is UNAUTHENTICATED', function() {
    return setup({ stateToken: 'aStateToken' }, resUnauthenticated)
      .then(function(test) {
        Util.mockRouterNavigate(test.router);
        test.setNextResponse(resUnauthenticated);
        test.router.navigate('/app/sso');
        return Expect.waitForPrimaryAuth(test);
      })
      .then(function(test) {
        expect(test.router.navigate).toHaveBeenCalledWith('', { trigger: true });
        expect(test.afterRenderHandler).toHaveBeenCalledTimes(2);
        expect(test.afterRenderHandler.calls.allArgs()[0]).toEqual([{ controller: 'refresh-auth-state' }]);
        expect(test.afterRenderHandler.calls.allArgs()[1]).toEqual([{ controller: 'primary-auth' }]);
      });
  });
  itp('does not show two forms if the duo fetchInitialData request fails with an expired stateToken', function() {
    Util.mockDuo();
    return setup()
      .then(function(test) {
        Util.mockRouterNavigate(test.router);
        test.router.primaryAuth();
        return Expect.waitForPrimaryAuth(test);
      })
      .then(function(test) {
        test.setNextResponse([resMfaRequiredDuo, errorInvalidToken]);
        const form = new PrimaryAuthForm($sandbox);

        form.setUsername('testuser');
        form.setPassword('pass');
        form.submit();
        return Expect.waitForAjaxRequests(2, test);
      })
      .then(function() {
        // 2nd form will appear until the fail() handler is called in BaseLoginRouter. With Q this happens on the next tick.
        return Expect.wait(() => {
          const form = new PrimaryAuthForm($sandbox);
          // If we don't have our fix, there will be two PrimaryAuth forms

          return form.usernameField().length === 1;
        });
      });
  });

  itp('makes a call to previous if the page is refreshed in an MFA_CHALLENGE state', function() {
    return setup({}, resMfaChallengeDuo)
      .then(function(test) {
        Util.mockRouterNavigate(test.router);
        Util.mockSDKCookie(test.ac);
        test.setNextResponse([resMfaChallengeDuo, resMfa]);
        test.router.navigate('signin/verify/duo/web', { trigger: true });
        return Expect.waitForMfaVerify(test);
      })
      .then(function() {
        const form = new MfaVerifyForm($sandbox);
        // Expect that we are on the MFA_CHALLENGE page (default is push for this
        // response)

        expect(form.isSecurityQuestion()).toBe(true);
        return Expect.wait(() => {
          return Util.numAjaxRequests() === 2;
        });
      });
  });
  itp('checks auto push by default for a returning user with autoPush true', function() {
    return setup({ 'features.autoPush': true })
      .then(function(test) {
        Util.mockRouterNavigate(test.router);
        test.router.navigate('signin');
        return Expect.waitForPrimaryAuth(test);
      })
      .then(function(test) {
        const form = new PrimaryAuthForm($sandbox);

        expect(form.isPrimaryAuth()).toBe(true);
        // Respond with MFA_REQUIRED
        // Verify is immediately called, so respond with MFA_CHALLENGE
        const resAutoPushTrue = Util.getAutoPushResponse(resMfaRequiredOktaVerify, true);

        test.setNextResponse([resAutoPushTrue, resMfaChallengePush]);
        form.setUsername('testuser');
        form.setPassword('pass');
        form.submit();
        return Expect.waitForMfaVerify();
      })
      .then(function() {
        const form = new MfaVerifyForm($sandbox);

        expect(form.autoPushCheckbox().length).toBe(1);
        expect(form.isAutoPushChecked()).toBe(true);
        return Expect.wait(() => {
          return Util.numAjaxRequests() === 2;
        }, form);
      })
      .then(function(form) {
        expect(form.isPushSent()).toBe(true);
        expect(Util.numAjaxRequests()).toBe(2);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn',
          data: {
            password: 'pass',
            username: 'testuser',
            options: {
              warnBeforePasswordExpired: true,
              multiOptionalFactorEnroll: false,
            },
          },
        });
        Expect.isJsonPost(Util.getAjaxRequest(1), {
          url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify?autoPush=true&rememberDevice=false',
          data: {
            stateToken: 'testStateToken',
          },
        });
      });
  });
  itp('no auto push for a new user', function() {
    return setup({ 'features.autoPush': true })
      .then(function(test) {
        Util.mockRouterNavigate(test.router);
        test.router.navigate('signin');
        return Expect.waitForPrimaryAuth(test);
      })
      .then(function(test) {
        const form = new PrimaryAuthForm($sandbox);

        expect(form.isPrimaryAuth()).toBe(true);
        test.setNextResponse(resMfaRequiredOktaVerify);
        form.setUsername('testuser');
        form.setPassword('pass');
        form.submit();
        return Expect.waitForMfaVerify();
      })
      .then(function() {
        const form = new MfaVerifyForm($sandbox);

        expect(form.autoPushCheckbox().length).toBe(1);
        expect(form.isAutoPushChecked()).toBe(false);
        expect(form.isPushSent()).toBe(false);
      });
  });
  itp('sends autoPush=false as url param when auto push checkbox is unchecked', function() {
    return setup({ 'features.autoPush': true })
      .then(function(test) {
        Util.mockRouterNavigate(test.router);
        test.router.navigate('signin');
        return Expect.waitForPrimaryAuth(test);
      })
      .then(function(test) {
        const form = new PrimaryAuthForm($sandbox);

        expect(form.isPrimaryAuth()).toBe(true);
        test.setNextResponse(resMfaRequiredOktaVerify);
        form.setUsername('testuser');
        form.setPassword('pass');
        form.submit();
        return Expect.waitForMfaVerify(test);
      })
      .then(function(test) {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn',
          data: {
            password: 'pass',
            username: 'testuser',
            options: {
              warnBeforePasswordExpired: true,
              multiOptionalFactorEnroll: false,
            },
          },
        });
        Util.resetAjaxRequests();
        test.setNextResponse(resMfaChallengePush);
        const form = new MfaVerifyForm($sandbox);

        form.submit();
        return Expect.waitForAjaxRequest();
      })
      .then(function() {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/factors/opfhw7v2OnxKpftO40g3/verify?autoPush=false&rememberDevice=false',
          data: {
            stateToken: 'testStateToken',
          },
        });
      });
  });
  itp('can call remove if not rendered', function() {
    return setup()
      .then(function(test) {
        const fn = function() {
          test.router.remove();
        };
        expect(fn).not.toThrowError();
      });
  });

  Expect.describe('OIDC - okta is the idp and oauth2 is enabled', function() {
    function expectAuthorizeUrl(url, options) {
      const parsed = new URL(url);
      const params = parsed.searchParams;
      const authorizeUrl = options.authorizeUrl || 'https://foo.com/oauth2/v1/authorize';
      const state = options.state || OIDC_STATE;
      const nonce = options.nonce || OIDC_NONCE;
      const clientId = 'someClientId';
      const redirectUri = 'https://0.0.0.0:9999';
      const sessionToken = 'THE_SESSION_TOKEN';
      const scope = 'openid email';
      const responseType = options.responseType;
      const responseMode = options.responseMode;

      expect(parsed.origin + parsed.pathname).toBe(authorizeUrl);
      expect(params.get('state')).toBe(state);
      expect(params.get('nonce')).toBe(nonce);
      expect(params.get('client_id')).toBe(clientId);
      expect(params.get('redirect_uri')).toBe(redirectUri);
      expect(params.get('response_type')).toBe(responseType);
      expect(params.get('response_mode')).toBe(responseMode || null);
      expect(params.get('sessionToken')).toBe(sessionToken);
      expect(params.get('scope')).toBe(scope);

      if (options.display) {
        expect(params.get('display')).toBe(options.display);
      }

      if (options.prompt) {
        expect(params.get('prompt')).toBe(options.prompt);
      }

      if (options.code_challenge_method) {
        expect(params.get('code_challenge_method')).toBe(options.code_challenge_method);
        expect(params.get('code_challenge')).toBeTruthy();
      }
    }

    function expectCodeRedirect(options) {
      return function(test) {
        const spy = test.setLocationSpy;

        return Expect.waitForSpyCall(spy).then(function() {
          expect(spy.calls.count()).toBe(1);
          expectAuthorizeUrl(spy.calls.argsFor(0)[0], options);
        });
      };
    }

    itp('can use implicit flow', function() {
      return setupOAuth2({
        'authParams.pkce': false
      }).then(test => {
        expectAuthorizeUrl(test.iframeElem.src, {
          responseType: 'token id_token',
          responseMode: 'okta_post_message',
          prompt: 'none',
        });
        Expect.isNotVisible($(test.iframeElem));
      });
    });

    itp('can redirect with implicit flow', function() {
      return setupOAuth2({
        'redirect': 'always',
        'authParams.pkce': false,
      }, { expectRedirect: true }).then(
        expectCodeRedirect({
          responseType: 'token id_token'
        })
      );
    });

    itp('authorization_code flow: redirects instead of using an iframe', function() {
      return setupOAuth2({
        'authParams.responseType': 'code',
        'authParams.pkce': false
      }, { expectRedirect: true }).then(expectCodeRedirect({ responseType: 'code' }));
    });
    itp('authorization_code flow: redirects to alternate authorizeUrl', function() {
      return setupOAuth2({
        'authParams.responseType': 'code',
        'authParams.pkce': false,
        'authParams.authorizeUrl': 'https://altfoo.com/oauth2/v1/authorize',
      }, { expectRedirect: true }).then(
        expectCodeRedirect({
          authorizeUrl: 'https://altfoo.com/oauth2/v1/authorize',
          responseType: 'code',
        })
      );
    });
    itp('authorization_code flow: redirects to alternate authorizeUrl if an alternate issuer is provided', function() {
      return setupOAuth2({
        'authParams.responseType': 'code',
        'authParams.pkce': false,
        'authParams.issuer': 'https://altfoo.com',
      }, { expectRedirect: true }).then(
        expectCodeRedirect({
          authorizeUrl: 'https://altfoo.com/oauth2/v1/authorize',
          responseType: 'code',
        })
      );
    });
    itp('authorization_code flow: redirects to alternate authorizeUrl if an alternate issuer and alternate authorizeUrl is provided',
      function() {
        return setupOAuth2({
          'authParams.responseType': 'code',
          'authParams.pkce': false,
          'authParams.issuer': 'https://altfoo.com',
          'authParams.authorizeUrl': 'https://reallyaltfoo.com/oauth2/v1/authorize',
        }, { expectRedirect: true }).then(
          expectCodeRedirect({
            authorizeUrl: 'https://reallyaltfoo.com/oauth2/v1/authorize',
            responseType: 'code',
          })
        );
      }
    );
    itp('authorization_code flow: redirects with alternate state provided', function() {
      return setupOAuth2({
        'authParams.responseType': 'code',
        'authParams.pkce': false,
        'authParams.state': 'myalternatestate',
      }, { expectRedirect: true }).then(
        expectCodeRedirect({
          state: 'myalternatestate',
          responseType: 'code',
        })
      );
    });
    itp('authorization_code flow: redirects with alternate nonce provided', function() {
      return setupOAuth2({
        'authParams.responseType': 'code',
        'authParams.pkce': false,
        'authParams.nonce': 'myalternatenonce',
      }, { expectRedirect: true }).then(
        expectCodeRedirect({
          nonce: 'myalternatenonce',
          responseType: 'code',
        })
      );
    });
    itp('authorization_code flow: redirects with alternate state and nonce provided', function() {
      return setupOAuth2({
        'authParams.responseType': 'code',
        'authParams.pkce': false,
        'authParams.state': 'myalternatestate',
        'authParams.nonce': 'myalternatenonce',
      }, { expectRedirect: true }).then(
        expectCodeRedirect({
          state: 'myalternatestate',
          nonce: 'myalternatenonce',
          responseType: 'code',
        })
      );
    });
    itp('removes the iframe when it returns with the redirect data', function() {
      return setupOAuth2({}, { mockWellKnown: true }).then(function() {
        return Expect.waitForWindowListener('message');
      }).then(function() {
        const args = window.addEventListener.calls.mostRecent().args;
        const callback = args[1];
        expect($sandbox.find('#' + OIDC_IFRAME_ID).length).toBe(1);
        Util.loadWellKnownAndKeysCache();
        callback.call(null, {
          origin: 'https://foo.com',
          data: {
            id_token: VALID_ID_TOKEN,
            state: OIDC_STATE,
          },
        });
        return Expect.wait(function() {
          return $sandbox.find('#' + OIDC_IFRAME_ID).length === 0;
        });
      });
    });
    itp('invokes the success function with idToken and user data when the iframe returns with data', function() {
      Util.loadWellKnownAndKeysCache();
      const successSpy = jasmine.createSpy('successSpy');

      // In this test the id token will be returned succesfully. It must pass all validation.
      // Mock the date to 10 seconds after token was issued.
      const AUTH_TIME = (1451606400) * 1000; // The time the "VALID_ID_TOKEN" was issued
      MockDate.set(new Date(AUTH_TIME + 10000));

      return setupOAuth2({ globalSuccessFn: successSpy }, { mockWellKnown: true })
        .then(function(test) {
          return Expect.waitForWindowListener('message', test);
        })
        .then(function() {
          const args = window.addEventListener.calls.mostRecent().args;
          // Simulate callback from an iframe
          const callback = args[1];
          callback.call(null, {
            origin: 'https://foo.com',
            data: {
              id_token: VALID_ID_TOKEN,
              state: OIDC_STATE,
            },
          });
          return Expect.waitForSpyCall(successSpy);
        })
        .then(function() {
          expect(successSpy.calls.count()).toBe(1);
          const data = successSpy.calls.argsFor(0)[0];

          expect(data.status).toBe('SUCCESS');
          expect(data.tokens.idToken.idToken).toBe(VALID_ID_TOKEN);
          expect(data.tokens.idToken.claims).toEqual({
            amr: ['pwd'],
            aud: 'someClientId',
            auth_time: 1451606400,
            email: 'samljackson@gack.me',
            email_verified: true,
            exp: 1609459200,
            family_name: 'Jackson',
            given_name: 'Saml',
            iat: 1451606400,
            idp: '0oaidiw9udOSceDqw0g3',
            nonce: OIDC_NONCE,
            idp_type: 'FACEBOOK',
            iss: 'https://foo.com',
            login: 'samljackson@gack.me',
            name: 'Saml Jackson',
            profile: 'https://www.facebook.com/app_scoped_user_id/122819658076357/',
            sub: '00uiltNQK2Wszs2RV0g3',
            updated_at: 1451606400,
            ver: 1,
          });
        });
    });
    itp('triggers the afterError event if an idToken is not returned', function() {
      return setupOAuth2({}, { mockWellKnown: true })
        .then(function(test) {
          return Expect.waitForWindowListener('message', test);
        }).then(function(test) {
          const args = window.addEventListener.calls.mostRecent().args;
          const callback = args[1];
          callback.call(null, {
            origin: 'https://foo.com',
            data: {
              state: OIDC_STATE,
              error: 'invalid_client',
              error_description: 'Invalid value for client_id parameter.',
            },
          });
          return Expect.waitForSpyCall(test.afterErrorHandler, test);
        })
        .then(function(test) {
          expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
          expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
            {
              controller: 'mfa-verify',
            },
            {
              name: 'OAUTH_ERROR',
              message: 'Invalid value for client_id parameter.',
            },
          ]);
        });
    });
  });

  Expect.describe('Events', function() {
    itp('triggers a pageRendered event when first controller is loaded', function() {
      return setup()
        .then(function(test) {
          test.router.primaryAuth();
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function(test) {
          expect(test.eventSpy.calls.count()).toBe(1);
          expect(test.eventSpy).toHaveBeenCalledWith({ page: 'primary-auth' });
        });
    });
    itp('triggers an afterRender event when first controller is loaded', function() {
      return setup()
        .then(function(test) {
          test.router.primaryAuth();
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function(test) {
          expect(test.afterRenderHandler).toHaveBeenCalledTimes(1);
          expect(test.afterRenderHandler).toHaveBeenCalledWith({ controller: 'primary-auth' });
        });
    });
    itp('triggers both pageRendered and afterRender events when first controller is loaded', function() {
      return setup()
        .then(function(test) {
          test.router.primaryAuth();
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function(test) {
          expect(test.eventSpy).toHaveBeenCalledTimes(1);
          expect(test.eventSpy).toHaveBeenCalledWith({ page: 'primary-auth' });
          expect(test.afterRenderHandler).toHaveBeenCalledTimes(1);
          expect(test.afterRenderHandler).toHaveBeenCalledWith({ controller: 'primary-auth' });
        });
    });
    itp('triggers a pageRendered event when navigating to a new controller', function() {
      return setup()
        .then(function(test) {
          // Test navigation from primary Auth to Forgot password page
          test.router.primaryAuth();
          Util.mockRouterNavigate(test.router);
          test.router.navigate('signin/forgot-password');
          return Expect.waitForForgotPassword(test);
        })
        .then(function(test) {
          // since the event is triggered from the success function of the animation
          // as well as after render, we expect two calls
          expect(test.eventSpy.calls.count()).toBe(2);
          expect(test.eventSpy.calls.allArgs()[0]).toEqual([{ page: 'forgot-password' }]);
          expect(test.eventSpy.calls.allArgs()[1]).toEqual([{ page: 'forgot-password' }]);
        });
    });
    itp('triggers an afterRender event when navigating to a new controller', function() {
      return setup()
        .then(function(test) {
          // Test navigation from primary Auth to Forgot password page
          test.router.primaryAuth();
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function(test) {
          expect(test.afterRenderHandler).toHaveBeenCalledTimes(1);
          expect(test.afterRenderHandler.calls.allArgs()[0]).toEqual([{ controller: 'primary-auth' }]);
          Util.mockRouterNavigate(test.router);
          test.router.navigate('signin/forgot-password');
          return Expect.waitForForgotPassword(test);
        })
        .then(function(test) {
          // since the event is triggered from the success function of the animation
          // as well as after render, we expect two calls
          expect(test.afterRenderHandler).toHaveBeenCalledTimes(2);
          expect(test.afterRenderHandler.calls.allArgs()[1]).toEqual([{ controller: 'forgot-password' }]);
        });
    });
  });

  Expect.describe('Config: "i18n"', function() {
    itp('supports deprecated "labels" and "country" options no locatl storage', function() {
      return setupLanguage({
        settings: {
          labels: {
            'enroll.call.setup': 'test override title',
          },
          country: {
            JP: 'Nihon',
          },
        },
        localStorageIsNotSupported: true,
      }).then(function(test) {
        test.form.selectCountry('JP');
        expect(test.form.titleText()).toBe('test override title');
        expect(test.form.selectedCountry()).toBe('Nihon');
        Expect.deprecated('Use "i18n" instead of "labels" and "country"');
      });
    });
    itp('supports deprecated "labels" and "country" options', function() {
      return setupLanguage({
        settings: {
          labels: {
            'enroll.call.setup': 'test override title',
          },
          country: {
            JP: 'Nihon',
          },
        },
        localStorageIsNotSupported: false,
      }).then(function(test) {
        test.form.selectCountry('JP');
        expect(test.form.titleText()).toBe('test override title');
        expect(test.form.selectedCountry()).toBe('Nihon');
        Expect.deprecated('Use "i18n" instead of "labels" and "country"');
      });
    });
    itp('overrides text in the login bundle', function() {
      return setupLanguage({
        settings: {
          i18n: {
            en: {
              'enroll.call.setup': 'test override title',
            },
          },
        },
      }).then(function(test) {
        expect(test.form.titleText()).toBe('test override title');
      });
    });
    itp(
      'overrides text in the login bundle if language field and key in i18n object is in different cases',
      function() {
        return setupLanguage({
          mockLanguageRequest: 'zz-zz',
          settings: {
            language: 'zz-zz',
            i18n: {
              'zz-ZZ': {
                'enroll.call.setup': 'custom label',
              },
            },
          },
        }).then(function(test) {
          expect(test.form.titleText()).toBe('custom label');
        });
      }
    );
    itp(
      'overrides text in the login bundle if language field and key in i18n object is in different cases',
      function() {
        return setupLanguage({
          mockLanguageRequest: 'zz-ZZ',
          settings: {
            language: 'zz-ZZ',
            i18n: {
              'zz-zz': {
                'enroll.call.setup': 'custom label',
              },
            },
          },
        }).then(function(test) {
          expect(test.form.titleText()).toBe('custom label');
        });
      }
    );
    itp(
      'overrides text in the login bundle if language field and key in i18n object is in different cases',
      function() {
        return setupLanguage({
          mockLanguageRequest: 'nl',
          settings: {
            language: 'nl',
            i18n: {
              NL: {
                'enroll.call.setup': 'custom label',
              },
            },
          },
        }).then(function(test) {
          expect(test.form.titleText()).toBe('custom label');
        });
      }
    );
    itp(
      'overrides text in the login bundle if language field and key in i18n object is in different cases',
      function() {
        return setupLanguage({
          mockLanguageRequest: 'NL',
          settings: {
            language: 'NL',
            i18n: {
              nl: {
                'enroll.call.setup': 'custom label',
              },
            },
          },
        }).then(function(test) {
          expect(test.form.titleText()).toBe('custom label');
        });
      }
    );
    itp('uses "country.COUNTRY" to override text in the country bundle', function() {
      return setupLanguage({
        settings: {
          i18n: {
            en: {
              'country.JP': 'Nihon',
            },
          },
        },
      }).then(function(test) {
        test.form.selectCountry('JP');
        expect(test.form.selectedCountry()).toBe('Nihon');
      });
    });
    itp('uses "country.COUNTRY" to override text in the country bundle no local storage', function() {
      return setupLanguage({
        settings: {
          i18n: {
            en: {
              'country.JP': 'Nihon',
            },
          },
        },
        localStorageIsNotSupported: true,
      }).then(function(test) {
        test.form.selectCountry('JP');
        expect(test.form.selectedCountry()).toBe('Nihon');
      });
    });

    itp('overrides text in the courage bundle for non English language', function() {
      return setupLanguage({
        mockLanguageRequest: 'NL',
        settings: {
          language: 'NL',
          i18n: {
            nl: {
              'oform.errorbanner.title': 'Dutch error banner title',
            },
          },
        },
      }).then(function(test) {
        test.form.submit();
        expect(test.form.errorMessage()).toBe('Dutch error banner title');
      });
    });

    itp('Strings in courage bundle are in jp as set in settings.language', function() {
      return setupLanguage({
        mockLanguageRequest: 'ja',
        settings: {
          language: 'ja',
        },
      }).then(function(test) {
        test.form.submit();
        expect(test.form.errorMessage()).toBe('JA: Japanese error banner title');
      });
    });

    itp('Strings in courage bundle are in en by default', function() {
      return setupLanguage({}).then(function(test) {
        test.form.submit();
        expect(test.form.errorMessage()).toBe('We found some errors. Please review the form and make corrections.');
      });
    });

    itp(
      'Sends the default accept lang header en with API calls if widget is not configured with a language',
      function() {
        const success = jasmine.createSpy('successSpy');

        return setupLanguage({
          settings: {
            globalSuccessFn: success,
          },
        })
          .then(function(test) {
            test.setNextResponse(resSuccess);
            test.router.navigate('');
            return Expect.waitForPrimaryAuth(test);
          })
          .then(function(test) {
            const form = new PrimaryAuthForm($sandbox);

            expect(form.isPrimaryAuth()).toBe(true);
            form.setUsername('testuser');
            form.setPassword('testpassword');
            form.submit();
            expect(Util.lastAjaxRequest().requestHeaders['accept-language']).toBe('en');

            // Wait for login success
            return Expect.waitForSpyCall(success, test);
          });
      }
    );

    itp('Sends the right accept lang header with API calls if widget is configured with a language', function() {
      const success = jasmine.createSpy('successSpy');

      return setupLanguage({
        mockLanguageRequest: 'ja',
        settings: {
          globalSuccessFn: success,
          language: 'ja',
        },
      })
        .then(function(test) {
          test.setNextResponse(resSuccess);
          test.router.navigate('');
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function(test) {
          const form = new PrimaryAuthForm($sandbox);

          expect(form.isPrimaryAuth()).toBe(true);
          form.setUsername('testuser');
          form.setPassword('testpassword');
          form.submit();
          expect(Util.lastAjaxRequest().requestHeaders['accept-language']).toBe('ja');

          // Wait for login success
          return Expect.waitForSpyCall(success, test);
        });
    });
  });

  Expect.describe('Config: "assets"', function() {
    function expectBundles(baseUrl, login, country) {
      expect(Util.numAjaxRequests()).toBe(3);
      const loginCall = Util.getAjaxRequest(0);
      const countryCall = Util.getAjaxRequest(1);

      Expect.isJsonAssetRequest(loginCall, {
        url: baseUrl + login,
      });
      Expect.isJsonAssetRequest(countryCall, {
        url: baseUrl + country,
      });
    }

    const expectDefaultPaths = _.partial(
      expectBundles,
      _,
      '/labels/json/login_ja.json',
      '/labels/json/country_ja.json'
    );

    const expectDefaultCdn = _.partial(expectBundles, 'https://global.oktacdn.com/okta-signin-widget/9.9.99');

    itp('loads properties from the cdn if no baseUrl and path overrides are supplied', function() {
      return setupLanguage({
        mockLanguageRequest: 'ja',
        settings: {
          language: 'ja',
        },
      }).then(function() {
        expectDefaultPaths('https://global.oktacdn.com/okta-signin-widget/9.9.99');
      });
    });
    itp('loads properties from the given baseUrl', function() {
      return setupLanguage({
        mockLanguageRequest: 'ja',
        settings: {
          language: 'ja',
          assets: {
            baseUrl: 'http://foo.com',
          },
        },
      }).then(function() {
        expectDefaultPaths('http://foo.com');
      });
    });
    itp('will clean up any trailing slashes in baseUrl', function() {
      return setupLanguage({
        mockLanguageRequest: 'ja',
        settings: {
          language: 'ja',
          assets: {
            baseUrl: 'http://foo.com/',
          },
        },
      }).then(function() {
        expectDefaultPaths('http://foo.com');
      });
    });
    itp('can override bundle paths with rewrite', function() {
      return setupLanguage({
        mockLanguageRequest: 'ja',
        settings: {
          language: 'ja',
          assets: {
            rewrite: function(file) {
              return file.replace('.json', '.sha.json');
            },
          },
        },
      }).then(function() {
        expectDefaultCdn('/labels/json/login_ja.sha.json', '/labels/json/country_ja.sha.json');
      });
    });
    itp('can override bundles with both baseUrl and rewrite', function() {
      return setupLanguage({
        mockLanguageRequest: 'ja',
        settings: {
          language: 'ja',
          assets: {
            baseUrl: 'http://foo.com',
            rewrite: function(file) {
              return file.replace('.json', '.1.json');
            },
          },
        },
      }).then(function() {
        expectBundles('http://foo.com', '/labels/json/login_ja.1.json', '/labels/json/country_ja.1.json');
      });
    });
  });

  Expect.describe('Config: "language"', function() {
    function expectLanguage(titleText, countryText, test) {
      test.form.selectCountry('JP');
      expect(test.form.selectedCountry()).toBe(countryText);
      expect(test.form.titleText()).toBe(titleText);
      return test;
    }

    const expectEn = _.partial(expectLanguage, 'Follow phone call instructions to authenticate', 'Japan');

    const expectJa = _.partial(expectLanguage, 'JA: enroll.call.setup', 'JA: country.JP');

    const expectZz = _.partial(expectLanguage, 'ZZ: enroll.call.setup', 'ZZ: country.JP');

    Expect.describe('Choosing a language', function() {
      itp('defaults to english if "language" is not specified and there are no user languages detected', function() {
        return setupLanguage({
          userLanguages: [],
        }).then(expectEn);
      });
      itp('uses the first match of user language and supported language if user languages detected', function() {
        return setupLanguage({
          userLanguages: ['ja', 'ko', 'en'],
          mockLanguageRequest: 'ja',
        }).then(expectJa);
      });
      itp('will ignore case differences when finding languages, i.e. for Safari', function() {
        return setupLanguage({
          userLanguages: ['pt-br', 'ja'],
          mockLanguageRequest: 'ja',
          settings: {
            assets: {
              baseUrl: '/assets',
            },
          },
        }).then(function() {
          const loginCall = Util.getAjaxRequest(0);
          const countryCall = Util.getAjaxRequest(1);

          expect(loginCall.url).toBe('/assets/labels/json/login_pt_BR.json');
          expect(countryCall.url).toBe('/assets/labels/json/country_pt_BR.json');
        });
      });
      itp('will use base languageCode even if region is not supported', function() {
        return setupLanguage({
          userLanguages: ['ja-ZZ', 'ko', 'en'],
          mockLanguageRequest: 'ja',
          settings: {
            assets: {
              baseUrl: '/assets',
            },
          },
        }).then(function(test) {
          expectJa(test);
          const loginCall = Util.getAjaxRequest(0);
          const countryCall = Util.getAjaxRequest(1);

          expect(loginCall.url).toBe('/assets/labels/json/login_ja.json');
          expect(countryCall.url).toBe('/assets/labels/json/country_ja.json');
        });
      });
      itp('will use base languageCode with region even if dialect is not supported', function() {
        return setupLanguage({
          userLanguages: ['pt-BR-zz', 'ko', 'en'],
          mockLanguageRequest: 'ja',
          settings: {
            assets: {
              baseUrl: '/assets',
            },
          },
        }).then(function(test) {
          expectJa(test);
          const loginCall = Util.getAjaxRequest(0);
          const countryCall = Util.getAjaxRequest(1);

          expect(loginCall.url).toBe('/assets/labels/json/login_pt_BR.json');
          expect(countryCall.url).toBe('/assets/labels/json/country_pt_BR.json');
        });
      });
      itp('accepts a language code string as "language"', function() {
        return setupLanguage({
          mockLanguageRequest: 'ja',
          settings: {
            language: 'ja',
          },
        }).then(expectJa);
      });
      itp('accepts a function that returns a language code', function() {
        return setupLanguage({
          mockLanguageRequest: 'ja',
          settings: {
            language: function() {
              return 'ja';
            },
          },
        }).then(expectJa);
      });
      itp('passes the list of supported languages and user languages to the function', function() {
        const spy = jasmine.createSpy('language').and.returnValue('en');

        return setupLanguage({
          settings: {
            language: spy,
          },
          userLanguages: ['ja', 'ko', 'en'],
        }).then(function() {
          expect(spy.calls.count()).toBe(1);
          const args = spy.calls.argsFor(0);
          const supported = args[0];
          const userLanguages = args[1];

          expect(userLanguages).toEqual(['ja', 'ko', 'en']);
          expect(supported).toEqual([
            'en',
            'cs',
            'da',
            'de',
            'el',
            'es',
            'fi',
            'fr',
            'hu',
            'id',
            'in',
            'it',
            'ja',
            'ko',
            'ms',
            'nb',
            'nl-NL',
            'ok-PL',
            'ok-SK',
            'pl',
            'pt-BR',
            'ro',
            'ru',
            'sv',
            'th',
            'tr',
            'uk',
            'vi',
            'zh-CN',
            'zh-TW',
          ]);
        });
      });
      itp(
        'allows the developer to pass in a new language and will add that to the list of supported languages',
        function() {
          const spy = jasmine.createSpy('language').and.returnValue('zz-zz');

          return setupLanguage({
            mockLanguageRequest: 'zz-zz',
            settings: {
              language: spy,
              i18n: {
                'zz-zz': {
                  'enroll.call.setup': 'ZZ: enroll.call.setup',
                  'country.JP': 'ZZ: country.JP',
                },
              },
            },
          }).then(function(test) {
            const supported = spy.calls.argsFor(0)[0];

            expect(supported).toContain('zz-zz');
            expectZz(test);
          });
        }
      );
      itp('will default to detection if the "language" property does not return a supported language', function() {
        return setupLanguage({
          mockLanguageRequest: 'ja',
          userLanguages: ['ja'],
          settings: {
            language: 'yy-YY',
          },
        }).then(expectJa);
      });
    });

    Expect.describe('Behavior', function() {
      itp('shows a spinner until the language is loaded if it takes longer than 200ms (i.e. ajax request)', function() {
        return setupLanguage({
          delay: 300, // TODO: remove delay
          mockLanguageRequest: 'ja',
          settings: {
            language: 'ja',
          },
        }).then(function(test) {
          // 2 for the initial refreshAuthState call, and 2 for our spinner
          expect(test.loadingSpy.calls.count()).toBe(4);
          expect(test.loadingSpy.calls.argsFor(2)[0]).toBe(true);
          expect(test.loadingSpy.calls.argsFor(3)[0]).toBe(false);
        });
      });
      itp('can load a new language dynamically by updating the appState', function() {
        return setupLanguage({
          settings: {
            i18n: {
              'zz-zz': {
                'enroll.call.setup': 'ZZ: enroll.call.setup',
                'country.JP': 'ZZ: country.JP',
              },
            },
          },
        })
          .then(expectEn)
          .then(function(test) {
            // The new language will be rendered on the next router render, but we need
            // navigate away from the page first for the wait to work.
            test.router.forgotPassword();
            return Expect.waitForForgotPassword(test);
          })
          .then(function(test) {
            test.router.appState.set('languageCode', 'zz-zz');
            expectUnsuportedLanguageLoad(test);
            test.router.enrollCall();
            return Expect.waitForEnrollCall(test);
          })
          .then(expectZz);
      });
      itp('caches the language after the initial fetch', function() {
        spyOn(Storage.prototype, 'setItem').and.callThrough();
        return setupLanguage({
          mockLanguageRequest: 'ja',
          settings: {
            language: 'ja',
          },
        }).then(function() {
          expect(localStorage.setItem).toHaveBeenCalledWith(
            'osw.languages',
            JSON.stringify({
              version: '9.9.99',
              ja: {
                login: {
                  'enroll.call.setup': 'JA: enroll.call.setup',
                  'security.disliked_food': 'JA: What is the food you least liked as a child?',
                  'oform.errorbanner.title': 'JA: Japanese error banner title',
                },
                country: {
                  JP: 'JA: country.JP',
                },
              },
            })
          );
        });
      });
      itp('fetches from the cache if it is available', function() {
        spyOn(Storage.prototype, 'getItem').and.callFake(function(key) {
          if (key === 'osw.languages') {
            return JSON.stringify({
              version: '9.9.99',
              ja: {
                login: {
                  'enroll.call.setup': 'JA: enroll.call.setup',
                  'security.disliked_food': 'JA: What is the food you least liked as a child?',
                },
                country: {
                  JP: 'JA: country.JP',
                },
              },
            });
          }
        });
        return setupLanguage({
          // Note: No mocked request because it should be pulled from localStorage
          settings: {
            language: 'ja',
          },
        }).then(expectJa);
      });
      itp('fetches language again (even if its cached) after the osw version is updated', function() {
        spyOn(Storage.prototype, 'getItem').and.callFake(function(key) {
          if (key === 'osw.languages') {
            return JSON.stringify({
              version: '0.0.00',
              ja: {
                login: {
                  'enroll.call.setup': 'JA: some different string',
                },
                country: {
                  JP: 'JA: some other country value',
                },
              },
            });
          }
        });
        return setupLanguage({
          mockLanguageRequest: 'ja',
          settings: {
            language: 'ja',
          },
        }).then(expectJa);
      });
      itp('will default i18n to english if properties do not exist in a given language', function() {
        return setupLanguage({
          settings: {
            i18n: {
              'zz-ZZ': {
                'enroll.call.setup': 'ZZ: enroll.call.setup',
                'country.JP': 'ZZ: country.JP',
              },
            },
          },
        }).then(function(test) {
          expect(test.form.submitButtonText()).toBe('Verify');
        });
      });
    });
  });

  itp('should not be visible until initial render', async function() {
    const test = await setup();

    // Should not be visible on init
    Expect.isNotVisible(test.router.header.$el);

    // Should not be visible until initial data has been loaded
    spyOn(PrimaryAuthController.prototype, 'fetchInitialData').and.callFake(function() {
      Expect.isNotVisible(test.router.header.$el);
      return Promise.resolve();
    });

    // Should be visible after render
    await test.router.render(PrimaryAuthController, { Beacon: SecurityBeacon });
    Expect.isVisible(test.router.header.$el);
    expect(test.afterRenderHandler).toHaveBeenCalledTimes(1);
  });
});
