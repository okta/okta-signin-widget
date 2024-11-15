import { userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';

const FORM_INFOBOX_WARNING = '.infobox-warning';
const END_USER_REMEDIATION_OPTION = '.end-user-remediation-option';

export default class DeviceAssuranceGracePeriodPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }
  clickContinueToAppButton() {
    return this.form.clickSaveButton('Continue to app');
  }

  getAnchor(url) {
    return this.form.el.find(`a[href="${url}"]`);
  }

  getOptionHeading(index) {
    if (userVariables.gen3) {
      return this.form.getNthTitle(index + 2);
    }

    return this.form.getElement(END_USER_REMEDIATION_OPTION).nth(index).innerText;
  }

  getWarningBox() {
    if (userVariables.gen3) {
      return this.form.getAlertBox();
    }

    return this.form.getElement(FORM_INFOBOX_WARNING);
  }

  getADPInstallRemediationLink() {
    return this.form.getLink('Install the Android Device Policy app on this device');
  }

  async adpOVInstallInstructionsMessageExists() {
    return this.form.getByTextFn((_, element) =>
      element.textContent === 'Go to Settings in Okta Verify and follow the instructions to install the Android Device Policy app').exists;
  }

  async adpInstallRemediationLinkExists() {
    return this.getADPInstallRemediationLink().exists;
  }

  async clickADPInstallRememdiationLink() {
    await this.t.click(this.getADPInstallRemediationLink());
  }
}
