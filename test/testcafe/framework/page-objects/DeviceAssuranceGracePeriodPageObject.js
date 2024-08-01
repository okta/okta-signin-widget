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
      return this.form.getNthTitle(index + 1);
    }

    return this.form.getElement(END_USER_REMEDIATION_OPTION).nth(index).innerText;
  }

  getWarningBox() {
    if (userVariables.gen3) {
      return this.form.getAlertBox();
    }

    return this.form.getElement(FORM_INFOBOX_WARNING);
  }
}
