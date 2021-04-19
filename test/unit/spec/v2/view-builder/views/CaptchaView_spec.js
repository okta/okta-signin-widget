import { BaseModel } from 'okta';
import CaptchaView from 'v2/view-builder/views/captcha/CaptchaView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import $sandbox from 'sandbox';
import enrollProfile from '../../../../../../playground/mocks/data/idp/idx/enroll-profile-new.json';

describe('v2/view-builder/views/ov/EnrollPollOktaVerifyView', function() {
  let testContext;
  beforeEach(function() { 
    testContext = {};
    testContext.init = (captcha = enrollProfile.captcha.value) => {
      const appState = new AppState({
        captcha
      });
      const settings = new Settings({ baseUrl: 'http://localhost:3000' });
      testContext.view = new CaptchaView({
        el: $sandbox,
        appState,
        settings,
        currentViewState: {},
        model: new BaseModel(),
      });
      testContext.view.render();
    };
  });

  afterEach(function() {
    $sandbox.empty();
  });

  it('initialize calls _addCaptcha', function() {
    const spy = spyOn(CaptchaView.prototype, '_addCaptcha');
    testContext.init();
    expect(spy).toHaveBeenCalled();
  });

  it('Captcha gets loaded properly', function() {
    const spy = spyOn(CaptchaView.prototype, '_loadCaptchaLib');
    testContext.init();
    expect(spy).toHaveBeenCalledWith('https://www.google.com/recaptcha/api.js?onload=onCaptchaLoaded&render=explicit');
    
    testContext.init(enrollProfile.captcha2.value);
    expect(spy).toHaveBeenCalledWith('https://hcaptcha.com/1/api.js?onload=onCaptchaLoaded&render=explicit');
  });

  it('Captcha gets removed properly', function() {
    spyOn(CaptchaView.prototype, '_loadCaptchaLib');
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
    spyOn(CaptchaView.prototype, '_loadCaptchaLib');
    spyOn(document, 'getElementsByClassName').and.returnValue([document.createElement('button', { 'data-captcha-id' : '0' })]);
    testContext.init();
    const spy = spyOn(testContext.view.options.appState, 'trigger');
    spyOn(testContext.view.model, 'validate').and.returnValue(true);
    spyOn(testContext.view.model, 'isValid').and.returnValue(true);
    testContext.view.onCaptchaSolved('someToken');
    expect(spy).toHaveBeenCalledWith('saveForm', testContext.view.model);
    window.grecaptcha = original;
  });

  it('Callback for when Captcha is solved - does not submit form on errors', function() {
    const original = window.grecaptha;
    window.grecaptcha = {
      reset: function() {}
    };     
    spyOn(CaptchaView.prototype, '_loadCaptchaLib');
    spyOn(document, 'getElementsByClassName').and.returnValue([document.createElement('button', { 'data-captcha-id' : '0' })]);
    testContext.init();
    const spy = spyOn(testContext.view.options.appState, 'trigger');
    spyOn(testContext.view.model, 'validate').and.returnValue({someError: 'someError'});
    spyOn(testContext.view.model, 'isValid').and.returnValue(false);
    testContext.view.onCaptchaSolved('someToken');
    expect(spy).not.toHaveBeenCalled();
    window.grecaptcha = original;
  });
});
