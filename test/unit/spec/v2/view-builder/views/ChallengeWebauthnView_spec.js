import ChallengeWebauthnView from 'v2/view-builder/views/webauthn/ChallengeWebauthnView';
import AppState from 'v2/models/AppState';
import webauthn from 'util/webauthn';
import $sandbox from 'sandbox';
import ChallengeWebauthnResponse from '../../../../../../playground/mocks/data/idp/idx/authenticator-verification-webauthn.json';

describe('v2/view-builder/views/webauthn/ChallengeWebauthnView', function () {
  beforeEach(function () {
    this.init = (currentAuthenticatorEnrollment = ChallengeWebauthnResponse.currentAuthenticatorEnrollment.value,
      authenticatorEnrollments = []) => {
      const appState = new AppState({
        currentAuthenticatorEnrollment,
        authenticatorEnrollments
      });
      spyOn(appState,'hasRemediationObject').and.callFake((formName) => formName === 'select-authenticator-authenticate');
      this.view = new ChallengeWebauthnView({
        el: $sandbox,
        appState,
        currentViewState: {
          name: 'challenge-authenticator',
        },
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

  it('shows verify instructions there are existing enrollments', function () {
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
});
