import FormController from 'v2/controllers/FormController';
import transformIdxResponse from 'v2/ion/transformIdxResponse';
import MockUtil from 'helpers/v2/MockUtil';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import $sandbox from 'sandbox';
import BrowserFeatures from 'util/BrowserFeatures';
import xhrAuthenticatorEnrollOktaVerifyQr from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-qr.json';


describe('Okta Verify enrollment', () => {
  let testContext;
  beforeEach(() => {
    testContext = {};
  });
  afterEach(function() {
    $sandbox.empty();
  });

  function initTestContext() {
    const appState = new AppState();
    const settings = new Settings({ baseUrl: 'http://localhost:3000' });
    const view = new FormController({
      el: $sandbox,
      appState,
      settings,
    });
    testContext = {
      appState,
      settings,
      view
    };
  }

  describe('Desktop', () => {
    beforeEach(() => {
      spyOn(BrowserFeatures, 'isIOS').and.callFake(() => false);
      spyOn(BrowserFeatures, 'isAndroid').and.callFake(() => false);
      initTestContext();
    });

    it('shows QR code view', function(done) {
      const { appState, settings, view } = testContext;
      MockUtil.mockIntrospect(done, xhrAuthenticatorEnrollOktaVerifyQr, async (idxResp) => {
        const ionResponse = transformIdxResponse(settings, idxResp);
        await appState.setIonResponse(ionResponse);
        view.render();
        expect(view.$('.select-enrollment-channel--okta_verify').length).toBe(0);
        expect(view.$('.oie-enroll-ov-poll').length).toBe(1);
        expect(view.$('.qrcode').length).toBe(1);
      });
    });

  });

  describe('Mobile', () => {
    beforeEach(() => {
      spyOn(BrowserFeatures, 'isIOS').and.callFake(() => true);
      spyOn(BrowserFeatures, 'isAndroid').and.callFake(() => false);
      initTestContext();
    });

    it('shows select enrollment channel view', function(done) {
      const { appState, settings, view } = testContext;
      MockUtil.mockIntrospect(done, xhrAuthenticatorEnrollOktaVerifyQr, async (idxResp) => {
        const ionResponse = transformIdxResponse(settings, idxResp);
        await appState.setIonResponse(ionResponse);
        view.render();
        expect(view.$('.select-enrollment-channel--okta_verify').length).toBe(1);
        expect(view.$('.oie-enroll-ov-poll').length).toBe(0);
        expect(view.$('.qrcode').length).toBe(0);
      });
    });

  });

});
