import { Model } from '@okta/courage';
import CaptchaView from 'v2/view-builder/views/captcha/CaptchaView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import enrollProfileWithReCaptcha from '../../../../../../playground/mocks/data/idp/idx/enroll-profile-new-with-recaptcha-v2.json';
import enrollProfileWithHCaptcha from '../../../../../../playground/mocks/data/idp/idx/enroll-profile-new-with-hcaptcha.json';
import { WIDGET_FOOTER_CLASS } from 'v2/view-builder/utils/Constants';

describe('v2/view-builder/views/CaptchaView', function() {
  let testContext;
  let language = undefined;
  let hcaptchaOptions = {};
  let recaptchaOptions = {};
  let lastScriptElement;
  beforeEach(function() { 
    testContext = {};
    testContext.init = (captcha = enrollProfileWithReCaptcha.captcha.value) => {
      const appState = new AppState({
        captcha
      }, {});
      const settings = new Settings({
        baseUrl: 'http://localhost:3000',
        language,
        ...hcaptchaOptions,
        ...recaptchaOptions,
      });
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

    lastScriptElement = undefined;
    const origCreateElement = window.document.createElement.bind(window.document);
    jest.spyOn(window.document, 'createElement').mockImplementation((tagName, options) => {
      const el = origCreateElement(tagName, options);
      if (tagName === 'script') {
        lastScriptElement = el;
      }
      return el;
    });
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
    // Mock browser locale
    jest.spyOn(navigator, 'language', 'get').mockReturnValue('en');

    const spyGetUrl = jest.spyOn(CaptchaView.prototype, '_getCaptchaUrl');
    testContext.init();
    expect(spyGetUrl).toHaveLastReturnedWith('https://www.google.com/recaptcha/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en');
    
    testContext.init(enrollProfileWithHCaptcha.captcha.value);
    expect(spyGetUrl).toHaveLastReturnedWith('https://hcaptcha.com/1/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en');

    // Switch the language for SIW and ensure Captcha gets loaded with correct locale
    language = 'fr';
    testContext.init();
    expect(spyGetUrl).toHaveLastReturnedWith('https://www.google.com/recaptcha/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=fr');
    
    testContext.init(enrollProfileWithHCaptcha.captcha.value);
    expect(spyGetUrl).toHaveLastReturnedWith('https://hcaptcha.com/1/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=fr');
  });

  // deprecated
  it('Captcha gets loaded properly with custom script URI', function() {
    // Mock browser locale
    jest.spyOn(navigator, 'language', 'get').mockReturnValue('en');
    language = undefined;

    const spyGetUrl = jest.spyOn(CaptchaView.prototype, '_getCaptchaUrl');

    // Set hCaptcha options for SIW and ensure hCaptcha gets loaded with correct custom URL
    hcaptchaOptions = {
      'hcaptcha.scriptSource': 'https://cn1.hcaptcha.com/1/api.js',
      'hcaptcha.scriptParams': {
        endpoint: 'https://cn1.hcaptcha.com',
        assethost: 'https://assets-cn1.hcaptcha.com',
        imghost: 'https://imgs-cn1.hcaptcha.com',
        reportapi: 'https://reportapi-cn1.hcaptcha.com',
      }
    };
    testContext.init(enrollProfileWithHCaptcha.captcha.value);
    expect(spyGetUrl).toHaveBeenCalledWith('https://hcaptcha.com/1/api.js', 'hcaptcha', 0);
    expect(spyGetUrl).toHaveLastReturnedWith('https://cn1.hcaptcha.com/1/api.js?endpoint=https%3A%2F%2Fcn1.hcaptcha.com&assethost=https%3A%2F%2Fassets-cn1.hcaptcha.com&imghost=https%3A%2F%2Fimgs-cn1.hcaptcha.com&reportapi=https%3A%2F%2Freportapi-cn1.hcaptcha.com&onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en');

    // Set reCAPTCHA options for SIW and ensure hCaptcha gets loaded with correct custom URL
    recaptchaOptions = {
      'recaptcha.scriptSource': 'https://recaptcha.net/recaptcha/api.js',
    };
    testContext.init();
    expect(spyGetUrl).toHaveBeenLastCalledWith('https://www.google.com/recaptcha/api.js', 'recaptcha', 0);
    expect(spyGetUrl).toHaveLastReturnedWith('https://recaptcha.net/recaptcha/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en');
  });

  it('hCaptcha gets loaded properly with alternative script URIs', function() {
    // Mock browser locale
    jest.spyOn(navigator, 'language', 'get').mockReturnValue('en');
    language = undefined;

    const spyLoad = jest.spyOn(CaptchaView.prototype, '_loadCaptchaLib');
    const spyGetUrl = jest.spyOn(CaptchaView.prototype, '_getCaptchaUrl');

    // Set hCaptcha options for SIW and ensure hCaptcha gets loaded with correct alternative URL
    hcaptchaOptions = {
      'hcaptcha.alternativeScriptSources': [
        {
          src: 'https://cn1.hcaptcha.com/1/api.js',
          params: {
            endpoint: 'https://cn1.hcaptcha.com',
            assethost: 'https://assets-cn1.hcaptcha.com',
            imghost: 'https://imgs-cn1.hcaptcha.com',
            reportapi: 'https://reportapi-cn1.hcaptcha.com',
          }
        }
      ],
    };
    testContext.init(enrollProfileWithHCaptcha.captcha.value);
    expect(spyGetUrl).toHaveBeenCalledWith('https://hcaptcha.com/1/api.js', 'hcaptcha', 0);
    expect(spyGetUrl).toHaveLastReturnedWith('https://hcaptcha.com/1/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en');

    // Simulate script error #1
    lastScriptElement.onerror();
    expect(spyLoad).toBeCalledTimes(2);
    expect(spyGetUrl).toBeCalledTimes(2);
    expect(spyGetUrl).toHaveBeenLastCalledWith('https://hcaptcha.com/1/api.js', 'hcaptcha', 1);
    expect(spyGetUrl).toHaveLastReturnedWith('https://cn1.hcaptcha.com/1/api.js?endpoint=https%3A%2F%2Fcn1.hcaptcha.com&assethost=https%3A%2F%2Fassets-cn1.hcaptcha.com&imghost=https%3A%2F%2Fimgs-cn1.hcaptcha.com&reportapi=https%3A%2F%2Freportapi-cn1.hcaptcha.com&onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en');

    // Simulate script error #2 (no-op)
    lastScriptElement.onerror();
    expect(spyLoad).toBeCalledTimes(2);
    expect(spyGetUrl).toBeCalledTimes(2);
  });

  it('reCaptcha gets loaded properly with alternative script URIs', function() {
    // Mock browser locale
    jest.spyOn(navigator, 'language', 'get').mockReturnValue('en');
    language = undefined;

    const spyLoad = jest.spyOn(CaptchaView.prototype, '_loadCaptchaLib');
    const spyGetUrl = jest.spyOn(CaptchaView.prototype, '_getCaptchaUrl');

    // Set reCAPTCHA options for SIW and ensure hCaptcha gets loaded with correct alternative URL
    recaptchaOptions = {
      'recaptcha.alternativeScriptSources': [
        'https://recaptcha.net/recaptcha/api.js',
        'https://google.com/recaptcha/api.js',
      ]
    };
    testContext.init();
    expect(spyGetUrl).toHaveBeenLastCalledWith('https://www.google.com/recaptcha/api.js', 'recaptcha', 0);
    expect(spyGetUrl).toHaveLastReturnedWith('https://www.google.com/recaptcha/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en');

    // Simulate script error #1
    lastScriptElement.onerror();
    expect(spyLoad).toBeCalledTimes(2);
    expect(spyGetUrl).toBeCalledTimes(2);
    expect(spyGetUrl).toHaveBeenLastCalledWith('https://www.google.com/recaptcha/api.js', 'recaptcha', 1);
    expect(spyGetUrl).toHaveLastReturnedWith('https://recaptcha.net/recaptcha/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en');

    // Simulate script error #2
    lastScriptElement.onerror();
    expect(spyLoad).toBeCalledTimes(3);
    expect(spyGetUrl).toBeCalledTimes(3);
    expect(spyGetUrl).toHaveBeenLastCalledWith('https://www.google.com/recaptcha/api.js', 'recaptcha', 2);
    expect(spyGetUrl).toHaveLastReturnedWith('https://google.com/recaptcha/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en');

    // Simulate script error #3 (no-op)
    lastScriptElement.onerror();
    expect(spyLoad).toBeCalledTimes(3);
    expect(spyGetUrl).toBeCalledTimes(3);
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
