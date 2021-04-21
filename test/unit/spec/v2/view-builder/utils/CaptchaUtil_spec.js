import $sandbox from 'sandbox';
import { renderCaptcha } from 'v2/view-builder/utils/CaptchaUtil';
import enrollProfile from '../../../../../../playground/mocks/data/idp/idx/enroll-profile-new.json';
import { View } from 'okta';
import Enums from 'util/Enums';

const TestFormView = View.extend({
  render: function() {
    this.$el.html(`
    <div>
      <input class="button-primary"/>
    </div>`);
    return this;
  },
});

describe('CaptchaUtil', () => {
  let testContext = {};
  const onCaptchaSolvedCallback = jest.fn();
  const originalReCaptcha = window.grecaptha;
  const originalHCaptcha = window.hcaptha;
  let testFormView;

  beforeEach(() => {
    testFormView = new TestFormView();
    testFormView.render();

    testContext = {
      captchaConfig: enrollProfile.captcha.value,
      form: testFormView,
      onCaptchaSolvedCallback

    };

    window.grecaptcha = {
      render: jest.fn().mockReturnValue('0')
    };  

    window.hcaptcha = {
      render: jest.fn().mockReturnValue('0')
    }; 
  });

  afterEach(() => {
    $sandbox.empty();
    window.grecaptcha = originalReCaptcha;
    window.hcaptcha = originalHCaptcha;
  });

  it('calling renderCaptcha invoked the Captcha render method', async () => {
    renderCaptcha(testContext.captchaConfig, testContext.form, testContext.onCaptchaSolvedCallback);
    expect(window.grecaptcha.render).toHaveBeenCalled();
    expect(testFormView.$el.find('.button-primary').attr('data-captcha-id')).toEqual('0');
  });

  it('calling renderCaptcha with HCAPTCHA should add footer for HCAPTCHA', async () => {
    const footerDiv = document.createElement('div');
    footerDiv.className = Enums.WIDGET_FOOTER_CLASS;
    testFormView.$el.append(footerDiv);

    spyOn(document, 'getElementsByClassName').and.returnValue([footerDiv]);
    testContext.captchaConfig = enrollProfile.captcha2.value;
    renderCaptcha(testContext.captchaConfig, testContext.form, testContext.onCaptchaSolvedCallback);
    expect(window.hcaptcha.render).toHaveBeenCalled();
    expect(testFormView.$el.find('.button-primary').attr('data-captcha-id')).toEqual('0');
    expect(testFormView.$el.find('.captcha-footer').length).toEqual(1);
  });
});
