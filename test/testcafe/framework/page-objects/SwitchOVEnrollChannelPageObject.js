import BasePageObject from './BasePageObject';
import { userVariables } from 'testcafe';

const optionLabelSelector = '.radio-label';
const channelOptionFieldName = 'authenticator.channel';
const optionLabelSelectorV3 = '[type="radio"]';

export default class SwitchOVEnrollPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getOptionCount() {
    if (userVariables.gen3) {
      return this.form.getElement(optionLabelSelectorV3).count;
    }
    return this.form.getElement(optionLabelSelector).count;
  }

  getOptionLabel(index) {
    if (userVariables.gen3) {
      return this.form.getElement(optionLabelSelectorV3).nth(index)
        .parent('span')
        .parent('label')
        .textContent;
    }
    return this.form.getElement(optionLabelSelector).nth(index).textContent;
  }

  async selectChannelOption(index) {
    await this.form.selectRadioButtonOption(channelOptionFieldName, index);
  }

  isRadioButtonChecked(value) {
    return this.form.getElement(`input[value="${value}"]`).checked;
  }

  clickNextButton() {
    return this.form.clickSaveButton();
  }
}
