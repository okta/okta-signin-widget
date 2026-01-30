import { Model } from '@okta/courage';
import CaptchaView from 'v2/view-builder/views/captcha/CaptchaView';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import enrollProfileWithReCaptcha from '../../../../../../playground/mocks/data/idp/idx/enroll-profile-new-with-recaptcha-v2.json';
import enrollProfileWithHCaptcha from '../../../../../../playground/mocks/data/idp/idx/enroll-profile-new-with-hcaptcha.json';
import { WIDGET_FOOTER_CLASS } from 'v2/view-builder/utils/Constants';

const captchaAltchaObject = {
  captcha: {
    type: 'object',
    value: {
      id: 'altcha',
      name: 'altcha',
      siteKey: 'altcha-site-key',
      type: 'ALTCHA'
    }
  }
};

const captchaAltchaWithChallengeUrl = {
  captcha: {
    type: 'object',
    value: {
      id: 'altcha',
      name: 'altcha',
      siteKey: 'altcha-site-key',
      type: 'ALTCHA',
      challengeUrlForm: {
        href: 'https://custom.okta.com/altcha/challenge',
        method: 'POST',
        accepts: 'application/json',
        value: [{ name: 'stateHandle' }],
      }
    }
  }
};

describe('v2/view-builder/views/CaptchaView', function() {
  let testContext;
  let language = undefined;
  let hcaptchaOptions = {};
  let recaptchaOptions = {};
  beforeEach(function() { 
    testContext = {};
    testContext.init = (captcha = enrollProfileWithReCaptcha.captcha.value) => {
      const settings = new Settings({
        baseUrl: 'http://base.okta.com',
        language,
        stateToken: 'test-state-token',
        ...hcaptchaOptions,
        ...recaptchaOptions,
      });
      const appState = new AppState({
        captcha
      }, { settings });
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
    // Mock browser locale
    jest.spyOn(navigator, 'language', 'get').mockReturnValue('en');

    const spy = jest.spyOn(CaptchaView.prototype, '_loadCaptchaLib');
    testContext.init();
    expect(spy).toHaveBeenCalledWith('https://www.google.com/recaptcha/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en');
    
    testContext.init(enrollProfileWithHCaptcha.captcha.value);
    expect(spy).toHaveBeenCalledWith('https://hcaptcha.com/1/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en');

    // Switch the language for SIW and ensure Captcha gets loaded with correct locale
    language = 'fr';
    testContext.init();
    expect(spy).toHaveBeenCalledWith('https://www.google.com/recaptcha/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=fr');
    
    testContext.init(enrollProfileWithHCaptcha.captcha.value);
    expect(spy).toHaveBeenCalledWith('https://hcaptcha.com/1/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=fr');
  });

  it('Captcha gets loaded properly with custom script URI', function() {
    // Mock browser locale
    jest.spyOn(navigator, 'language', 'get').mockReturnValue('en');
    language = undefined;

    const spy = jest.spyOn(CaptchaView.prototype, '_loadCaptchaLib');

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
    expect(spy).toHaveBeenCalledWith('https://cn1.hcaptcha.com/1/api.js?endpoint=https%3A%2F%2Fcn1.hcaptcha.com&assethost=https%3A%2F%2Fassets-cn1.hcaptcha.com&imghost=https%3A%2F%2Fimgs-cn1.hcaptcha.com&reportapi=https%3A%2F%2Freportapi-cn1.hcaptcha.com&onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en');

    // Set reCAPTCHA options for SIW and ensure hCaptcha gets loaded with correct custom URL
    recaptchaOptions = {
      'recaptcha.scriptSource': 'https://recaptcha.net/recaptcha/api.js',
    };
    testContext.init();
    expect(spy).toHaveBeenCalledWith('https://recaptcha.net/recaptcha/api.js?onload=OktaSignInWidgetOnCaptchaLoaded&render=explicit&hl=en');
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

  describe('ALTCHA Captcha', function() {
    it('view renders correctly with ALTCHA configuration', function() {
      testContext.init(captchaAltchaObject.captcha.value);
      expect(testContext.view.el).toMatchSnapshot('with ALTCHA configuration');
    });

    it('ALTCHA Captcha gets loaded with correct URL', function() {
      const spy = jest.spyOn(CaptchaView.prototype, '_loadCaptchaLib');
      testContext.init(captchaAltchaObject.captcha.value);
      expect(spy).toHaveBeenCalledWith('https://cdn.jsdelivr.net/gh/altcha-org/altcha/dist/altcha.min.js');
    });

    it('ALTCHA uses altcha-captcha class in template', function() {
      testContext.init(captchaAltchaObject.captcha.value);
      expect(testContext.view.$el.find('#captcha-container').hasClass('altcha-captcha')).toBe(true);
    });

    it('ALTCHA callback creates altcha-widget element with correct attributes', function() {
      testContext.init(captchaAltchaObject.captcha.value);
      
      // Simulate the onAltchaCaptchaLoaded callback
      window.OktaSignInWidgetOnCaptchaLoaded();
      
      const altchaWidget = testContext.view.$el.find('altcha-widget')[0];
      expect(altchaWidget).not.toBeNull();

      expect(altchaWidget.getAttribute('floating')).toBe('true');
      expect(altchaWidget.getAttribute('hidefooter')).toBe('true');
      expect(altchaWidget.getAttribute('hidelogo')).toBe('true');
      expect(altchaWidget.getAttribute('challengeurl')).toBe('http://base.okta.com/api/v1/altcha');
    });

    it('ALTCHA uses custom challengeUrlForm.href when provided in config', function() {
      testContext.init(captchaAltchaWithChallengeUrl.captcha.value);
      
      // Simulate the onAltchaCaptchaLoaded callback
      window.OktaSignInWidgetOnCaptchaLoaded();
      
      const altchaWidget = testContext.view.$el.find('altcha-widget')[0];
      expect(altchaWidget).not.toBeNull();
      expect(altchaWidget.getAttribute('challengeurl')).toBe('https://custom.okta.com/altcha/challenge');
    });

    it('ALTCHA always sets customfetch function', function() {
      testContext.init(captchaAltchaObject.captcha.value);
      
      // Simulate the onAltchaCaptchaLoaded callback
      window.OktaSignInWidgetOnCaptchaLoaded();
      
      const altchaWidget = testContext.view.$el.find('altcha-widget')[0];
      expect(altchaWidget).not.toBeNull();
      expect(altchaWidget.customfetch).toBeDefined();
      expect(typeof altchaWidget.customfetch).toBe('function');
    });

    it('ALTCHA customfetch calls window.fetch directly when challengeUrlForm is not provided', async function() {
      testContext.init(captchaAltchaObject.captcha.value);
      
      window.OktaSignInWidgetOnCaptchaLoaded();
      
      const altchaWidget = testContext.view.$el.find('altcha-widget')[0];
      
      // Define window.fetch before spying since jsdom doesn't provide it
      const originalFetch = window.fetch;
      window.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
      
      const testUrl = '/api/v1/altcha';
      const testInit = { method: 'GET' };
      await altchaWidget.customfetch(testUrl, testInit);
      
      expect(window.fetch).toHaveBeenCalledWith(testUrl, testInit);
      window.fetch = originalFetch;
    });

    it('ALTCHA customfetch sets Content-Type header from challengeUrlForm.accepts', async function() {
      testContext.init(captchaAltchaWithChallengeUrl.captcha.value);
      
      window.OktaSignInWidgetOnCaptchaLoaded();
      
      const altchaWidget = testContext.view.$el.find('altcha-widget')[0];
      
      // Define window.fetch before spying since jsdom doesn't provide it
      const originalFetch = window.fetch;
      window.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
      
      const testUrl = 'https://custom.okta.com/altcha/challenge';
      await altchaWidget.customfetch(testUrl, {});
      
      expect(window.fetch).toHaveBeenCalledWith(testUrl, expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }));
      window.fetch = originalFetch;
    });

    it('ALTCHA customfetch sets HTTP method from challengeUrlForm.method', async function() {
      testContext.init(captchaAltchaWithChallengeUrl.captcha.value);
      
      window.OktaSignInWidgetOnCaptchaLoaded();
      
      const altchaWidget = testContext.view.$el.find('altcha-widget')[0];
      
      // Define window.fetch before spying since jsdom doesn't provide it
      const originalFetch = window.fetch;
      window.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
      
      const testUrl = 'https://custom.okta.com/altcha/challenge';
      await altchaWidget.customfetch(testUrl, {});
      
      expect(window.fetch).toHaveBeenCalledWith(testUrl, expect.objectContaining({
        method: 'POST'
      }));
      window.fetch = originalFetch;
    });

    it('ALTCHA customfetch includes stateHandle in body when value contains stateHandle field', async function() {
      testContext.init(captchaAltchaWithChallengeUrl.captcha.value);
      
      window.OktaSignInWidgetOnCaptchaLoaded();
      
      const altchaWidget = testContext.view.$el.find('altcha-widget')[0];
      
      // Define window.fetch before spying since jsdom doesn't provide it
      const originalFetch = window.fetch;
      window.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
      
      const testUrl = 'https://custom.okta.com/altcha/challenge';
      await altchaWidget.customfetch(testUrl, {});
      
      expect(window.fetch).toHaveBeenCalledWith(testUrl, expect.objectContaining({
        body: JSON.stringify({ stateHandle: 'test-state-token' })
      }));
      window.fetch = originalFetch;
    });

    it('ALTCHA callback sets up temp token and triggers onCaptchaLoaded', function() {
      testContext.init(captchaAltchaObject.captcha.value);
      const spy = jest.spyOn(testContext.view.options.appState, 'trigger');
      
      window.OktaSignInWidgetOnCaptchaLoaded();
      
      expect(testContext.view.model.get('captchaVerify.captchaToken')).toEqual('tempToken');
      expect(testContext.view.$el.find('#captcha-container').attr('data-captcha-id')).toEqual('altcha');
      expect(spy).toHaveBeenCalledWith('onCaptchaLoaded', expect.any(HTMLElement));
    });

    it('ALTCHA widget strings attribute contains localized strings', function() {
      testContext.init(captchaAltchaObject.captcha.value);
      
      window.OktaSignInWidgetOnCaptchaLoaded();
      
      const altchaWidget = testContext.view.$el.find('altcha-widget')[0];
      expect(altchaWidget).not.toBeNull();

      const stringsAttr = altchaWidget.getAttribute('strings');
      expect(stringsAttr).not.toBeNull();
      
      const strings = JSON.parse(stringsAttr);
      expect(strings).toHaveProperty('error');
      expect(strings).toHaveProperty('expired');
      expect(strings).toHaveProperty('label');
      expect(strings).toHaveProperty('loading');
      expect(strings).toHaveProperty('reload');
      expect(strings).toHaveProperty('verify');
      expect(strings).toHaveProperty('verificationRequired');
      expect(strings).toHaveProperty('verified');
      expect(strings).toHaveProperty('verifying');
      expect(strings).toHaveProperty('waitAlert');
    });

    it('ALTCHA verified event triggers form submission with correct token', function() {
      testContext.init(captchaAltchaObject.captcha.value);
      const spy = jest.spyOn(testContext.view.options.appState, 'trigger');
      
      window.OktaSignInWidgetOnCaptchaLoaded();
      
      // Mock the reset method on window.altcha since onCaptchaSolved calls captchaObject.reset()
      window.altcha.reset = jest.fn();
      
      const altchaWidget = testContext.view.$el.find('altcha-widget')[0];
      expect(altchaWidget).not.toBeNull();
      
      // Simulate the verified event
      const verifiedEvent = new CustomEvent('verified', {
        detail: { payload: 'altcha-test-token' }
      });
      altchaWidget.dispatchEvent(verifiedEvent);
      
      expect(window.altcha.reset).toHaveBeenCalledWith('altcha');
      expect(testContext.view.model.get('captchaVerify.captchaToken')).toEqual('altcha-test-token');
      expect(spy).toHaveBeenCalledWith('altchaSolved');
    });

    it('ALTCHA _getCaptchaObject returns window.altcha', function() {
      testContext.init(captchaAltchaObject.captcha.value);
      
      window.OktaSignInWidgetOnCaptchaLoaded();

      const captchaObj = testContext.view._getCaptchaOject();
      expect(captchaObj).toBe(window.altcha);
    });

    it('ALTCHA script tag is loaded with type="module"', function() {
      const appendChildSpy = jest.fn();
      jest.spyOn(window.document, 'getElementById').mockReturnValue({
        appendChild: appendChildSpy
      });
      
      testContext.init(captchaAltchaObject.captcha.value);
      
      expect(appendChildSpy).toHaveBeenCalled();
      const scriptTag = appendChildSpy.mock.calls[0][0];
      expect(scriptTag.type).toBe('module');
      expect(scriptTag.src).toContain('altcha');
    });
  });
});
