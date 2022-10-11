import BasePageObject from './BasePageObject';

const optionLabelSelector = '.radio-label';
const channelOptionFieldName = 'authenticator.channel';

export default class SwitchOVEnrollPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getOptionCount() {
    return this.form.getElement(optionLabelSelector).count;
  }

  getOptionLabel(index) {
    return this.form.getElement(optionLabelSelector).nth(index).textContent;
  }

  async selectChannelOption(index) {
    await this.form.selectRadioButtonOption(channelOptionFieldName, index);
  }

  isRadioButtonChecked(value) {
    return this.form.elementExist(`input[value="${value}"] + .checked`);
  }

  clickNextButton() {
    return this.form.clickSaveButton();
  }
}
