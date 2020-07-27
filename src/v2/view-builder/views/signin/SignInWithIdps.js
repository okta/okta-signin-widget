import { View, createButton } from 'okta';
import hbs from 'handlebars-inline-precompile';

export default View.extend({
  className: 'sign-in-with-idp',
  template: hbs`
    {{#if addSeparateLine}}
    <div class="separation-line"><span>OR</span></div>
    {{/if}}
    <div class="okta-idps-container"></div>
    `,
  initialize () {
    this.options.idpButtons.forEach((idpButton) => {
      this.add(createButton(idpButton), '.okta-idps-container');
    });
  },

  getTemplateData () {
    const jsonData = View.prototype.getTemplateData.apply(this, arguments);

    return Object.assign(jsonData, {
      addSeparateLine: this.options.addSeparateLine,
    });
  }
});
