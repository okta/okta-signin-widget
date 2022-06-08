import ChallengeWebauthnView from 'v2/view-builder/views/webauthn/ChallengeWebauthnView';
import { BaseForm } from 'v2/view-builder/internals';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import webauthn from 'util/webauthn';
import BrowserFeatures from 'util/BrowserFeatures';
import CryptoUtil from 'util/CryptoUtil';
import $sandbox from 'sandbox';
import Expect from 'helpers/util/Expect';
import ChallengeWebauthnResponse from '../../../../../../playground/mocks/data/idp/idx/authenticator-verification-webauthn.json';

describe('v2/view-builder/views/webauthn/ChallengeWebauthnView', function() {
  let testContext;
  beforeEach(function() {
    testContext = {};
    testContext.init = (
      currentAuthenticator = ChallengeWebauthnResponse.currentAuthenticator.value,
      authenticatorEnrollments = [],
      app = {},
      residentKeySetting = {},
    ) => {
      const appState = new AppState({
        currentAuthenticator,
        authenticatorEnrollments,
        app,
      }, {});
      jest.spyOn(appState, 'getRemediationAuthenticationOptions').mockReturnValue(formName => {
        if (formName === 'select-authenticator-authenticate') {
          return [ { label: 'some authenticator '} ];
        }
        return [];
      });
      jest.spyOn(appState, 'shouldShowSignOutLinkInCurrentForm').mockReturnValue(false);
      jest.spyOn(appState, 'hasRemediationObject').mockReturnValue(residentKeySetting.canEnrollResidentKey ?? false);
      jest.spyOn(appState, 'getSchemaByName').mockReturnValue(residentKeySetting.hasUserHandleSchema ?? false);
      const settings = new Settings({ baseUrl: 'http://localhost:3000' });
      const currentViewState = {
        name: 'challenge-authenticator',
        relatesTo: {
          value: currentAuthenticator,
        },
      };
      testContext.view = new ChallengeWebauthnView({
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

  it('shows verify instructions and spinner when webauthn is supported and browser is not safari', function() {
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
    jest.spyOn(BrowserFeatures, 'isSafari').mockReturnValue(false);
    testContext.init();
    expect(testContext.view.$('.idx-webauthn-verify-text').text()).toBe(
      'You will be prompted to use a security key or biometric verification (Windows Hello, Touch ID, etc.). Follow the instructions to complete verification.'
    );
    expect(testContext.view.$('.retry-webauthn').css('display')).toBe('none');
    expect(testContext.view.$('.okta-waiting-spinner').css('display')).toBe('block');
    expect(testContext.view.$('.webauthn-not-supported').length).toBe(0);
  });

  it('shows verify instructions and button when browser supports webauthn on safari', function() {
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
    jest.spyOn(BrowserFeatures, 'isSafari').mockReturnValue(true);
    testContext.init();
    expect(testContext.view.$('.idx-webauthn-verify-text').text()).toBe(
      'You will be prompted to use a security key or biometric verification (Windows Hello, Touch ID, etc.). Follow the instructions to complete verification.'
    );
    expect(testContext.view.$('.retry-webauthn').css('display')).not.toBe('none');
    expect(testContext.view.$('.retry-webauthn').text()).toBe('Verify');
    expect(testContext.view.$('.webauthn-not-supported').length).toBe(0);
  });

  it('updated button text to "Retry" on click on safari', function() {
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
    jest.spyOn(BrowserFeatures, 'isSafari').mockReturnValue(true);
    testContext.init();
    expect(testContext.view.$('.idx-webauthn-verify-text').text()).toBe(
      'You will be prompted to use a security key or biometric verification (Windows Hello, Touch ID, etc.). Follow the instructions to complete verification.'
    );
    expect(testContext.view.$('.retry-webauthn').css('display')).not.toBe('none'); // default value: empty string in jest, 'inline' in browser
    expect(testContext.view.$('.retry-webauthn').text()).toBe('Verify');
    testContext.view.$('.retry-webauthn').click();
    expect(testContext.view.$('.retry-webauthn').css('display')).toBe('none');
    expect(testContext.view.$('.retry-webauthn').text()).toBe('Retry');
  });

  it('shows verify instructions if there are existing enrollments', function() {
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
    jest.spyOn(BrowserFeatures, 'isSafari').mockReturnValue(true);
    testContext.init(
      ChallengeWebauthnResponse.currentAuthenticator.value,
      ChallengeWebauthnResponse.authenticatorEnrollments
    );
    expect(testContext.view.$('.idx-webauthn-verify-text').text()).toBe(
      'You will be prompted to use a security key or biometric verification (Windows Hello, Touch ID, etc.). Follow the instructions to complete verification.'
    );
    expect(testContext.view.$('.retry-webauthn').css('display')).not.toBe('none'); // default value: empty string in jest, 'inline' in browser
    expect(testContext.view.$('.retry-webauthn').text()).toBe('Verify');
    expect(testContext.view.$('.webauthn-not-supported').length).toBe(0);
  });

  it('shows error when browser does not support webauthn', function() {
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(false);
    testContext.init();
    expect(testContext.view.$('.idx-webauthn-verify-text').length).toBe(0);
    expect(testContext.view.$('.retry-webauthn').length).toBe(0);
    expect(testContext.view.$('.okta-waiting-spinner').length).toBe(0);
    expect(testContext.view.$('.webauthn-not-supported').length).toBe(1);
    expect(testContext.view.$('.webauthn-not-supported').text().trim()).toBe(
      'Security key or biometric authenticator is not supported on this browser. Contact your admin for assistance.'
    );
  });

  it('shows UV required callout when userVerification is "required"', function() {
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
    const currentAuthenticator = JSON.parse(
      JSON.stringify(ChallengeWebauthnResponse.currentAuthenticator.value)
    );
    currentAuthenticator.contextualData.challengeData.userVerification = 'required';
    testContext.init(currentAuthenticator);
    expect(testContext.view.$('.uv-required-callout').length).toBe(1);
    expect(testContext.view.$('.uv-required-callout').text().trim()).toBe(
      'Biometric verification or a PIN is required to sign in with this authenticator.'
    );
  });

  it('does not show UV required callout when userVerification is "discouraged"', function() {
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
    const currentAuthenticator = JSON.parse(
      JSON.stringify(ChallengeWebauthnResponse.currentAuthenticator.value)
    );
    currentAuthenticator.contextualData.challengeData.userVerification = 'discouraged';
    testContext.init(currentAuthenticator);
    expect(testContext.view.$('.uv-required-callout').length).toBe(0);
  });

  it('saveForm is called with model when credentials.get succeeds', function(done) {
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
    const assertion = {
      response: {
        clientDataJSON: 123,
        authenticatorData: 234,
        signature: 'magizh',
      },
    };
    jest.spyOn(BaseForm.prototype, 'saveForm');
    jest.spyOn(navigator.credentials, 'get').mockReturnValue(Promise.resolve(assertion));

    testContext.init(
      ChallengeWebauthnResponse.currentAuthenticator.value,
      ChallengeWebauthnResponse.authenticatorEnrollments
    );
    Expect.wait(() => {
      return BaseForm.prototype.saveForm.mock.calls.length > 0;
    }).then(() => {
      expect(navigator.credentials.get).toHaveBeenCalledWith({
        publicKey: {
          allowCredentials: [
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
          extensions: {
            appid: 'https://localhost:3000',
          },
          userVerification: 'required',
          challenge: CryptoUtil.strToBin(
            ChallengeWebauthnResponse.currentAuthenticator.value.contextualData.challengeData.challenge
          ),
        },
        signal: jasmine.any(Object),
      });
      expect(testContext.view.form.model.get('credentials')).toEqual({
        clientData: CryptoUtil.binToStr(assertion.response.clientDataJSON),
        authenticatorData: CryptoUtil.binToStr(assertion.response.authenticatorData),
        signatureData: CryptoUtil.binToStr(assertion.response.signature),
      });
      expect(testContext.view.form.saveForm).toHaveBeenCalledWith(testContext.view.form.model);
      expect(testContext.view.form.webauthnAbortController).toBe(null);
      done();
    })
      .catch(done.fail);
  });

  it('error with a name that not supported on login bundle is displayed when credentials.create fails', function(done) {
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
    jest.spyOn(navigator.credentials, 'get').mockReturnValue(Promise.reject({ message: 'error from browser' }));

    testContext.init();

    Expect.waitForCss('.infobox-error')
      .then(() => {
        expect(testContext.view.$('.infobox-error')[0].textContent.trim()).toBe('error from browser');
        expect(testContext.view.form.webauthnAbortController).toBe(null);
        done();
      })
      .catch(done.fail);
  });

  it('error with a name that supported on login bundle is displayed when credentials.create fails', function(done) {
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
    jest.spyOn(navigator.credentials, 'get').mockReturnValue(Promise.reject({
      message: 'error from browser',
      name: 'NotAllowedError',
    }));

    testContext.init();

    Expect.waitForCss('.infobox-error')
      .then(() => {
        expect(testContext.view.$('.infobox-error')[0].textContent.trim()).toBe('The operation either timed out or was not allowed.');
        expect(testContext.view.form.webauthnAbortController).toBe(null);
        done();
      })
      .catch(done.fail);
  });

  it('shows correct text when Can\'t verify? is clicked', function() {
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
    jest.spyOn(BrowserFeatures, 'isSafari').mockReturnValue(false);
    testContext.init();
    expect(testContext.view.$('.idx-webauthn-verify-text').text()).toMatchInlineSnapshot(
      '"You will be prompted to use a security key or biometric verification (Windows Hello, Touch ID, etc.). Follow the instructions to complete verification."'
    );
    expect(testContext.view.$('.js-cant-verify').length).toBe(1);
    expect(testContext.view.$('.js-help-description').css('display')).toBe('none');
    expect(testContext.view.$('.js-cant-verify').attr('aria-expanded')).toBe(undefined);
    const cantVerifyLink = document.getElementsByClassName('link js-cant-verify');
    // Expands when clicked on
    cantVerifyLink[0].click();
    Expect.wait(() => {
      return testContext.view.$('.js-cant-verify').attr('aria-expanded') === 'true';
    }).then(function() {
      expect(testContext.view.$('.js-help-description').css('display')).toBe('block');
      expect(testContext.view.$('.js-help-description').first().html()).toMatchInlineSnapshot(
        '"<h3>Are you trying to use a biometric authenticator?</h3><br><p>Biometric authenticators (fingerprint, face recognition, PIN) will only work on the same device on which they were set up.</p><br><p>If available, set up another security method on the device you used to set up your biometric authenticator.</p><br><h3>Are you trying to use a security key?</h3><br><p>If you have set up a security key, insert it in a USB port when prompted by the browser and tap on the button or gold disk. Security keys can work on multiple devices.</p><br>"'
      );
      expect(testContext.view.$('.js-cant-verify').attr('aria-expanded')).toBe('true');
    });
    // Collapses when clicked on again
    cantVerifyLink[0].click();
    Expect.wait(() => {
      return testContext.view.$('.js-cant-verify').attr('aria-expanded') === 'false';
    }).then(function() {
      expect(testContext.view.$('.js-help-description').css('display')).toBe('none');
      expect(testContext.view.$('.js-cant-verify').attr('aria-expanded')).toBe('false');
    });
  });

  it('shows additional text when Can\'t verify? is clicked from Okta_Authenticator', function() {
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
    jest.spyOn(BrowserFeatures, 'isSafari').mockReturnValue(false);
    const app = { name: 'Okta_Authenticator' };
    testContext.init(
      ChallengeWebauthnResponse.currentAuthenticator.value,
      ChallengeWebauthnResponse.authenticatorEnrollments,
      app,
    );
    expect(testContext.view.$('.idx-webauthn-verify-text').text()).toMatchInlineSnapshot(
      '"You will be prompted to use a security key or biometric verification (Windows Hello, Touch ID, etc.). Follow the instructions to complete verification."'
    );
    expect(testContext.view.$('.js-cant-verify').length).toBe(1);
    expect(testContext.view.$('.js-help-description').css('display')).toBe('none');
    expect(testContext.view.$('.js-cant-verify').attr('aria-expanded')).toBe(undefined);
    const cantVerifyLink = document.getElementsByClassName('link js-cant-verify');
    // Expands when clicked on
    cantVerifyLink[0].click();
    Expect.wait(() => {
      return testContext.view.$('.js-cant-verify').attr('aria-expanded') === 'true';
    }).then(function() {
      expect(testContext.view.$('.js-help-description').css('display')).toBe('block');
      expect(testContext.view.$('.js-help-description').first().html()).toMatchInlineSnapshot(
        '"<ol class=\\"ov-enrollment-info\\"><li>Open your Okta Dashboard (e.g. yourcompany.okta.com) on the device you used to setup your security key or biometric authenticator</li><br><li>Go to Settings &gt; Security Methods</li><br><li>On Okta Verify, click \\"Set up\\"</li><br><li>Scan the QR code using Okta Verify and follow instructions to finish enrolling your account<br></li></ol>"'
      );
      expect(testContext.view.$('.js-cant-verify').attr('aria-expanded')).toBe('true');
    });
    // Collapses when clicked on again
    cantVerifyLink[0].click();
    Expect.wait(() => {
      return testContext.view.$('.js-cant-verify').attr('aria-expanded') === 'false';
    }).then(function() {
      expect(testContext.view.$('.js-help-description').css('display')).toBe('none');
      expect(testContext.view.$('.js-cant-verify').attr('aria-expanded')).toBe('false');
    });
  });

  it('saveForm is called with model having userHandle when credentials.get succeeds', function(done) {
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
    const assertion = {
      response: {
        clientDataJSON: 123,
        authenticatorData: 234,
        signature: 'magizh',
        userHandle: 'userId',
      },
    };

    jest.spyOn(BaseForm.prototype, 'saveForm');
    jest.spyOn(navigator.credentials, 'get').mockReturnValue(Promise.resolve(assertion));

    testContext.init(
      ChallengeWebauthnResponse.currentAuthenticator.value,
      [],
      {},
      {hasUserHandleSchema:true}
    );

    Expect.wait(() => {
      return BaseForm.prototype.saveForm.mock.calls.length > 0;
    }).then(() => {
      expect(navigator.credentials.get).toHaveBeenCalledWith({
        publicKey: {
          allowCredentials: [],
          extensions: {
            appid: 'https://localhost:3000',
          },
          userVerification: 'required',
          challenge: CryptoUtil.strToBin(
            ChallengeWebauthnResponse.currentAuthenticator.value.contextualData.challengeData.challenge
          ),
        },
        signal: jasmine.any(Object),
      });
      expect(testContext.view.form.model.get('credentials')).toEqual({
        clientData: CryptoUtil.binToStr(assertion.response.clientDataJSON),
        authenticatorData: CryptoUtil.binToStr(assertion.response.authenticatorData),
        signatureData: CryptoUtil.binToStr(assertion.response.signature),
        userHandle: CryptoUtil.binToStr(assertion.response.userHandle),
      });
      expect(testContext.view.form.saveForm).toHaveBeenCalledWith(testContext.view.form.model);
      expect(testContext.view.form.webauthnAbortController).toBe(null);
      done();
    })
    .catch(done.fail);
  });

  it('shows not have setup webauthn residentKey text when enroll-webauthn-residentkey remediation does not exist', function() {
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
    jest.spyOn(BrowserFeatures, 'isSafari').mockReturnValue(false);
    testContext.init();
    expect(testContext.view.$('.setup-webauthn-residentkey-text').length).toBe(0);
  });

  it('shows hide setup webauthn residentKey text when enroll-webauthn-residentkey remediation exist', function() {
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
    jest.spyOn(BrowserFeatures, 'isSafari').mockReturnValue(false);
    const assertion = {
      response: {
        clientDataJSON: 123,
        authenticatorData: 234,
        signature: 'magizh',
        userHandle: 'userId',
      },
    };
    jest.spyOn(navigator.credentials, 'get').mockReturnValue(Promise.resolve(assertion));
    testContext.init(
      ChallengeWebauthnResponse.currentAuthenticator.value,
      [],
      {},
      {canEnrollResidentKey:true});
    expect(testContext.view.$('.setup-webauthn-residentkey-text').length).toBe(1);
    expect(testContext.view.$('.setup-webauthn-residentkey-text').css('display')).toBe('none');
  });

  it('shows show setup webauthn residentKey text when enroll-webauthn-residentkey remediation exist and webauthn errors', function(done) {
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
    jest.spyOn(BrowserFeatures, 'isSafari').mockReturnValue(false);
    jest.spyOn(navigator.credentials, 'get').mockReturnValue(Promise.reject({
      message: 'error from browser',
      name: 'NotAllowedError',
    }));
    testContext.init(
      ChallengeWebauthnResponse.currentAuthenticator.value,
      [],
      {},
      {canEnrollResidentKey:true});
    Expect.waitForCss('.infobox-error')
    .then(() => {
      expect(testContext.view.$('.setup-webauthn-residentkey-text').css('display')).toBe('block');
      done();
    })
    .catch(done.fail);
  });
});
