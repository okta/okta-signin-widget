import ChallengeWebauthnView from 'v2/view-builder/views/webauthn/ChallengeWebauthnView';
import BaseForm from 'v2/view-builder/internals/BaseForm';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import webauthn from 'util/webauthn';
import CryptoUtil from 'util/CryptoUtil';
import $sandbox from 'sandbox';
import Expect from 'helpers/util/Expect';
import ChallengeWebauthnResponse from '../../../../../../playground/mocks/data/idp/idx/authenticator-verification-webauthn.json';

describe('v2/view-builder/views/webauthn/ChallengeWebauthnView', function () {
  beforeEach(function () {
    this.init = (currentAuthenticatorEnrollment = ChallengeWebauthnResponse.currentAuthenticatorEnrollment.value,
      authenticatorEnrollments = []) => {
      const appState = new AppState({
        currentAuthenticatorEnrollment,
        authenticatorEnrollments
      });
      spyOn(appState, 'hasRemediationObject').and.callFake((formName) => formName === 'select-authenticator-authenticate');
      spyOn(appState, 'shouldShowSignOutLinkInCurrentForm').and.returnValue(false);
      const settings = new Settings({ baseUrl: 'http://localhost:3000' });
      const currentViewState = {
        name: 'challenge-authenticator',
        relatesTo: {
          value: currentAuthenticatorEnrollment
        },
      };
      this.view = new ChallengeWebauthnView({
        el: $sandbox,
        appState,
        settings,
        currentViewState,
      });
      this.view.render();
    };
  });

  afterEach(function () {
    $sandbox.empty();
  });

  it('shows verify instructions and spinner when browser supports webauthn', function () {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    this.init();
    expect(this.view.$('.idx-webauthn-verify-text').text())
      .toBe('You will be prompted to use a security key or biometric verification (Windows Hello, Touch ID, etc.). Follow the instructions to complete verification.');
    expect(this.view.$('.retry-webauthn').css('display')).toBe('none');
    expect(this.view.$('.retry-webauthn').text()).toBe('Retry');
    expect(this.view.$('.webauthn-not-supported').length).toBe(0);
    expect(this.view.$('.okta-waiting-spinner').css('display')).toBe('block');
  });

  it('shows verify instructions and spinner if there are existing enrollments', function () {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    this.init(ChallengeWebauthnResponse.currentAuthenticatorEnrollment.value, ChallengeWebauthnResponse.authenticatorEnrollments);
    expect(this.view.$('.idx-webauthn-verify-text').text())
      .toBe('You will be prompted to use a security key or biometric verification (Windows Hello, Touch ID, etc.). Follow the instructions to complete verification.');
    expect(this.view.$('.retry-webauthn').css('display')).toBe('none');
    expect(this.view.$('.retry-webauthn').text()).toBe('Retry');
    expect(this.view.$('.webauthn-not-supported').length).toBe(0);
    expect(this.view.$('.okta-waiting-spinner').css('display')).toBe('block');
  });

  it('shows error when browser does not support webauthn', function () {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => false);
    this.init();
    expect(this.view.$('.idx-webauthn-verify-text').length).toBe(0);
    expect(this.view.$('.retry-webauthn').length).toBe(0);
    expect(this.view.$('.okta-waiting-spinner').length).toBe(0);
    expect(this.view.$('.webauthn-not-supported').length).toBe(1);
    expect(this.view.$('.webauthn-not-supported').text().trim())
      .toBe('Security key or biometric authenticator is not supported on this browser. Contact your admin for assistance.');
  });

  it('shows UV required callout when userVerification is "required"', function () {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    const currentAuthenticatorEnrollment = JSON.parse(JSON.stringify(ChallengeWebauthnResponse.currentAuthenticatorEnrollment.value));
    currentAuthenticatorEnrollment.contextualData.challengeData.userVerification = 'required';
    this.init(currentAuthenticatorEnrollment);
    expect(this.view.$('.uv-required-callout').length).toBe(1);
    expect(this.view.$('.uv-required-callout').text().trim())
      .toBe('Biometric verification or a PIN is required to sign in with this authenticator.');
  });

  it('does not show UV required callout when userVerification is "discouraged"', function () {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    const currentAuthenticatorEnrollment = JSON.parse(JSON.stringify(ChallengeWebauthnResponse.currentAuthenticatorEnrollment.value));
    currentAuthenticatorEnrollment.contextualData.challengeData.userVerification = 'discouraged';
    this.init(currentAuthenticatorEnrollment);
    expect(this.view.$('.uv-required-callout').length).toBe(0);
  });

  it('saveForm is called with model when credentials.get succeeds', function (done) {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    const assertion = {
      response: {
        clientDataJSON: 123,
        authenticatorData: 234,
        signature: 'magizh'
      }
    };
    navigator.credentials = {
      get: jasmine.createSpy('webauthn-spy')
    };
    spyOn(BaseForm.prototype, 'saveForm');
    spyOn(navigator.credentials, 'get').and.returnValue(Promise.resolve(assertion));

    this.init(ChallengeWebauthnResponse.currentAuthenticatorEnrollment.value, ChallengeWebauthnResponse.authenticatorEnrollments);

    Expect.waitForSpyCall(this.view.form.saveForm).then(() => {
      expect(navigator.credentials.get).toHaveBeenCalledWith({
        publicKey: {
          allowCredentials: [{
            type: 'public-key',
            id: CryptoUtil.strToBin('hpxQXbu5R5Y2JMqpvtE9Oo9FdwO6z2kMR-ZQkAb6p6GSguXQ57oVXKvpVHT2fyCR_m2EL1vIgszxi00kyFIX6w')
          }, {
            type: 'public-key',
            id: CryptoUtil.strToBin('7Ag2iWUqfz0SanWDj-ZZ2fpDsgiEDt_08O1VSSRZHpgkUS1zhLSyWYDrxXXB5VE_w1iiqSvPaRgXcmG5rPwB-w')
          }],
          userVerification: 'required',
          challenge: CryptoUtil.strToBin(ChallengeWebauthnResponse.currentAuthenticatorEnrollment.value.contextualData.challengeData.challenge),
        },
        signal: jasmine.any(Object),
      });
      expect(this.view.form.model.get('credentials')).toEqual({
        clientData: CryptoUtil.binToStr(assertion.response.clientDataJSON),
        authenticatorData: CryptoUtil.binToStr(assertion.response.authenticatorData),
        signatureData: CryptoUtil.binToStr(assertion.response.signature),
      });
      expect(this.view.form.saveForm).toHaveBeenCalledWith(this.view.form.model);
      expect(this.view.form.webauthnAbortController).toBe(null);
      done();
    }).catch(done.fail);
  });

  it('error is displayed when credentials.get fails', function (done) {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    navigator.credentials = {
      get: jasmine.createSpy('webauthn-spy')
    };
    spyOn(navigator.credentials, 'get').and.returnValue(Promise.reject({message: 'error from browser'}));

    this.init();

    Expect.waitForCss('.infobox-error').then(() => {
      expect(this.view.$el.find('.infobox-error')[0].textContent.trim()).toBe('error from browser');
      expect(this.view.form.webauthnAbortController).toBe(null);
      done();
    }).catch(done.fail);
  });
});
