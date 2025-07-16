import ChallengeFactorPageObject from './ChallengeFactorPageObject';
import { screen, within } from '@testing-library/testcafe';
import { userVariables } from 'testcafe';

const TOTP_FIELD = 'credentials.totp';

export default class ChallengeOktaVerifyTotpPageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  getTotpLabel() {
    return this.form.getFormFieldLabel(TOTP_FIELD);
  }

  getAnswerInlineError() {
    return this.form.getTextBoxErrorMessage(TOTP_FIELD);
  }

  errorHasSubtitle(subtitle) {
    const alertBox = this.form.getAlertBox();
    return within(alertBox).getByText(subtitle).exists;
  }

  getErrorListContent() {
    const alertBox = this.form.getAlertBox();
    return within(alertBox).getByRole('list');
  }

  getNthErrorBulletPoint(index) {
    const alertBox = this.form.getAlertBox();
    const listItems = within(alertBox).getAllByRole('listitem');
    return listItems.nth(index).innerText;
  }

  formFieldExistsByLabel(label) {
    return this.form.fieldByLabelExists(label);
  }
}
