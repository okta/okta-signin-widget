import EnrollWebauthnView from 'v2/view-builder/views/webauthn/EnrollWebauthnView';
import { BaseForm } from 'v2/view-builder/internals';
import CryptoUtil from 'util/CryptoUtil';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import webauthn from 'util/webauthn';
import $sandbox from 'sandbox';
import BrowserFeatures from 'util/BrowserFeatures';
import Expect from 'helpers/util/Expect';
import EnrollWebauthnResponse from '../../../../../../playground/mocks/data/idp/idx/authenticator-enroll-webauthn.json';
import EnrollWebauthnPasskeysResponse from '../../../../../../playground/mocks/data/idp/idx/authenticator-enroll-webauthn-passkeys.json';
import EnrollWebauthnCustomResponse from '../../../../../../playground/mocks/data/idp/idx/authenticator-enroll-webauthn-custom.json';

describe('v2/view-builder/views/webauthn/EnrollWebauthnView', function() {
  let testContext;
  beforeEach(function() {
    testContext = {};
    testContext.init = (
      currentAuthenticator = EnrollWebauthnResponse.currentAuthenticator.value,
      authenticatorEnrollments = [],
      // `hasSkipRemediation` lets a regression guard simulate a standard enroll
      // response that unexpectedly ships a sibling `skip` — we still don't want
      // to render the promotion-specific "Maybe later" link there.
      { hasSkipRemediation = false } = {},
    ) => {
      const currentViewState = {
        name: 'enroll-authenticator',
        relatesTo: {
          value: currentAuthenticator,
        },
      };
      const appState = new AppState({
        currentAuthenticator,
        authenticatorEnrollments,
      }, {});
      spyOn(appState, 'getRemediationAuthenticationOptions').and.callFake(formName => {
        if (formName === 'select-authenticator-enroll') {
          return [ { label: 'some authenticator '} ];
        }
        return [];
      });
      spyOn(appState, 'shouldShowSignOutLinkInCurrentForm').and.returnValue(false);
      // EnrollWebauthnView's Footer gates the skip link on the presence of the
      // `enroll-authenticator-promotion` remediation. Standard enroll never
      // reports that remediation, so the skip link is always suppressed here.
      spyOn(appState, 'hasRemediationObject').and.callFake(
        (formName) => formName === 'skip' && hasSkipRemediation
      );
      const settings = new Settings({ baseUrl: 'http://localhost:3000' });
      testContext.view = new EnrollWebauthnView({
        el: $sandbox,
        appState,
        settings,
        currentViewState,
      });
      testContext.view.render();
    };

    // Renders the view under the `enroll-authenticator-promotion` remediation.
    // `hasSkipRemediation` controls whether `appState.hasRemediationObject('skip')`
    // returns true — the response ships with a sibling `skip` remediation, but tests
    // toggle it off to verify the skip link is absent. The footer separately checks
    // for `enroll-authenticator-promotion` to gate the promotion-labelled skip link.
    testContext.initPromotion = (
      currentAuthenticator = EnrollWebauthnPasskeysResponse.currentAuthenticator.value,
      { hasSkipRemediation = true, authenticatorEnrollments = [] } = {},
    ) => {
      const currentViewState = {
        name: 'enroll-authenticator-promotion',
        relatesTo: {
          value: currentAuthenticator,
        },
      };
      const appState = new AppState({
        currentAuthenticator,
        authenticatorEnrollments,
      }, {});
      spyOn(appState, 'getRemediationAuthenticationOptions').and.returnValue([]);
      spyOn(appState, 'shouldShowSignOutLinkInCurrentForm').and.returnValue(false);
      spyOn(appState, 'hasRemediationObject').and.callFake(
        (formName) => (
          formName === 'enroll-authenticator-promotion'
          || (formName === 'skip' && hasSkipRemediation)
        )
      );
      const settings = new Settings({ baseUrl: 'http://localhost:3000' });
      testContext.view = new EnrollWebauthnView({
        el: $sandbox,
        appState,
        settings,
        currentViewState,
      });
      testContext.view.render();
    };
  });

  afterEach(function() {
    $sandbox.empty();
  });

  it('shows enroll instructions and setup button when browser supports webauthn', function() {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    testContext.init();
    expect(testContext.view.$('.idx-webauthn-enroll-text').text()).toBe(
      'You will be prompted to register a security key or biometric authenticator (Windows Hello, Touch ID, Face ID, etc.). Follow the instructions to complete set up.'
    );
    expect(testContext.view.$('.webauthn-setup').css('display')).not.toBe('none'); // default value: empty string in jest, 'inline' in browser
    expect(testContext.view.$('.webauthn-setup').text()).toBe('Set up');
    expect(testContext.view.$('.idx-webauthn-enroll-text-edge').length).toBe(0);
    expect(testContext.view.$('.webauthn-not-supported').length).toBe(0);
  });

  it('shows error when browser does not support webauthn', function() {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => false);
    testContext.init();
    expect(testContext.view.$('.idx-webauthn-enroll-text').length).toBe(0);
    expect(testContext.view.$('.webauthn-not-supported').length).toBe(1);
    expect(testContext.view.$('.webauthn-not-supported').text().trim()).toBe(
      'Security key or biometric authenticator is not supported on this browser. Contact your admin for assistance.'
    );
  });

  it('shows additional enroll instructions for edge when browser is edge', function() {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    spyOn(BrowserFeatures, 'isEdge').and.callFake(() => true);
    testContext.init();
    expect(testContext.view.$('.idx-webauthn-enroll-text').length).toBe(1);
    expect(testContext.view.$('.idx-webauthn-enroll-text-edge').text().trim()).toBe(
      'Note: If you are enrolling a security key and Windows Hello or PIN is enabled, you will need to select \'Cancel\' in the prompt before continuing.'
    );
    expect(testContext.view.$('.webauthn-setup').length).toBe(1);
  });

  it('shows UV required callout when userVerification is "required"', function() {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    const currentAuthenticator = JSON.parse(JSON.stringify(EnrollWebauthnResponse.currentAuthenticator.value));
    currentAuthenticator.contextualData.activationData.authenticatorSelection.userVerification = 'required';
    testContext.init(currentAuthenticator);
    expect(testContext.view.$('.uv-required-callout').length).toBe(1);
    expect(testContext.view.$('.uv-required-callout').text().trim()).toBe(
      'Biometric verification or a PIN is required to setup this authenticator.'
    );
  });

  it('does not show UV required callout when userVerification is "discouraged"', function() {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    const currentAuthenticator = JSON.parse(JSON.stringify(EnrollWebauthnResponse.currentAuthenticator.value));
    currentAuthenticator.contextualData.activationData.authenticatorSelection.userVerification = 'discouraged';
    testContext.init(currentAuthenticator);
    expect(testContext.view.$('.uv-required-callout').length).toBe(0);
  });

  it('click on setup hides the setup button and shows spinner', function() {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    testContext.init();
    testContext.view.$('.webauthn-setup').click();
    expect(testContext.view.$('.webauthn-setup').css('display')).toBe('none');
    expect(testContext.view.$('.okta-waiting-spinner').css('display')).toBe('block');
  });

  it('saveForm is called when credentials.get succeeds', function(done) {
    const newCredential = {
      response: {
        clientDataJSON: 123,
        attestationObject: 234,
        getTransports: function() { return 345; },
      },
      getClientExtensionResults: function() { return 456; },
    };
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    spyOn(navigator.credentials, 'create').and.returnValue(Promise.resolve(newCredential));
    spyOn(BaseForm.prototype, 'saveForm');

    testContext.init(EnrollWebauthnResponse.currentAuthenticator.value, EnrollWebauthnResponse.authenticatorEnrollments);
    testContext.view.$('.webauthn-setup').click();

    Expect.waitForSpyCall(testContext.view.form.saveForm)
      .then(() => {
        expect(navigator.credentials.create).toHaveBeenCalledWith({
          publicKey: {
            rp: {
              name: 'idx',
            },
            user: {
              id: CryptoUtil.strToBin('00utjm1GstPjCF9Ad0g3'),
              name: 'test@okta.com',
              displayName: 'test user',
            },
            pubKeyCredParams: [
              {
                type: 'public-key',
                alg: -7,
              },
              {
                type: 'public-key',
                alg: -257,
              },
            ],
            challenge: CryptoUtil.strToBin('zrTo0mMXyCt90mweh2HL'),
            attestation: 'direct',
            authenticatorSelection: {
              userVerification: 'discouraged',
            },
            u2fParams: {
              appid: 'http://idx.okta1.com:1802',
            },
            hints: ['security-key'],
            excludeCredentials: [
              {
                type: 'public-key',
                id: CryptoUtil.strToBin(
                  'hpxQXbu5R5Y2JMqpvtE9Oo9FdwO6z2kMR-ZQkAb6p6GSguXQ57oVXKvpVHT2fyCR_m2EL1vIgszxi00kyFIX6w'
                ),
              },
              {
                type: 'public-key',
                id: CryptoUtil.strToBin(
                  '7Ag2iWUqfz0SanWDj-ZZ2fpDsgiEDt_08O1VSSRZHpgkUS1zhLSyWYDrxXXB5VE_w1iiqSvPaRgXcmG5rPwB-w'
                ),
              },
            ],
          },
          signal: jasmine.any(Object),
        });

        expect(testContext.view.form.model.get('credentials')).toEqual({
          clientData: CryptoUtil.binToStr(newCredential.response.clientDataJSON),
          attestation: CryptoUtil.binToStr(newCredential.response.attestationObject),
          transports: JSON.stringify(newCredential.response.getTransports()),
          clientExtensions: JSON.stringify(newCredential.getClientExtensionResults())
        });
        expect(testContext.view.form.saveForm).toHaveBeenCalledWith(testContext.view.form.model);
        expect(testContext.view.form.webauthnAbortController).toBe(null);
        done();
      })
      .catch(done.fail);
  });

  it('credentials.create returns nullable response', function(done) {
    const newCredential = {
      response: {
        clientDataJSON: 123,
        attestationObject: 234,
        getTransports: function() { return undefined; },
      },
      getClientExtensionResults: function() { return undefined; },
    };
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    spyOn(navigator.credentials, 'create').and.returnValue(Promise.resolve(newCredential));
    spyOn(BaseForm.prototype, 'saveForm');

    testContext.init(EnrollWebauthnResponse.currentAuthenticator.value, EnrollWebauthnResponse.authenticatorEnrollments);
    testContext.view.$('.webauthn-setup').click();

    Expect.waitForSpyCall(testContext.view.form.saveForm)
      .then(() => {
        expect(navigator.credentials.create).toHaveBeenCalledWith({
          publicKey: {
            rp: {
              name: 'idx',
            },
            user: {
              id: CryptoUtil.strToBin('00utjm1GstPjCF9Ad0g3'),
              name: 'test@okta.com',
              displayName: 'test user',
            },
            pubKeyCredParams: [
              {
                type: 'public-key',
                alg: -7,
              },
              {
                type: 'public-key',
                alg: -257,
              },
            ],
            challenge: CryptoUtil.strToBin('zrTo0mMXyCt90mweh2HL'),
            attestation: 'direct',
            authenticatorSelection: {
              userVerification: 'discouraged',
            },
            u2fParams: {
              appid: 'http://idx.okta1.com:1802',
            },
            hints: ['security-key'],
            excludeCredentials: [
              {
                type: 'public-key',
                id: CryptoUtil.strToBin(
                  'hpxQXbu5R5Y2JMqpvtE9Oo9FdwO6z2kMR-ZQkAb6p6GSguXQ57oVXKvpVHT2fyCR_m2EL1vIgszxi00kyFIX6w'
                ),
              },
              {
                type: 'public-key',
                id: CryptoUtil.strToBin(
                  '7Ag2iWUqfz0SanWDj-ZZ2fpDsgiEDt_08O1VSSRZHpgkUS1zhLSyWYDrxXXB5VE_w1iiqSvPaRgXcmG5rPwB-w'
                ),
              },
            ],
          },
          signal: jasmine.any(Object),
        });

        expect(testContext.view.form.model.get('credentials')).toEqual({
          clientData: CryptoUtil.binToStr(newCredential.response.clientDataJSON),
          attestation: CryptoUtil.binToStr(newCredential.response.attestationObject),
          clientExtensions: null
        });
        expect(testContext.view.form.saveForm).toHaveBeenCalledWith(testContext.view.form.model);
        expect(testContext.view.form.webauthnAbortController).toBe(null);
        done();
      })
      .catch(done.fail);
  });

  it.each([[true, false], [false, true], [false, false]])('calls navigator.credentials.create on getTransports/getClientExtensions non-supported browser', function(mockGetTransports,
    mockGetClientExtensions, done) {

    const newCredential = {
      response: {
        clientDataJSON: 123,
        attestationObject: 234,
      }
    };

    if (mockGetClientExtensions) {
      newCredential.getClientExtensionResults = function() { return 456; };
    }
    if (mockGetTransports){
      newCredential.response.getTransports = function() { return 123; };
    }
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    spyOn(navigator.credentials, 'create').and.returnValue(Promise.resolve(newCredential));
    spyOn(BaseForm.prototype, 'saveForm');

    testContext.init(EnrollWebauthnResponse.currentAuthenticator.value, EnrollWebauthnResponse.authenticatorEnrollments);
    testContext.view.$('.webauthn-setup').click();

    Expect.waitForSpyCall(testContext.view.form.saveForm)
      .then(() => {
        expect(navigator.credentials.create).toHaveBeenCalledWith({
          publicKey: {
            rp: {
              name: 'idx',
            },
            user: {
              id: CryptoUtil.strToBin('00utjm1GstPjCF9Ad0g3'),
              name: 'test@okta.com',
              displayName: 'test user',
            },
            pubKeyCredParams: [
              {
                type: 'public-key',
                alg: -7,
              },
              {
                type: 'public-key',
                alg: -257,
              },
            ],
            challenge: CryptoUtil.strToBin('zrTo0mMXyCt90mweh2HL'),
            attestation: 'direct',
            authenticatorSelection: {
              userVerification: 'discouraged',
            },
            u2fParams: {
              appid: 'http://idx.okta1.com:1802',
            },
            hints: ['security-key'],
            excludeCredentials: [
              {
                type: 'public-key',
                id: CryptoUtil.strToBin(
                  'hpxQXbu5R5Y2JMqpvtE9Oo9FdwO6z2kMR-ZQkAb6p6GSguXQ57oVXKvpVHT2fyCR_m2EL1vIgszxi00kyFIX6w'
                ),
              },
              {
                type: 'public-key',
                id: CryptoUtil.strToBin(
                  '7Ag2iWUqfz0SanWDj-ZZ2fpDsgiEDt_08O1VSSRZHpgkUS1zhLSyWYDrxXXB5VE_w1iiqSvPaRgXcmG5rPwB-w'
                ),
              },
            ],
          },
          signal: jasmine.any(Object),
        });

        const responseData = {
          clientData: CryptoUtil.binToStr(newCredential.response.clientDataJSON),
          attestation: CryptoUtil.binToStr(newCredential.response.attestationObject),
          clientExtensions: null,
        };

        if (mockGetClientExtensions) {
          responseData.clientExtensions = JSON.stringify(newCredential.getClientExtensionResults());
        }

        if (mockGetTransports) {
          responseData.transports = JSON.stringify(newCredential.response.getTransports());
        }

        expect(testContext.view.form.model.get('credentials')).toEqual(responseData);
        expect(testContext.view.form.saveForm).toHaveBeenCalledWith(testContext.view.form.model);
        expect(testContext.view.form.webauthnAbortController).toBe(null);
        done();
      })
      .catch(done.fail);
  });

  it('error with a name that not supported on login bundle is displayed when credentials.create fails', function(done) {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    spyOn(navigator.credentials, 'create').and.returnValue(Promise.reject({ message: 'error from browser' }));

    testContext.init();
    testContext.view.$('.webauthn-setup').click();

    Expect.waitForCss('.infobox-error')
      .then(() => {
        expect(testContext.view.$('.infobox-error')[0].textContent.trim()).toBe('error from browser');
        expect(testContext.view.form.webauthnAbortController).toBe(null);
        done();
      })
      .catch(done.fail);
  });

  it('error with a name that supported on login bundle is displayed when credentials.create fails', function(done) {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    spyOn(navigator.credentials, 'create').and.returnValue(Promise.reject({
      message: 'error from browser',
      name: 'NotAllowedError',
    }));

    testContext.init();
    testContext.view.$('.webauthn-setup').click();

    Expect.waitForCss('.infobox-error')
      .then(() => {
        expect(testContext.view.$('.infobox-error')[0].textContent.trim()).toBe('The operation either timed out or was not allowed.');
        expect(testContext.view.form.webauthnAbortController).toBe(null);
        done();
      })
      .catch(done.fail);
  });

  it('RP ID mismatch SecurityError shows localized error when credentials.create fails', function(done) {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    spyOn(navigator.credentials, 'create').and.returnValue(Promise.reject({
      message: 'RP ID mismatch',
      name: 'SecurityError',
      code: 18,
    }));

    testContext.init();
    testContext.view.$('.webauthn-setup').click();

    Expect.waitForCss('.infobox-error')
      .then(() => {
        expect(testContext.view.$('.infobox-error')[0].textContent.trim()).toBe(
          'The relying party ID is not a registrable domain suffix of, nor equal to the current domain.'
          + ' Subsequently, an attempt to fetch the .well-known/webauthn resource of the claimed RP ID failed.'
        );
        expect(testContext.view.form.webauthnAbortController).toBe(null);
        done();
      })
      .catch(done.fail);
  });

  it('excludeCredentials includes transports from authenticatorEnrollments when available', function(done) {
    const newCredential = {
      response: {
        clientDataJSON: 123,
        attestationObject: 234,
        getTransports: function() { return ['usb', 'nfc']; },
      },
      getClientExtensionResults: function() { return {}; },
    };
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    spyOn(navigator.credentials, 'create').and.returnValue(Promise.resolve(newCredential));
    spyOn(BaseForm.prototype, 'saveForm');

    const enrollmentsWithTransports = {
      value: [
        {
          displayName: 'yubikey',
          type: 'security_key',
          key: 'webauthn',
          id: 'autwa6eD9o02iBbtv0g2',
          authenticatorId: 'aidtheidkwh282hv8g3',
          credentialId: 'hpxQXbu5R5Y2JMqpvtE9Oo9FdwO6z2kMR-ZQkAb6p6GSguXQ57oVXKvpVHT2fyCR_m2EL1vIgszxi00kyFIX6w',
          transports: ['usb', 'nfc'],
        },
      ],
    };

    testContext.init(EnrollWebauthnResponse.currentAuthenticator.value, enrollmentsWithTransports);
    testContext.view.$('.webauthn-setup').click();

    Expect.waitForSpyCall(testContext.view.form.saveForm)
      .then(() => {
        const calledWith = navigator.credentials.create.calls.mostRecent().args[0];
        expect(calledWith.publicKey.excludeCredentials).toEqual([
          {
            type: 'public-key',
            id: CryptoUtil.strToBin(
              'hpxQXbu5R5Y2JMqpvtE9Oo9FdwO6z2kMR-ZQkAb6p6GSguXQ57oVXKvpVHT2fyCR_m2EL1vIgszxi00kyFIX6w'
            ),
            transports: ['usb', 'nfc'],
          },
        ]);
        done();
      })
      .catch(done.fail);
  });

  it('excludeCredentials includes transports from profile fallback in authenticatorEnrollments', function(done) {
    const newCredential = {
      response: {
        clientDataJSON: 123,
        attestationObject: 234,
        getTransports: function() { return ['internal']; },
      },
      getClientExtensionResults: function() { return {}; },
    };
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    spyOn(navigator.credentials, 'create').and.returnValue(Promise.resolve(newCredential));
    spyOn(BaseForm.prototype, 'saveForm');

    const enrollmentsWithProfileTransports = {
      value: [
        {
          displayName: 'Touch ID',
          type: 'security_key',
          key: 'webauthn',
          id: 'autwa6eD9o02iBbtv0g3',
          authenticatorId: 'fwftheidkwh282hv8g3',
          credentialId: '7Ag2iWUqfz0SanWDj-ZZ2fpDsgiEDt_08O1VSSRZHpgkUS1zhLSyWYDrxXXB5VE_w1iiqSvPaRgXcmG5rPwB-w',
          profile: { transports: ['internal'] },
        },
      ],
    };

    testContext.init(EnrollWebauthnResponse.currentAuthenticator.value, enrollmentsWithProfileTransports);
    testContext.view.$('.webauthn-setup').click();

    Expect.waitForSpyCall(testContext.view.form.saveForm)
      .then(() => {
        const calledWith = navigator.credentials.create.calls.mostRecent().args[0];
        expect(calledWith.publicKey.excludeCredentials).toEqual([
          {
            type: 'public-key',
            id: CryptoUtil.strToBin(
              '7Ag2iWUqfz0SanWDj-ZZ2fpDsgiEDt_08O1VSSRZHpgkUS1zhLSyWYDrxXXB5VE_w1iiqSvPaRgXcmG5rPwB-w'
            ),
            transports: ['internal'],
          },
        ]);
        done();
      })
      .catch(done.fail);
  });

  // OKTA-1184438: okta-core emits profile.transports as a comma separated string
  // so the entire profile serializes as Map<String,String>; tolerate both shapes.
  it('excludeCredentials parses comma separated string profile.transports', function(done) {
    const newCredential = {
      response: {
        clientDataJSON: 123,
        attestationObject: 234,
        getTransports: function() { return ['internal']; },
      },
      getClientExtensionResults: function() { return {}; },
    };
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    spyOn(navigator.credentials, 'create').and.returnValue(Promise.resolve(newCredential));
    spyOn(BaseForm.prototype, 'saveForm');

    const enrollmentsWithStringTransports = {
      value: [
        {
          displayName: 'Touch ID',
          type: 'security_key',
          key: 'webauthn',
          id: 'autwa6eD9o02iBbtv0g3',
          authenticatorId: 'fwftheidkwh282hv8g3',
          credentialId: '7Ag2iWUqfz0SanWDj-ZZ2fpDsgiEDt_08O1VSSRZHpgkUS1zhLSyWYDrxXXB5VE_w1iiqSvPaRgXcmG5rPwB-w',
          profile: { transports: 'usb,nfc' },
        },
      ],
    };

    testContext.init(EnrollWebauthnResponse.currentAuthenticator.value, enrollmentsWithStringTransports);
    testContext.view.$('.webauthn-setup').click();

    Expect.waitForSpyCall(testContext.view.form.saveForm)
      .then(() => {
        const calledWith = navigator.credentials.create.calls.mostRecent().args[0];
        expect(calledWith.publicKey.excludeCredentials).toEqual([
          {
            type: 'public-key',
            id: CryptoUtil.strToBin(
              '7Ag2iWUqfz0SanWDj-ZZ2fpDsgiEDt_08O1VSSRZHpgkUS1zhLSyWYDrxXXB5VE_w1iiqSvPaRgXcmG5rPwB-w'
            ),
            transports: ['usb', 'nfc'],
          },
        ]);
        done();
      })
      .catch(done.fail);
  });

  it('excludeCredentials parses single string profile.transports', function(done) {
    const newCredential = {
      response: {
        clientDataJSON: 123,
        attestationObject: 234,
        getTransports: function() { return ['internal']; },
      },
      getClientExtensionResults: function() { return {}; },
    };
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    spyOn(navigator.credentials, 'create').and.returnValue(Promise.resolve(newCredential));
    spyOn(BaseForm.prototype, 'saveForm');

    const enrollmentsWithStringTransports = {
      value: [
        {
          displayName: 'Touch ID',
          type: 'security_key',
          key: 'webauthn',
          id: 'autwa6eD9o02iBbtv0g3',
          authenticatorId: 'fwftheidkwh282hv8g3',
          credentialId: '7Ag2iWUqfz0SanWDj-ZZ2fpDsgiEDt_08O1VSSRZHpgkUS1zhLSyWYDrxXXB5VE_w1iiqSvPaRgXcmG5rPwB-w',
          profile: { transports: 'usb' },
        },
      ],
    };

    testContext.init(EnrollWebauthnResponse.currentAuthenticator.value, enrollmentsWithStringTransports);
    testContext.view.$('.webauthn-setup').click();

    Expect.waitForSpyCall(testContext.view.form.saveForm)
      .then(() => {
        const calledWith = navigator.credentials.create.calls.mostRecent().args[0];
        expect(calledWith.publicKey.excludeCredentials).toEqual([
          {
            type: 'public-key',
            id: CryptoUtil.strToBin(
              '7Ag2iWUqfz0SanWDj-ZZ2fpDsgiEDt_08O1VSSRZHpgkUS1zhLSyWYDrxXXB5VE_w1iiqSvPaRgXcmG5rPwB-w'
            ),
            transports: ['usb'],
          },
        ]);
        done();
      })
      .catch(done.fail);
  });

  it('excludeCredentials omits transports when profile.transports is not a valid string', function(done) {
    const newCredential = {
      response: {
        clientDataJSON: 123,
        attestationObject: 234,
        getTransports: function() { return ['internal']; },
      },
      getClientExtensionResults: function() { return {}; },
    };
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    spyOn(navigator.credentials, 'create').and.returnValue(Promise.resolve(newCredential));
    spyOn(BaseForm.prototype, 'saveForm');

    const enrollmentsWithBadTransports = {
      value: [
        {
          displayName: 'Touch ID',
          type: 'security_key',
          key: 'webauthn',
          id: 'autwa6eD9o02iBbtv0g3',
          authenticatorId: 'fwftheidkwh282hv8g3',
          credentialId: '7Ag2iWUqfz0SanWDj-ZZ2fpDsgiEDt_08O1VSSRZHpgkUS1zhLSyWYDrxXXB5VE_w1iiqSvPaRgXcmG5rPwB-w',
          profile: { transports: 123 },
        },
      ],
    };

    testContext.init(EnrollWebauthnResponse.currentAuthenticator.value, enrollmentsWithBadTransports);
    testContext.view.$('.webauthn-setup').click();

    Expect.waitForSpyCall(testContext.view.form.saveForm)
      .then(() => {
        const calledWith = navigator.credentials.create.calls.mostRecent().args[0];
        expect(calledWith.publicKey.excludeCredentials).toEqual([
          {
            type: 'public-key',
            id: CryptoUtil.strToBin(
              '7Ag2iWUqfz0SanWDj-ZZ2fpDsgiEDt_08O1VSSRZHpgkUS1zhLSyWYDrxXXB5VE_w1iiqSvPaRgXcmG5rPwB-w'
            ),
          },
        ]);
        done();
      })
      .catch(done.fail);
  });

  it('credentials.get should be called with empty excludeCredentials when requreResidentKey=true', function(done) {
    const newCredential = {
      response: {
        clientDataJSON: 123,
        attestationObject: 234,
        getTransports: function() { return 345; },
      },
      getClientExtensionResults: function() { return 456; },
    };
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    spyOn(navigator.credentials, 'create').and.returnValue(Promise.resolve(newCredential));
    spyOn(BaseForm.prototype, 'saveForm');

    const currentAuthenticator = JSON.parse(JSON.stringify(EnrollWebauthnResponse.currentAuthenticator.value));
    currentAuthenticator.contextualData.activationData.authenticatorSelection.requireResidentKey = true;
    testContext.init(currentAuthenticator);

    testContext.init(currentAuthenticator, EnrollWebauthnResponse.authenticatorEnrollments);
    testContext.view.$('.webauthn-setup').click();

    Expect.waitForSpyCall(testContext.view.form.saveForm)
      .then(() => {
        expect(navigator.credentials.create).toHaveBeenCalledWith({
          publicKey: {
            rp: {
              name: 'idx',
            },
            user: {
              id: CryptoUtil.strToBin('00utjm1GstPjCF9Ad0g3'),
              name: 'test@okta.com',
              displayName: 'test user',
            },
            pubKeyCredParams: [
              {
                type: 'public-key',
                alg: -7,
              },
              {
                type: 'public-key',
                alg: -257,
              },
            ],
            challenge: CryptoUtil.strToBin('zrTo0mMXyCt90mweh2HL'),
            attestation: 'direct',
            authenticatorSelection: {
              requireResidentKey: true,
              userVerification: 'discouraged',
            },
            u2fParams: {
              appid: 'http://idx.okta1.com:1802',
            },
            hints: ['security-key'],
            excludeCredentials: [],
          },
          signal: jasmine.any(Object),
        });
        done();
      })
      .catch(done.fail);
  });

  describe('WebAuthn displayName variations', function() {
    beforeEach(function() {
      spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    });

    it('shows DEFAULT title', function() {
      testContext.init(EnrollWebauthnResponse.currentAuthenticator.value);
      expect(testContext.view.$('.okta-form-title').text()).toBe('Set up security key or biometric authenticator');
    });

    it('shows PASSKEYS title', function() {
      testContext.init(EnrollWebauthnPasskeysResponse.currentAuthenticator.value);
      expect(testContext.view.$('.okta-form-title').text()).toBe('Set up a passkey');
    });

    it('shows additional instructions callout alongside the splash for custom displayName', function() {
      testContext.init(EnrollWebauthnCustomResponse.currentAuthenticator.value);
      expect(testContext.view.$('.okta-form-title').text()).toBe('Set up YubiKey');
      // Splash renders above the classic view
      expect(testContext.view.$('.oie-passkey-splash-content').length).toBe(1);
      // Base instructions paragraph is suppressed under the splash — the FAQ replaces it
      expect(testContext.view.$('.idx-webauthn-enroll-text').length).toBe(0);
      // Additional-instructions callout is preserved under the splash
      expect(testContext.view.$('.additional-instructions-title').length).toBe(1);
      expect(testContext.view.$('.additional-instructions-title').text().trim())
        .toBe('Additional instructions from your administrator:');
      expect(testContext.view.$('.additional-instructions-callout').length).toBe(1);
      expect(testContext.view.$('.additional-instructions-callout').text().trim())
        .toBe('Insert your YubiKey and tap to authenticate.');
    });

    it('hides custom instructions when description is missing', function() {
      const currentAuthenticator = JSON.parse(JSON.stringify(EnrollWebauthnCustomResponse.currentAuthenticator.value));
      delete currentAuthenticator.description;
      testContext.init(currentAuthenticator);
      expect(testContext.view.$('.okta-form-title').text()).toBe('Set up YubiKey');
      expect(testContext.view.$('.additional-instructions-title').length).toBe(0);
      expect(testContext.view.$('.additional-instructions-callout').length).toBe(0);
    });
  });

  describe('promotion remediation', function() {
    beforeEach(function() {
      spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    });

    describe('with Passkeys displayName', function() {
      it('shows the promo title and "Create a passkey" CTA', function() {
        testContext.initPromotion();
        expect(testContext.view.$('.okta-form-title').text())
          .toBe('Set up a passkey: more secure, easier to use.');
        expect(testContext.view.$('.webauthn-setup').text()).toBe('Create a passkey');
      });

      it('renders the splash (illustration + FAQ) and suppresses the base instructions line', function() {
        testContext.initPromotion();
        expect(testContext.view.$('.oie-passkey-splash-content').length).toBe(1);
        expect(testContext.view.$('.passkey-promotion-illustration svg').length).toBe(1);
        expect(testContext.view.$('.passkey-promotion-faq-title').length).toBe(3);
        // Base instructions paragraph is suppressed when the splash is shown — its FAQ replaces it
        expect(testContext.view.$('.idx-webauthn-enroll-text').length).toBe(0);
      });

      it('keeps conditional Edge/UV callouts under the splash even though the base instructions are suppressed', function() {
        spyOn(BrowserFeatures, 'isEdge').and.callFake(() => true);
        const currentAuthenticator = JSON.parse(JSON.stringify(EnrollWebauthnPasskeysResponse.currentAuthenticator.value));
        currentAuthenticator.contextualData.activationData.authenticatorSelection.userVerification = 'required';
        testContext.initPromotion(currentAuthenticator);
        expect(testContext.view.$('.oie-passkey-splash-content').length).toBe(1);
        expect(testContext.view.$('.idx-webauthn-enroll-text').length).toBe(0);
        expect(testContext.view.$('.idx-webauthn-enroll-text-edge').length).toBe(1);
        expect(testContext.view.$('.uv-required-callout').length).toBe(1);
      });

      it('renders the "Maybe later" skip link when the response has a skip remediation', function() {
        testContext.initPromotion();
        const $skipLink = testContext.view.$('[data-se="skip-setup"]');
        expect($skipLink.length).toBe(1);
        expect($skipLink.text()).toBe('Maybe later');
      });

      it('does not render the skip link when the response lacks a skip remediation', function() {
        testContext.initPromotion(
          EnrollWebauthnPasskeysResponse.currentAuthenticator.value,
          { hasSkipRemediation: false },
        );
        expect(testContext.view.$('[data-se="skip-setup"]').length).toBe(0);
      });
    });

    describe('with Security Key or Biometric displayName', function() {
      it('keeps the default title and "Set up" CTA', function() {
        testContext.initPromotion(EnrollWebauthnResponse.currentAuthenticator.value);
        expect(testContext.view.$('.okta-form-title').text())
          .toBe('Set up security key or biometric authenticator');
        expect(testContext.view.$('.webauthn-setup').text()).toBe('Set up');
      });

      it('does not render the passkey splash', function() {
        testContext.initPromotion(EnrollWebauthnResponse.currentAuthenticator.value);
        expect(testContext.view.$('.oie-passkey-splash-content').length).toBe(0);
        // Classic instructions ARE present
        expect(testContext.view.$('.idx-webauthn-enroll-text').length).toBe(1);
      });

      it('still renders the skip link when present in the response', function() {
        testContext.initPromotion(EnrollWebauthnResponse.currentAuthenticator.value);
        expect(testContext.view.$('[data-se="skip-setup"]').length).toBe(1);
      });
    });

    describe('with a custom displayName', function() {
      it('keeps the custom title and default "Set up" CTA', function() {
        testContext.initPromotion(EnrollWebauthnCustomResponse.currentAuthenticator.value);
        expect(testContext.view.$('.okta-form-title').text()).toBe('Set up YubiKey');
        expect(testContext.view.$('.webauthn-setup').text()).toBe('Set up');
      });

      it('still renders the splash (illustration + FAQ) and suppresses the base instructions line', function() {
        testContext.initPromotion(EnrollWebauthnCustomResponse.currentAuthenticator.value);
        expect(testContext.view.$('.oie-passkey-splash-content').length).toBe(1);
        expect(testContext.view.$('.passkey-promotion-faq-title').length).toBe(3);
        expect(testContext.view.$('.idx-webauthn-enroll-text').length).toBe(0);
        // Custom-description callout still renders alongside the splash
        expect(testContext.view.$('.additional-instructions-callout').length).toBe(1);
      });
    });
  });

  describe('standard enroll (regression guards)', function() {
    beforeEach(function() {
      spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    });

    it('keeps the passkeys-rebrand title and "Set up" CTA when displayName is "Passkeys"', function() {
      testContext.init(EnrollWebauthnPasskeysResponse.currentAuthenticator.value);
      expect(testContext.view.$('.okta-form-title').text()).toBe('Set up a passkey');
      expect(testContext.view.$('.webauthn-setup').text()).toBe('Set up');
    });

    it('renders the splash on standard enroll with Passkeys displayName (existing product decision) and suppresses the base instructions line', function() {
      testContext.init(EnrollWebauthnPasskeysResponse.currentAuthenticator.value);
      expect(testContext.view.$('.oie-passkey-splash-content').length).toBe(1);
      expect(testContext.view.$('.passkey-promotion-faq-title').length).toBe(3);
      expect(testContext.view.$('.idx-webauthn-enroll-text').length).toBe(0);
    });

    it('does not render the splash on standard enroll with Security Key or Biometric displayName', function() {
      testContext.init(EnrollWebauthnResponse.currentAuthenticator.value);
      expect(testContext.view.$('.oie-passkey-splash-content').length).toBe(0);
      expect(testContext.view.$('.idx-webauthn-enroll-text').length).toBe(1);
    });

    it('does not render the promotion "Maybe later" skip link on standard enroll — even when the response includes a skip remediation (regression guard for scope of the skip link)', function() {
      testContext.init(
        EnrollWebauthnPasskeysResponse.currentAuthenticator.value,
        [],
        { hasSkipRemediation: true },
      );
      expect(testContext.view.$('[data-se="skip-setup"]').length).toBe(0);
    });
  });
});
