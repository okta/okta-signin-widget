/* eslint max-params:[0, 2] */
import { $ } from 'okta';
import IdentifierForm from 'helpers/dom/v2/IdentifierForm';
import TerminalView from 'helpers/dom/v2/TerminalView';
import MockUtil from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import idxResponse from 'helpers/xhr/v2/IDX_IDENTIFY';
import errorFeatureNotEnabled from 'helpers/xhr/v2/ERROR_FEATURE_NOT_ENABLED';
import idxVerifyPassword from 'helpers/xhr/v2/IDX_VERIFY_PASSWORD';
import idxSuccessInteractionCode from 'helpers/xhr/v2/IDX_SUCCESS_INTERACTION_CODE';
import idxErrorUserIsNotAssigned from 'helpers/xhr/v2/IDX_ERROR_USER_IS_NOT_ASSIGNED';
import idxErrorSessionExpired from 'helpers/xhr/v2/IDX_ERROR_SESSION_EXPIRED';
import xhrTerminalSuccessEmailVerify from '../../../playground/mocks/data/idp/idx/terminal-return-email-consent.json';
import xhrTerminalSuccessWithCancelAction from '../../../playground/mocks/data/idp/idx/user-account-unlock-success.json';

import 'jasmine-ajax';
import $sandbox from 'sandbox';
import Logger from 'util/Logger';
import Widget from 'exports/default';

const url = 'https://foo.com';
const issuer = `${url}/oauth2/default`;
const itp = Expect.itp;

