import { View, createCallout } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

export default View.extend({
  className: 'oie-webauthn-additional-instructions',
  initialize() {
    const { description } = this.options;
    
    if (description) {
      this.add(View.extend({
        className: 'additional-instructions-title',
        template: hbs`<p>{{i18n code="oie.verify.webauthn.instructions.additional" bundle="login"}}</p>`,
      }));
      
      this.add(
        createCallout({
          subtitle: description,
          className: 'additional-instructions-callout',
        })
      );
    }
  },
});
