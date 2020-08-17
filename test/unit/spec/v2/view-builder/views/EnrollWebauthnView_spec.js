import EnrollWebauthnView from 'v2/view-builder/views/webauthn/EnrollWebauthnView';
import BaseForm from 'v2/view-builder/internals/BaseForm';
import CryptoUtil from 'util/CryptoUtil';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import webauthn from 'util/webauthn';
import $sandbox from 'sandbox';
import BrowserFeatures from 'util/BrowserFeatures';
import Expect from 'helpers/util/Expect';
import EnrollWebauthnResponse from '../../../../../../playground/mocks/data/idp/idx/authenticator-enroll-webauthn.json';

describe('v2/view-builder/views/webauthn/EnrollWebauthnView', function () {
  beforeEach(function () {
    this.init = (currentAuthenticator = EnrollWebauthnResponse.currentAuthenticator.value, authenticatorEnrollments = []) => {
      const currentViewState = {
        name: 'enroll-authenticator',
        relatesTo: {
          value: currentAuthenticator
        },
      };
      const appState = new AppState({
        currentAuthenticator,
        authenticatorEnrollments
      });
      spyOn(appState, 'hasRemediationObject').and.callFake((formName) => formName === 'select-authenticator-enroll');
      spyOn(appState, 'shouldShowSignOutLinkInCurrentForm').and.returnValue(false);
      const settings = new Settings({ baseUrl: 'http://localhost:3000' });
      this.view = new EnrollWebauthnView({
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

  it('saveForm is called when credentials.get succeeds', function (done) {
    const newCredential = {
      response: {
        clientDataJSON: 123,
        attestationObject: 234
      }
    };
    navigator.credentials = {
      get: jasmine.createSpy('webauthn-spy')
    };
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    spyOn(navigator.credentials, 'create').and.returnValue(Promise.resolve(newCredential));
    spyOn(BaseForm.prototype, 'saveForm');

    this.init(EnrollWebauthnResponse.currentAuthenticator.value, EnrollWebauthnResponse.authenticatorEnrollments);
    this.view.$('.webauthn-setup').click();

    Expect.waitForSpyCall(this.view.form.saveForm).then(() => {
      expect(navigator.credentials.create).toHaveBeenCalledWith({
        publicKey: {
          rp: {
            name: 'idx'
          },
          user: {
            id: CryptoUtil.strToBin('00utjm1GstPjCF9Ad0g3'),
            name: 'test@okta.com',
            displayName: 'test user'
          },
          pubKeyCredParams: [{
            type: 'public-key',
            alg: -7
          }, {
            type: 'public-key',
            alg: -257
          }],
          challenge: CryptoUtil.strToBin('zrTo0mMXyCt90mweh2HL'),
          attestation: 'direct',
          authenticatorSelection: {
            userVerification: 'discouraged'
          },
          u2fParams: {
            appid: 'http://idx.okta1.com:1802'
          },
          excludeCredentials: [{
            type: 'public-key',
            id: CryptoUtil.strToBin('hpxQXbu5R5Y2JMqpvtE9Oo9FdwO6z2kMR-ZQkAb6p6GSguXQ57oVXKvpVHT2fyCR_m2EL1vIgszxi00kyFIX6w')
          }, {
            type: 'public-key',
            id: CryptoUtil.strToBin('7Ag2iWUqfz0SanWDj-ZZ2fpDsgiEDt_08O1VSSRZHpgkUS1zhLSyWYDrxXXB5VE_w1iiqSvPaRgXcmG5rPwB-w')
          }]
        },
        signal: jasmine.any(Object)
      });

      expect(this.view.form.model.get('credentials')).toEqual({
        clientData: CryptoUtil.binToStr(newCredential.response.clientDataJSON),
        attestation: CryptoUtil.binToStr(newCredential.response.attestationObject)
      });
      expect(this.view.form.saveForm).toHaveBeenCalledWith(this.view.form.model);
      expect(this.view.form.webauthnAbortController).toBe(null);
      done();
    }).catch(done.fail);
  });

  it('error is displayed when credentials.create fails', function (done) {
    spyOn(webauthn, 'isNewApiAvailable').and.callFake(() => true);
    navigator.credentials = {
      create: jasmine.createSpy('webauthn-spy')
    };
    spyOn(navigator.credentials, 'create').and.returnValue(Promise.reject({message: 'error from browser'}));

    this.init();
    this.view.$('.webauthn-setup').click();

    Expect.waitForCss('.infobox-error').then(() => {
      expect(this.view.$('.infobox-error')[0].textContent.trim()).toBe('error from browser');
      expect(this.view.form.webauthnAbortController).toBe(null);
      done();
    }).catch(done.fail);
  });
});
