import { userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';
import { within } from '@testing-library/testcafe';

export default class BYOLPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  async countryDropdownHasSelectedText(text) {
    if (userVariables.v3) {
      return this.hasText(text);
    }
    const selectOption = await this.form.findFormFieldInput('country')
      .find('.chzn-container > .chzn-single > span');
    return within(selectOption).getByText(text).exists;
  }
}
