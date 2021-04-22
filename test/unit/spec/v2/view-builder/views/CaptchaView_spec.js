import { Model } from 'okta';
import CaptchaView from 'v2/view-builder/views/captcha/CaptchaView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import enrollProfileWithReCaptcha from '../../../../../../playground/mocks/data/idp/idx/enroll-profile-new-with-recaptcha-v2.json';
import enrollProfileWithHCaptcha from '../../../../../../playground/mocks/data/idp/idx/enroll-profile-new-with-hcaptcha.json';
import { WIDGET_FOOTER_CLASS } from 'v2/view-builder/utils/Constants';

describe('v2/view-builder/views/CaptchaView', function() {
  let testContext;
  beforeEach(function() { 
    testContext = {};
    testContext.init = (captcha = enrollProfileWithReCaptcha.captcha.value) => {
      const appState = new AppState({
        captcha
      });
      const settings = new Settings({ baseUrl: 'http://localhost:3000' });
      testContext.view = new CaptchaView({
        appState,
        settings,
        currentViewState: {},
        model: new Model(),
      });
      testContext.view.render();
    };
    jest.spyOn(window.document, 'getElementById').mockReturnValue(document.createElement('div'));
  });
  afterEach(function() {
    jest.resetAllMocks();
  });

  it('initialize calls _addCaptcha', function() {
    const spy = jest.spyOn(CaptchaView.prototype, '_addCaptcha');
    testContext.init();
    expect(spy).toHaveBeenCalled();
  });

  it('_addHCaptchaFooter adds HCAPTCHA footer properly', function() {
    testContext.init();
    testContext.view._addHCaptchaFooter();
    expect(testContext.view.$el.find('.captcha-footer .footer-text').length).toEqual(0);

    const footerDiv = document.createElement('div');
    footerDiv.className = WIDGET_FOOTER_CLASS;
    testContext.view.$el.append(footerDiv);

    jest.spyOn(document, 'getElementsByClassName').mockReturnValue([footerDiv]);
    testContext.captchaConfig = enrollProfileWithHCaptcha.captcha.value;
    testContext.view._addHCaptchaFooter();
    expect(testContext.view.$el.find('.captcha-footer .footer-text').length).toEqual(1);
  });

  it('Captcha gets loaded properly', function() {
    const spy = jest.spyOn(CaptchaView.prototype, '_loadCaptchaLib');
    testContext.init();
    expect(spy).toHaveBeenCalledWith('https://www.google.com/recaptcha/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit');
    
    testContext.init(enrollProfileWithHCaptcha.captcha.value);
    expect(spy).toHaveBeenCalledWith('https://hcaptcha.com/1/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit');
  });

  it('Captcha gets removed properly', function() {
    jest.spyOn(CaptchaView.prototype, '_loadCaptchaLib');
    const original = window.grecaptha;
    window.grecaptcha = {
      reset: function() {}
    };  
    testContext.init();
    testContext.view.remove();
    expect(window.grecaptcha).toEqual(undefined);
    window.grecaptcha = original;
  });

  it('Callback for when Captcha is solved submits form on no errors', function() {
    const original = window.grecaptha;
    window.grecaptcha = {
      reset: function() {}
    };     
    jest.spyOn(document, 'getElementsByClassName').mockReturnValue([document.createElement('button', { 'data-captcha-id' : '0' })]);
    testContext.init();
    const spy = jest.spyOn(testContext.view.options.appState, 'trigger');
    jest.spyOn(testContext.view.model, 'validate').mockReturnValue(true);
    jest.spyOn(testContext.view.model, 'isValid').mockReturnValue(true);
    testContext.view.onCaptchaSolved('someToken');
    expect(spy).toHaveBeenCalledWith('saveForm', testContext.view.model);
    window.grecaptcha = original;
  });

  it('Callback for when Captcha is solved - does not submit form on errors', function() {
    const original = window.grecaptha;
    window.grecaptcha = {
      reset: function() {}
    };     
    jest.spyOn(document, 'getElementsByClassName').mockReturnValue([document.createElement('button', { 'data-captcha-id' : '0' })]);
    testContext.init();
    const spy = jest.spyOn(testContext.view.options.appState, 'trigger');
    jest.spyOn(testContext.view.model, 'validate').mockReturnValue({someError: 'someError'});
    jest.spyOn(testContext.view.model, 'isValid').mockReturnValue(false);
    testContext.view.onCaptchaSolved('someToken');
    expect(spy).not.toHaveBeenCalled();
    window.grecaptcha = original;
  });
});
