import { View, createButton } from 'okta';
import { getIdpButtons } from '../../utils/RemediationUtil';

export default View.extend({
  className: 'sign-in-with-idp',
  template: `
      <div class="separation-line"><span>OR</span></div>
      <div class="okta-idps-container"></div>
    `,
  initialize () {
    this.idpButtons = getIdpButtons(this.options.appState.get('idx').neededToProceed);
    this.idpButtons.forEach((idpButton) => {
      this.add(createButton(idpButton), '.okta-idps-container');
    });
  }
});