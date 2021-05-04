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
        name: 'captchaVerify.captchaToken'
      });
      testContext.view.render();
    };
    jest.spyOn(window.document, 'getElementById').mockReturnValue(document.createElement('div'));
  });
  afterEach(function() {
    jest.resetAllMocks();
  });

  it('view renders correctly based on Captcha configuration', function() {
    // If there is Captcha configuration
    testContext.init();
    expect(testContext.view.el).toMatchSnapshot('default');

    // If there is no Captcha configuration - should not render captcha-container
    testContext.init(null);
    expect(testContext.view.el).toMatchSnapshot('with no Captcha configuration');
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

  it('ensure callback for when Captcha is loaded has no issues', function() {
    const original = window.grecaptha;
    window.grecaptcha = {
      render: jest.fn()
    };  
    testContext.init();
    const spy = jest.spyOn(testContext.view.options.appState, 'trigger');
    window.OktaSignInWidgetOnCaptchaLoaded();

    expect(testContext.view.model.get('captchaVerify.captchaToken')).toEqual('tempToken');
    expect(window.grecaptcha.render).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('onCaptchaLoaded', window.grecaptcha);
    window.grecaptcha = original;
  });

  it('Callback for when Captcha is solved submits form', function() {
    const original = window.grecaptha;
    window.grecaptcha = {
      reset: jest.fn()
    };     
    testContext.init();
    testContext.view.$el.find('#captcha-container').attr('data-captcha-id', '0');

    const spy = jest.spyOn(testContext.view.options.appState, 'trigger');
    window.OktaSignInWidgetOnCaptchaSolved('someToken');
    expect(window.grecaptcha.reset).toHaveBeenCalledWith('0');
    expect(testContext.view.model.get('captchaVerify.captchaToken')).toEqual('someToken');
    expect(spy).toHaveBeenCalledWith('saveForm', testContext.view.model);

    window.grecaptcha = original;
  });
});
