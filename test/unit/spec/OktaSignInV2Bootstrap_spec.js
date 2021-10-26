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
import 'jasmine-ajax';
import $sandbox from 'sandbox';
import Logger from 'util/Logger';
import Widget from 'widget/OktaSignIn';

const url = 'https://foo.com';
const itp = Expect.itp;

describe('OktaSignIn v2 bootstrap', function() {
  let signIn;
  let codeVerifier;
  let codeChallenge;
  let codeChallengeMethod;

  beforeEach(function() {
    jest.spyOn(Logger, 'error').mockImplementation(() => { });
    signIn = null;
    codeVerifier = 'fakecodeVerifier';
    codeChallenge = 'fakecodeChallenge';
    codeChallengeMethod = 'fakecodeChallengeMethod';
  });

  afterEach(function() {
    sessionStorage.clear();
    signIn && signIn.remove();
  });

  function setupLoginFlow(widgetOptions, responses) {
    signIn = new Widget(
      Object.assign(
        {
          baseUrl: url,
          apiVersion: '1.0.0',
          features: {
            router: true,
          },
        },
        widgetOptions || {}
      )
    );
    jest.spyOn(signIn.authClient.token, 'prepareTokenParams').mockResolvedValue({
      codeVerifier,
      codeChallenge,
      codeChallengeMethod
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
    itp('calls introspect API on page load using idx-js as client', function() {
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

    itp('throws an error if invalid version is passed to idx-js', function() {
      setupLoginFlow({
        stateToken: '02stateToken',
        apiVersion: '2.0.0'
      }, idxResponse);

      return render().catch(err => {
        expect(err.name).toBe('Error');
        expect(err.message.toString()).toEqual('Unknown api version: 2.0.0.  Use an exact semver version.');
      });
    });
  });

  describe('Interaction code flow', function() {
    let responses;
    let interactionHandle;

    beforeEach(function() {
      interactionHandle = 'fake_interaction_handle';
      responses = [
        {
          state: 200,
          responseType: 'json',
          response: {
            'interaction_handle': interactionHandle
          },
        },
        idxResponse
      ];
    });

    itp('calls interact API on page load using idx-js as client in custom hosted widget', function() {
      const form = new IdentifierForm($sandbox);
      setupLoginFlow({
        clientId: 'someClientId',
        redirectUri: 'http://0.0.0.0:9999',
        useInteractionCodeFlow: true
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

    itp('throws an error if invalid version is passed to idx-js', function() {
      setupLoginFlow({
        apiVersion: '2.0.0',
        clientId: 'someClientId',
        redirectUri: 'http://0.0.0.0:9999',
        useInteractionCodeFlow: true
      }, responses);
      jest.spyOn(signIn.authClient.transactionManager, 'exists').mockReturnValue(false);
      return render().catch(err => {
        expect(err.name).toBe('Error');
        expect(err.message.toString()).toEqual('Unknown api version: 2.0.0.  Use an exact semver version.');
      });
    });

    describe('shows error when IDENTITY_ENGINE feature is not enabled', () => {
      itp('shows translated error when i18n is available', () => {
        const view = new TerminalView($sandbox);
        const testStr = 'This is a test string';
        setupLoginFlow({
          clientId: 'someClientId',
          redirectUri: 'http://0.0.0.0:9999',
          useInteractionCodeFlow: true,
          language: 'en',
          i18n: {
            en: {
              'oie.feature.disabled': testStr
            }
          }
        }, [
          errorFeatureNotEnabled
        ]);
        render();
        return Expect.wait(() => {
          return $('.siw-main-view.terminal').length === 1;
        }).then(function() {
          expect(view.getErrorMessages()).toBe(testStr);
        });
      });
      itp('shows untranslated error when i18n is not available', () => {
        const view = new TerminalView($sandbox);
        const testStr = 'The requested feature is not enabled in this environment.';
        setupLoginFlow({
          clientId: 'someClientId',
          redirectUri: 'http://0.0.0.0:9999',
          useInteractionCodeFlow: true,
        }, [
          errorFeatureNotEnabled
        ]);
        render();
        return Expect.wait(() => {
          return $('.siw-main-view.terminal').length === 1;
        }).then(function() {
          expect(view.getErrorMessages()).toBe(testStr);
        });
      });
    });

    itp('Saves the interaction handle', () => {
      setupLoginFlow({
        clientId: 'someClientId',
        redirectUri: 'http://0.0.0.0:9999',
        useInteractionCodeFlow: true
      }, responses);

      jest.spyOn(signIn.authClient.transactionManager, 'exists').mockReturnValue(false);
      jest.spyOn(signIn.authClient.transactionManager, 'load').mockReturnValue({});
      render();

      return Expect.wait(() => {
        return $('.siw-main-body').length === 1;
      }).then(function() {
        expect(signIn.authClient.transactionManager.save).toHaveBeenCalledWith({
          codeChallenge,
          codeVerifier,
          codeChallengeMethod,
          interactionHandle
        });
      });
    });

    itp('Loads a saved interaction handle', () => {
      const clientId = 'someClientId';
      const redirectUri = 'http://0.0.0.0:9999';
      setupLoginFlow({
        clientId,
        redirectUri,
        useInteractionCodeFlow: true
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
        redirectUri
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
        expect(signIn.authClient.transactionManager.save).toHaveBeenCalledWith({
          codeChallenge,
          codeVerifier,
          codeChallengeMethod,
          interactionHandle: savedInteractionHandle,
          clientId,
          redirectUri
        });
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
          redirectUri
        };
      });

      itp('clears after successful login', () => {

        setupLoginFlow({
          clientId,
          redirectUri,
          useInteractionCodeFlow: true
        }, [
          idxSuccessInteractionCode, {
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

      itp('does NOT clear on permanent error', () => {
        setupLoginFlow({
          clientId,
          redirectUri,
          useInteractionCodeFlow: true
        }, [
          idxErrorSessionExpired
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

      itp('does NOT clear on recoverable error', () => {
        setupLoginFlow({
          clientId,
          redirectUri,
          useInteractionCodeFlow: true
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

      itp('Clears when user chooses "cancel" action', () => {
        setupLoginFlow({
          clientId,
          redirectUri,
          useInteractionCodeFlow: true
        }, [
          idxVerifyPassword,
          // cancel response
          {
            state: 200,
            responseType: 'json',
            response: {}
          }
        ]);
        // simulate saved transaction
        jest.spyOn(signIn.authClient.transactionManager, 'clear').mockImplementation(() => { });
        jest.spyOn(signIn.authClient.transactionManager, 'exists').mockReturnValue(true);
        jest.spyOn(signIn.authClient.transactionManager, 'load').mockReturnValue(mockTransactionMeta);
        render();

        return Expect.wait(() => {
          return $('.siw-main-body').length === 1;
        }).then(function() {
          expect(signIn.authClient.transactionManager.clear).not.toHaveBeenCalled();
          const $signOut = $('a[data-se="cancel"]');
          $signOut.click();
          expect(signIn.authClient.transactionManager.clear).toHaveBeenCalled();
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
