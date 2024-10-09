import BasePageObject from './BasePageObject';
import { ClientFunction } from 'testcafe';

export default class DuoPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  async clickDuoMockLink() {
    const clickFn = ClientFunction(() => {
      var iframe = document.querySelector('iframe:last-child');
      var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      if (iframeDoc.readyState === 'complete') {
        var duoVerifyLink = iframeDoc.getElementById('duoVerifyLink');
        if (duoVerifyLink) {
          duoVerifyLink.click();
        }
      }
    });

    await this.t.wait(100);
    await clickFn();
  }

  hasDuoIframe() {
    return this.form.elementExist('iframe');
  }
}