describe('OktaSignIn v2 bootstrap', function() {
  let signIn;
  let codeVerifier;
  let codeChallenge;
  let codeChallengeMethod;
  let withCredentials;

  beforeEach(function() {
    jest.spyOn(Logger, 'error').mockImplementation(() => { });
    jest.spyOn(console, 'warn').mockImplementation(() => { });
    signIn = null;
    codeVerifier = 'fakecodeVerifier';
    codeChallenge = 'fakecodeChallenge';
    codeChallengeMethod = 'fakecodeChallengeMethod';
    withCredentials = true;
  });

  afterEach(function() {
    sessionStorage.clear();
    localStorage.clear();
    signIn && signIn.remove();
  });

  function setupLoginFlow(widgetOptions, responses) {
    signIn = new Widget(
      Object.assign(
        {
          baseUrl: url,
        },
        widgetOptions || {}
      )
    );
    jest.spyOn(signIn.authClient.token, 'prepareTokenParams').mockResolvedValue({
      codeVerifier,
      codeChallenge,
      codeChallengeMethod,
      scopes: ['a', 'b', 'c']
    });
    jest.spyOn(signIn.authClient.transactionManager, 'save');
    MockUtil.mockAjax(responses);

    // Add customize parser for ION request
    jasmine.Ajax.addCustomParamParser({
      test: function(xhr) {
        return xhr.contentType().indexOf('application/ion+json;') >= 0;
      },
      parse: function jsonParser(paramString) {
        return JSON.parse(paramString);
      },
    });
  }

  function render() {
    return signIn.renderEl({ el: $sandbox });
  }

  function setupProxyIdxResponse(options) {
    signIn = new Widget(
      Object.assign(
        {
          baseUrl: url,
          proxyIdxResponse: {
            deviceEnrollment: {
              type: 'object',
              value: {
                name: options.enrollmentType,
                platform: 'IOS',
                enrollmentLink: 'https://sampleEnrollmentlink.com',
                vendor: 'Airwatch',
                signInUrl: 'https://idx.okta1.com'
              }
            }
          }
        },
        options || {}
      )
    );
  }

  describe('Introspects token and loads Identifier view for new pipeline', function() {
    itp('calls introspect API on page load', function() {
      const form = new IdentifierForm($sandbox);
      setupLoginFlow({ stateToken: '02stateToken' }, idxResponse);
      render();
      return Expect.wait(() => {
        return $('.siw-main-body').length === 1;
      }).then(function() {
        expect(form.getTitle()).toBe('Sign In');
        expect(form.getIdentifierInput().length).toBe(1);
        expect(form.getIdentifierInput().attr('name')).toBe('identifier');
        expect(form.getFormSaveButton().attr('value')).toBe('Next');

        expect(jasmine.Ajax.requests.count()).toBe(1);
        const firstReq = jasmine.Ajax.requests.first();

        expect(firstReq.data()).toEqual({ stateToken: '02stateToken' });
        expect(firstReq.method).toBe('POST');
        expect(firstReq.url).toBe('https://foo.com/idp/idx/introspect');
      });
    });

  });

  describe('Interaction code flow', function() {
    let responses;
    let interactionHandle;
    let interactResponse;

    beforeEach(function() {
      interactionHandle = 'fake_interaction_handle';
      interactResponse = {
        state: 200,
        responseType: 'json',
        response: {
          'interaction_handle': interactionHandle
        },
      };
      responses = [
        interactResponse,
        idxResponse
      ];
    });

    itp('calls interact API on page load in custom hosted widget', function() {
      const form = new IdentifierForm($sandbox);
      setupLoginFlow({
        clientId: 'someClientId',
        redirectUri: 'http://0.0.0.0:9999'
      }, responses);
      jest.spyOn(signIn.authClient.transactionManager, 'exists').mockReturnValue(false);
      render();
      return Expect.wait(() => {
        return $('.siw-main-body').length === 1;
      }).then(function() {
        expect(form.getTitle()).toBe('Sign In');
        expect(form.getIdentifierInput().length).toBe(1);
        expect(form.getIdentifierInput().attr('name')).toBe('identifier');
        expect(form.getFormSaveButton().attr('value')).toBe('Next');

        expect(jasmine.Ajax.requests.count()).toBe(2);
        const firstReq = jasmine.Ajax.requests.at(0);
        const secondReq = jasmine.Ajax.requests.at(1);

        expect(firstReq.method).toBe('POST');
        expect(firstReq.url).toBe('https://foo.com/oauth2/default/v1/interact');
        expect(secondReq.method).toBe('POST');
        expect(secondReq.url).toBe('https://foo.com/idp/idx/introspect');
      });
    });

    describe('shows error when IDENTITY_ENGINE feature is not enabled', () => {
      itp('shows translated error when i18n is available', async () => {
        const view = new TerminalView($sandbox);
        const testStr = 'This is a test string';
        setupLoginFlow({
          clientId: 'someClientId',
          redirectUri: 'http://0.0.0.0:9999',
          language: 'en',
          i18n: {
            en: {
              'oie.feature.disabled': testStr
            }
          }
        }, [
          errorFeatureNotEnabled
        ]);

        let didThrow = false;
        try {
          await render();
        } catch (e) {
          didThrow = true;
          expect(e).toMatchObject({
            'error': 'access_denied',
            'error_description': 'The requested feature is not enabled in this environment.',
          });
        }
        expect(didThrow).toBe(true);
        expect($('.siw-main-view.terminal').length).toBe(1);
        expect(view.getErrorMessages()).toBe(testStr);
      });
      itp('shows untranslated error when i18n is not available', async () => {
        const view = new TerminalView($sandbox);
        const testStr = 'The requested feature is not enabled in this environment.';
        setupLoginFlow({
          clientId: 'someClientId',
          redirectUri: 'http://0.0.0.0:9999',
        }, [
          errorFeatureNotEnabled
        ]);
        let didThrow = false;
        try {
          await render();
        } catch (e) {
          didThrow = true;
          expect(e).toMatchObject({
            'error': 'access_denied',
            'error_description': 'The requested feature is not enabled in this environment.',
          });
        }
        expect(didThrow).toBe(true);
        expect($('.siw-main-view.terminal').length).toBe(1);
        expect(view.getErrorMessages()).toBe(testStr);
      });
    });

    describe('Saved transaction meta', () => {
      itp('Saves the interaction handle', () => {
        setupLoginFlow({
          clientId: 'someClientId',
          redirectUri: 'http://0.0.0.0:9999',
        }, responses);

        jest.spyOn(signIn.authClient.transactionManager, 'exists').mockReturnValue(false);
        jest.spyOn(signIn.authClient.transactionManager, 'load').mockReturnValue({});
        render();

        return Expect.wait(() => {
          return $('.siw-main-body').length === 1;
        }).then(function() {
          expect(signIn.authClient.transactionManager.save).toHaveBeenCalledWith({
            flow: 'default',
            codeChallenge,
            codeVerifier,
            codeChallengeMethod,
            scopes: ['a', 'b', 'c'],
            interactionHandle,
            issuer,
            urls: {
              authorizeUrl: `${issuer}/v1/authorize`,
              issuer,
              logoutUrl: `${issuer}/v1/logout`,
              revokeUrl: `${issuer}/v1/revoke`,
              tokenUrl: `${issuer}/v1/token`,
              userinfoUrl: `${issuer}/v1/userinfo`,
            },
            withCredentials
          }, { muteWarning: true });
        });
      });

      itp('Saves the configured flow', () => {
        setupLoginFlow({
          clientId: 'someClientId',
          redirectUri: 'http://0.0.0.0:9999',
          flow: 'login'
        }, responses);

        jest.spyOn(signIn.authClient.transactionManager, 'exists').mockReturnValue(false);
        jest.spyOn(signIn.authClient.transactionManager, 'load').mockReturnValue({});
        render();

        return Expect.wait(() => {
          return $('.siw-main-body').length === 1;
        }).then(function() {
          expect(signIn.authClient.transactionManager.save).toHaveBeenCalledWith({
            flow: 'login',
            codeChallenge,
            codeVerifier,
            codeChallengeMethod,
            scopes: ['a', 'b', 'c'],
            interactionHandle,
            issuer,
            urls: {
              authorizeUrl: `${issuer}/v1/authorize`,
              issuer,
              logoutUrl: `${issuer}/v1/logout`,
              revokeUrl: `${issuer}/v1/revoke`,
              tokenUrl: `${issuer}/v1/token`,
              userinfoUrl: `${issuer}/v1/userinfo`,
            },
            withCredentials
          }, { muteWarning: true });
        });
      });

      itp('Saves the codeChallenge and codeChallengeMethod', () => {
        setupLoginFlow({
          clientId: 'someClientId',
          redirectUri: 'http://0.0.0.0:9999',
          codeChallenge: 'custom',
          codeChallengeMethod: 'custom-method'
        }, responses);
        signIn.authClient.token.prepareTokenParams.mockResolvedValue({
          codeChallenge: 'custom',
          codeChallengeMethod: 'custom-method',
          scopes: ['a', 'b', 'c'],
        });
        jest.spyOn(signIn.authClient.transactionManager, 'exists').mockReturnValue(false);
        jest.spyOn(signIn.authClient.transactionManager, 'load').mockReturnValue({});
        render();

        return Expect.wait(() => {
          return $('.siw-main-body').length === 1;
        }).then(function() {
          expect(signIn.authClient.transactionManager.save).toHaveBeenCalledWith({
            flow: 'default',
            codeVerifier: undefined,
            codeChallenge: 'custom',
            codeChallengeMethod: 'custom-method',
            scopes: ['a', 'b', 'c'],
            interactionHandle,
            issuer,
            urls: {
              authorizeUrl: `${issuer}/v1/authorize`,
              issuer,
              logoutUrl: `${issuer}/v1/logout`,
              revokeUrl: `${issuer}/v1/revoke`,
              tokenUrl: `${issuer}/v1/token`,
              userinfoUrl: `${issuer}/v1/userinfo`,
            },
            withCredentials
          }, { muteWarning: true });
        });
      });
    });

    itp('Loads a saved interaction handle', () => {
      const clientId = 'someClientId';
      const redirectUri = 'http://0.0.0.0:9999';
      setupLoginFlow({
        clientId,
        redirectUri,
      }, [idxResponse]);

      const savedInteractionHandle = 'saved-interaction-handle';
      jest.spyOn(signIn.authClient.transactionManager, 'exists').mockReturnValue(true);
      jest.spyOn(signIn.authClient.transactionManager, 'load').mockReturnValue({
        interactionHandle: savedInteractionHandle,
        codeVerifier,
        codeChallenge,
        codeChallengeMethod,

        // Needed for isTransactionMetaValid
        clientId,
        redirectUri,
        issuer
      });
      render();

      return Expect.wait(() => {
        return $('.siw-main-body').length === 1;
      }).then(function() {

        expect(jasmine.Ajax.requests.count()).toBe(1);
        const firstReq = jasmine.Ajax.requests.at(0);

        expect(firstReq.method).toBe('POST');
        expect(firstReq.url).toBe('https://foo.com/idp/idx/introspect');
        expect(firstReq.data()).toEqual({ interactionHandle: savedInteractionHandle });

        expect(signIn.authClient.transactionManager.load).toHaveBeenCalled();
      });
    });

    describe('Clears saved transaction meta', () => {
      let clientId;
      let redirectUri;
      let mockTransactionMeta;
      beforeEach(() => {
        clientId = 'someClientId';
        redirectUri = 'http://0.0.0.0:9999';
        mockTransactionMeta = {
          interactionHandle,
          codeVerifier,
          codeChallenge,
          codeChallengeMethod,
          clientId,
          redirectUri,
          issuer
        };
      });

      itp('clears after successful login', () => {

        setupLoginFlow({
          clientId,
          redirectUri,
        }, [
          idxSuccessInteractionCode, 
          // token success
          {
            state: 200,
            responseType: 'json',
            response: {
              'access_token': 'fake_access_token'
            }
          }
        ]);
        jest.spyOn(signIn.authClient.transactionManager, 'clear').mockImplementation(() => { });
        jest.spyOn(signIn.authClient.transactionManager, 'exists').mockReturnValue(true);
        jest.spyOn(signIn.authClient.transactionManager, 'load').mockReturnValue(mockTransactionMeta);
        jest.spyOn(signIn.authClient.token, 'exchangeCodeForTokens').mockResolvedValue({
          tokens: {}
        });

        return render().then(function() {
          expect(signIn.authClient.transactionManager.clear).toHaveBeenCalled();
        });
      });

      itp('clears after terminal success (with no available actions)', () => {
        setupLoginFlow({
          clientId,
          redirectUri,
        }, [
          // email verify terminal success (flow continued in other tab)
          {
            state: 200,
            responseType: 'json',
            response: xhrTerminalSuccessEmailVerify
          }
        ]);
        jest.spyOn(signIn.authClient.transactionManager, 'clear').mockImplementation(() => { });
        jest.spyOn(signIn.authClient.transactionManager, 'exists').mockReturnValue(true);
        jest.spyOn(signIn.authClient.transactionManager, 'load').mockReturnValue(mockTransactionMeta);

        render();
        return Expect.wait(() => {
          return $('.siw-main-view.terminal').length === 1;
        }).then(function() {
          expect(signIn.authClient.transactionManager.clear).toHaveBeenCalledWith({ clearSharedStorage: false });
        });
      });

      itp('does NOT clear on terminal success if there are available actions', () => {
        setupLoginFlow({
          clientId,
          redirectUri,
        }, [
          // terminal success with a cancel action
          {
            state: 200,
            responseType: 'json',
            response: xhrTerminalSuccessWithCancelAction
          }
        ]);
        jest.spyOn(signIn.authClient.transactionManager, 'clear').mockImplementation(() => { });
        jest.spyOn(signIn.authClient.transactionManager, 'exists').mockReturnValue(true);
        jest.spyOn(signIn.authClient.transactionManager, 'load').mockReturnValue(mockTransactionMeta);
        render();
        return Expect.wait(() => {
          return $('.siw-main-view.terminal').length === 1;
        }).then(function() {
          expect(signIn.authClient.transactionManager.clear).not.toHaveBeenCalled();
        });
      });

      itp('does NOT clear on terminal error', () => {
        setupLoginFlow({
          clientId,
          redirectUri,
        }, [
          idxErrorSessionExpired
        ]);
        jest.spyOn(signIn.authClient.transactionManager, 'clear').mockImplementation(() => { });
        jest.spyOn(signIn.authClient.transactionManager, 'exists').mockReturnValue(true);
        jest.spyOn(signIn.authClient.transactionManager, 'load').mockReturnValue(mockTransactionMeta);
        render();
        return Expect.wait(() => {
          return $('.siw-main-view.terminal').length === 1;
        }).then(function() {
          expect(signIn.authClient.transactionManager.clear).not.toHaveBeenCalled();
        });
      });

      itp('does NOT clear on recoverable error', () => {
        setupLoginFlow({
          clientId,
          redirectUri,
        }, [
          idxErrorUserIsNotAssigned
        ]);
        jest.spyOn(signIn.authClient.transactionManager, 'clear').mockImplementation(() => { });
        jest.spyOn(signIn.authClient.transactionManager, 'exists').mockReturnValue(true);
        jest.spyOn(signIn.authClient.transactionManager, 'load').mockReturnValue(mockTransactionMeta);
        render();
        return Expect.wait(() => {
          return $('.siw-main-body').length === 1;
        }).then(function() {
          expect(signIn.authClient.transactionManager.clear).not.toHaveBeenCalled();
        });
      });

      itp('Clears when user chooses "cancel" action', async () => {
        setupLoginFlow({
          clientId,
          redirectUri,
        }, [
          interactResponse,
          idxVerifyPassword,
          // in interaction code flow it will not call cancel, it will simply start a new transaction
          interactResponse,
          idxResponse
        ]);
        render();

        await Expect.wait(() => {
          return $('.siw-main-view.mfa-verify-password').length === 1;
        });
        jest.spyOn(signIn.authClient.transactionManager, 'clear');
        const $signOut = $('a[data-se="cancel"]');
        $signOut.click();
        expect(signIn.authClient.transactionManager.clear).toHaveBeenCalled(); // assert data is cleared synchronously

        // login flow will restart
        await Expect.wait(() => {
          return $('.siw-main-view.primary-auth').length === 1;
        });
        
      });
    }); // Clear transaction
  }); // interaction code

  itp('Gets proxyIdxResponse and render terminal view', function() {
    setupProxyIdxResponse({ enrollmentType: 'mdm' });
    render();
    return Expect.wait(() => {
      return $('.siw-main-body').length === 1;
    });
  });
});
