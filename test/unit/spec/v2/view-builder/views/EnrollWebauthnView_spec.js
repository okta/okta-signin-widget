import EnrollWebauthnView from 'v2/view-builder/views/webauthn/EnrollWebauthnView';
import AppState from 'v2/models/AppState';
import webauthn from 'util/webauthn';
import $sandbox from 'sandbox';
import BrowserFeatures from 'util/BrowserFeatures';
import EnrollWebauthnResponse from '../../../../../../playground/mocks/data/idp/idx/authenticator-enroll-webauthn.json';

describe('v2/view-builder/views/webauthn/EnrollWebauthnView', function () {
  beforeEach(function () {
    this.init = (currentAuthenticator = EnrollWebauthnResponse.currentAuthenticator.value) => {
      this.view = new EnrollWebauthnView({
        el: $sandbox,
        appState: new AppState({
          currentAuthenticator,
        }),
        currentViewState: {
          name: 'enroll-authenticator',
        },
      });
      this.view.render();
    };
  });

  afterEach(function () {
    $sandbox.empty();
  });

  it('shows enroll instructions and setup button when browser supports webauthn', function () {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    this.init();
    expect(this.view.$('.idx-webauthn-enroll-text').text())
      .toBe('Your browser will prompt to register a security key or biometric authenticator (Windows Hello, Touch ID, etc.). Follow the instructions to complete enrollment.');
    expect(this.view.$('.webauthn-setup').css('display')).toBe('inline');
    expect(this.view.$('.webauthn-setup').text()).toBe('Set up');
    expect(this.view.$('.idx-webauthn-enroll-text-edge').length).toBe(0);
    expect(this.view.$('.webauthn-not-supported').length).toBe(0);
  });

  it('shows error when browser does not support webauthn', function () {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => false);
    this.init();
    expect(this.view.$('.idx-webauthn-enroll-text').length).toBe(0);
    expect(this.view.$('.webauthn-not-supported').length).toBe(1);
    expect(this.view.$('.webauthn-not-supported').text().trim())
      .toBe('Security key or biometric authenticator is not supported on this browser. Contact your admin for assistance.');
  });

  it('shows additional enroll instructions for edge when browser is edge', function () {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    spyOn(BrowserFeatures, 'isEdge').and.callFake(() => true);
    this.init();
    expect(this.view.$('.idx-webauthn-enroll-text').length).toBe(1);
    expect(this.view.$('.idx-webauthn-enroll-text-edge').text().trim())
      .toBe('Note: If you are enrolling a security key and Windows Hello or PIN is enabled, you will need to select \'Cancel\' in the prompt before continuing.');
    expect(this.view.$('.webauthn-setup').length).toBe(1);
  });


  it('shows UV required callout when userVerification is "required"', function () {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    const currentAuthenticator = JSON.parse(JSON.stringify(EnrollWebauthnResponse.currentAuthenticator.value));
    currentAuthenticator.contextualData.activationData.authenticatorSelection.userVerification = 'required';
    this.init(currentAuthenticator);
    expect(this.view.$('.uv-required-callout').length).toBe(1);
    expect(this.view.$('.uv-required-callout').text().trim())
      .toBe('Biometric verification or a PIN is required to setup this authenticator.');
  });

  it('does not show UV required callout when userVerification is "discouraged"', function () {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    const currentAuthenticator = JSON.parse(JSON.stringify(EnrollWebauthnResponse.currentAuthenticator.value));
    currentAuthenticator.contextualData.activationData.authenticatorSelection.userVerification = 'discouraged';
    this.init(currentAuthenticator);
    expect(this.view.$('.uv-required-callout').length).toBe(0);
  });

  it('click on setup hides the setup button and shows spinner', function () {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    this.init();
    this.view.$('.webauthn-setup').click();
    expect(this.view.$('.webauthn-setup').css('display')).toBe('none');
    expect(this.view.$('.okta-waiting-spinner').css('display')).toBe('block');
  });
});
