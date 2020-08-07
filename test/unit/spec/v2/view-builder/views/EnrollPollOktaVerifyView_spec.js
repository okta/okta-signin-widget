import EnrollPollOktaVerifyView from 'v2/view-builder/views/ov/EnrollPollOktaVerifyView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import $sandbox from 'sandbox';
import BrowserFeatures from 'util/BrowserFeatures';
import xhrAuthenticatorEnrollOktaVerifyQr from '../../../../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-qr';

describe('v2/view-builder/views/ov/EnrollPollOktaVerifyView', function () {
  beforeEach(function () {
    this.init = (currentAuthenticator = xhrAuthenticatorEnrollOktaVerifyQr.currentAuthenticator.value) => {
      const currentViewState = {
        name: 'enroll-poll',
        relatesTo: {
          value: currentAuthenticator
        },
      };
      const appState = new AppState({
        currentAuthenticator
      });
      spyOn(appState, 'hasRemediationObject').and.callFake((formName) => formName === 'select-enrollment-channel');
      spyOn(appState, 'trigger');
      const settings = new Settings({ baseUrl: 'http://localhost:3000' });
      this.view = new EnrollPollOktaVerifyView({
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

  it('triggers switchForm on appState when on ios device to select channel', function () {
    spyOn(BrowserFeatures, 'isIOS').and.callFake(() => true);
    spyOn(BrowserFeatures, 'isAndroid').and.callFake(() => false);
    this.init();
    expect(BrowserFeatures.isAndroid).toHaveBeenCalled();
    expect(BrowserFeatures.isIOS).toHaveBeenCalled();
    expect(this.view.options.appState.trigger).toHaveBeenCalledWith('switchForm', 'select-enrollment-channel');
  });

  it('triggers switchForm on appState when on android device to select channel', function () {
    spyOn(BrowserFeatures, 'isIOS').and.callFake(() => false);
    spyOn(BrowserFeatures, 'isAndroid').and.callFake(() => true);
    this.init();
    expect(BrowserFeatures.isAndroid).toHaveBeenCalled();
    expect(this.view.options.appState.trigger).toHaveBeenCalledWith('switchForm', 'select-enrollment-channel');
  });

  it('renders QR code view when on desktop', function () {
    spyOn(BrowserFeatures, 'isIOS').and.callFake(() => false);
    spyOn(BrowserFeatures, 'isAndroid').and.callFake(() => false);
    this.init();
    expect(BrowserFeatures.isAndroid).toHaveBeenCalled();
    expect(BrowserFeatures.isIOS).toHaveBeenCalled();
    expect(this.view.options.appState.trigger).not.toHaveBeenCalled();
    expect(this.view.$('.qrcode').length).toBe(1);
  });
});
