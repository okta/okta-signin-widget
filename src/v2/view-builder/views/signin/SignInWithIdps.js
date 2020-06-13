import { View, createButton } from 'okta';

export default View.extend({
  className: 'sign-in-with-idp',
  template: `
      <div class="separation-line"><span>OR</span></div>
      <div class="okta-idps-container"></div>
    `,
  initialize () {
    this.options.idpButtons.forEach((idpButton) => {
      this.add(createButton(idpButton), '.okta-idps-container');
    });
  }
});
