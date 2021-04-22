import { renderCaptcha } from 'v2/view-builder/views/captcha/CaptchaHelper';
import enrollProfileWithReCaptcha from '../../../../../../playground/mocks/data/idp/idx/enroll-profile-new-with-recaptcha-v2.json';
import { View } from 'okta';

const TestFormView = View.extend({
  render: function() {
    this.$el.html(`
    <div>
      <div class="o-form-button-bar">
        <input class="button button-primary" type="submit"/>
      </div>
    </div>`);
    return this;
  },
});

describe('CaptchaHelper', () => {
  let testContext = {};
  const onCaptchaSolvedCallback = jest.fn();
  const originalReCaptcha = window.grecaptha;
  let testFormView;

  beforeEach(() => {
    testFormView = new TestFormView();
    testFormView.render();

    testContext = {
      captchaConfig: enrollProfileWithReCaptcha.captcha.value,
      form: testFormView,
      onCaptchaSolvedCallback

    };

    window.grecaptcha = {
      render: jest.fn().mockReturnValue('0')
    };  
  });

  afterEach(() => {
    window.grecaptcha = originalReCaptcha;
  });

  it('calling renderCaptcha invoked the Captcha render method', async () => {
    renderCaptcha(testContext.captchaConfig, testContext.form, testContext.onCaptchaSolvedCallback);
    expect(window.grecaptcha.render).toHaveBeenCalled();
    expect(testFormView.$el.find('.button-primary').attr('data-captcha-id')).toEqual('0');
  });
});
