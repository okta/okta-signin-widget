import { Selector } from 'testcafe';

const RESEND_EMAIL = '.resend-email-view';

export default class ResendEmailObject {

  constructor (t, parent /* Selector */) {
    this.t = t;
    if (parent) {
      this.el = parent.find(RESEND_EMAIL);
    } else {
      this.el = new Selector(RESEND_EMAIL);
    }
  }

  getText() {
    return this.el.innerText;
  }

  isHidden() {
    return this.el.hasClass('hide');
  }

  click() {
    return this.t.click(this.el.find('a.resend-link'));
  }

}
