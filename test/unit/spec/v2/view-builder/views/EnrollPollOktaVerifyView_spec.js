import EnrollPollOktaVerifyView from 'v2/view-builder/views/ov/EnrollPollOktaVerifyView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import $sandbox from 'sandbox';
import BrowserFeatures from 'util/BrowserFeatures';
import xhrAuthenticatorEnrollOktaVerifyQr from '../../../../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-qr.json';
import FormController from 'v2/controllers/FormController';
import transformIdxResponse from 'v2/ion/transformIdxResponse';
import MockUtil from '../../../../helpers/v2/MockUtil';

describe('v2/view-builder/views/ov/EnrollPollOktaVerifyView', function() {
  let testContext;
  beforeEach(function() {
    testContext = {};
    testContext.init = (currentAuthenticator = xhrAuthenticatorEnrollOktaVerifyQr.currentAuthenticator.value) => {
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
      testContext.view = new EnrollPollOktaVerifyView({
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

  it('triggers switchForm on appState when on ios device to select channel', function() {
    spyOn(BrowserFeatures, 'isIOS').and.callFake(() => true);
    spyOn(BrowserFeatures, 'isAndroid').and.callFake(() => false);
    testContext.init();
    expect(BrowserFeatures.isAndroid).toHaveBeenCalled();
    expect(BrowserFeatures.isIOS).toHaveBeenCalled();
    expect(testContext.view.options.appState.trigger).toHaveBeenCalledWith('switchForm', 'select-enrollment-channel');
  });

  it('triggers switchForm on appState when on android device to select channel', function() {
    spyOn(BrowserFeatures, 'isIOS').and.callFake(() => false);
    spyOn(BrowserFeatures, 'isAndroid').and.callFake(() => true);
    testContext.init();
    expect(BrowserFeatures.isAndroid).toHaveBeenCalled();
    expect(testContext.view.options.appState.trigger).toHaveBeenCalledWith('switchForm', 'select-enrollment-channel');
  });

  it('renders QR code view when on desktop', function() {
    spyOn(BrowserFeatures, 'isIOS').and.callFake(() => false);
    spyOn(BrowserFeatures, 'isAndroid').and.callFake(() => false);
    testContext.init();
    expect(BrowserFeatures.isAndroid).toHaveBeenCalled();
    expect(BrowserFeatures.isIOS).toHaveBeenCalled();
    expect(testContext.view.options.appState.trigger).not.toHaveBeenCalled();
    expect(testContext.view.$('.qrcode').length).toBe(1);
  });

  it('switches to select enroll method form when on mobile', function(done) {
    MockUtil.mockIntrospect(done, xhrAuthenticatorEnrollOktaVerifyQr, async (idxResp) => {
      const appState = new AppState();
      const settings = new Settings({ baseUrl: 'http://localhost:3000' });
      const ionResponse = transformIdxResponse(settings, idxResp);
      await appState.setIonResponse(ionResponse);
      testContext.view = new FormController({
        el: $sandbox,
        appState,
        settings,
      });
      spyOn(BrowserFeatures, 'isIOS').and.callFake(() => true);
      spyOn(BrowserFeatures, 'isAndroid').and.callFake(() => false);
      testContext.view.render();
      expect(testContext.view.$('.select-enrollment-channel--okta_verify').length).toBe(1);
      expect(testContext.view.$('.oie-enroll-ov-poll').length).toBe(0);
    });
  });
});
