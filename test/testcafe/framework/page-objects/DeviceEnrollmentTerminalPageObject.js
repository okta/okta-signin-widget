import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';

const COPY_BUTTON_CLASS = '.copy-clipboard-button';
const COPY_ORG_LINK_BUTTON_CLASS = '.copy-org-clipboard-button';

export default class DeviceEnrollmentTerminalPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.t = t;
    this.beacon = new Selector('.beacon-container');
    this.body = new Selector('.device-enrollment-terminal');
    this.footer = new Selector('.auth-footer');
  }

  getBeaconClass() {
    return this.beacon.find('[data-se="factor-beacon"]').getAttribute('class');
  }

  getHeader() {
    return this.body.find('[data-se="o-form-head"]').innerText;
  }

  getContentText() {
    return this.getTextContent('[data-se="o-form-fieldset-container"]');
  }

  getAppStoreLink() {
    return this.body.find('[data-se="app-store"] a').getAttribute('href');
  }

  getAppStoreLogo() {
    return this.body.find('[data-se="app-store"] .app-store-logo').getAttribute('class');
  }

  getCopyButtonLabel() {
    return this.getTextContent(COPY_BUTTON_CLASS);
  }

  getCopiedValue() {
    return this.body.find(COPY_BUTTON_CLASS).getAttribute('data-clipboard-text');
  }

  getCopyOrgLinkButtonLabel() {
    return this.getTextContent(COPY_ORG_LINK_BUTTON_CLASS);
  }

  getCopiedOrgLinkValue() {
    return this.body.find(COPY_ORG_LINK_BUTTON_CLASS).getAttribute('data-clipboard-text');
  }
}
