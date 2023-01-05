import { View, createButton } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

export default View.extend({
  className: 'sign-in-with-idp',
  template: hbs`
    {{#if isSecondaryIdpDisplay}}
    <div class="separation-line"><span>{{i18n code="socialauth.divider.text" bundle="login"}}</span></div>
    {{/if}}
    <div class="okta-idps-container"></div>
    {{#if isPrimaryIdpDisplay}}
    <div class="separation-line"><span>{{i18n code="socialauth.divider.text" bundle="login"}}</span></div>
    {{/if}}    
    `,
  initialize() {
    this.options.idpButtons.forEach((idpButton) => {
      this.add(createButton(idpButton), '.okta-idps-container');
    });
  },

  getTemplateData() {
    const jsonData = View.prototype.getTemplateData.apply(this, arguments);
    const addDivider = this.options.idpButtons.length > 0;

    return Object.assign(jsonData, {
      isPrimaryIdpDisplay: addDivider && this.options.isPrimaryIdpDisplay,
      isSecondaryIdpDisplay: addDivider && !this.options.isPrimaryIdpDisplay
    });
  }
});
