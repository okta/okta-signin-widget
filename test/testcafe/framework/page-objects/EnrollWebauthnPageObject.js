import BasePageObject from './BasePageObject';
import { userVariables } from 'testcafe';

export default class EnrollWebauthnPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  hasEnrollInstruction() {
    if (userVariables.gen3) {
      return this.form.elementExist('[data-se="o-form-explain"]');
    }
    return this.form.elementExist('.idx-webauthn-enroll-text');
  }

  hasWebauthnNotSupportedError() {
    if (userVariables.gen3) {
      return this.form.hasErrorBox();
    }
    return this.form.elementExist('.webauthn-not-supported');
  }

  getWebauthnNotSupportedError() {
    if (userVariables.gen3) {
      return this.form.getErrorBoxText();
    }
    return this.form.el.find('.webauthn-not-supported').innerText;
  }

  setupButtonExists() {
    return this.form.getButton('Set up').exists;
  }

  // Passkey promotion splash helpers ------------------------------------

  hasPasskeyPromotionSplash() {
    if (userVariables.gen3) {
      // v3 renders the illustration via the PasskeyPromotionIllustration renderer,
      // producing an aria-hidden SVG inside the form body.
      return this.form.el.find('svg[viewBox="0 0 350 126"]').exists;
    }
    return this.form.elementExist('.oie-passkey-splash-content');
  }

  getPromoFaqTitleCount() {
    if (userVariables.gen3) {
      // v3 renders FAQ titles as HeadingElements; assert by count of the known copy.
      return this.form.el.find('h2, h3').withText(/passkey/i).count;
    }
    return this.form.el.find('.passkey-promotion-faq-title').count;
  }

  createPasskeyButtonExists() {
    return this.form.getButton('Create a passkey').exists;
  }

  maybeLaterLinkExists() {
    return this.form.getLink('Maybe later').exists;
  }

  async clickMaybeLater() {
    await this.t.click(this.form.getLink('Maybe later'));
  }
}
