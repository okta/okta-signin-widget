import { View, createButton } from 'okta';
import hbs from 'handlebars-inline-precompile';

export default View.extend({
  className: 'sign-in-with-idp',
  template: hbs`
    {{#if addSeparateLineAtTop}}
    <div class="separation-line"><span>{{i18n code="socialauth.divider.text" bundle="login"}}</span></div>
    {{/if}}
    <div class="okta-idps-container"></div>
    {{#if addSeparateLineAtBottom}}
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

    return Object.assign(jsonData, {
      addSeparateLineAtTop: this.options.addSeparateLine && !this.options.addSeparateLineAtBottom,
      addSeparateLineAtBottom: this.options.addSeparateLine && this.options.addSeparateLineAtBottom,
    });
  }
});
