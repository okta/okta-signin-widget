import { userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';
import { within } from '@testing-library/testcafe';

export default class BYOLPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  async countryDropdownHasSelectedText(text) {
    if (userVariables.gen3) {
      return this.hasText(text);
    }
    const selectEle = await this.form.getDropDown('country');
    return within(selectEle).getByText(text).exists;
  }
}
