import { View, createButton } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

export default View.extend({
  className: 'custom-buttons',
  template: hbs`
    {{#if addSeparateLine}}
    <div class="separation-line"><span>{{i18n code="socialauth.divider.text" bundle="login"}}</span></div>
    {{/if}}
    <div class="okta-custom-buttons-container primary-auth-container"></div>
    `,

  initialize(options) {
    options.customButtons.forEach((idpButton) => {
      this.add(createButton(idpButton), '.okta-custom-buttons-container');
    });
  },

  getTemplateData() {
    const jsonData = View.prototype.getTemplateData.apply(this, arguments);

    return Object.assign(jsonData, {
      addSeparateLine: this.options.addSeparateLine,
    });
  }
});
