import { loc, View, createCallout } from 'okta';
import BrowserFeatures from 'util/BrowserFeatures';
import hbs from 'handlebars-inline-precompile';

export default View.extend({
  // eslint-disable-next-line max-len
  template: hbs`<p class="idx-webauthn-enroll-text">{{i18n code="oie.enroll.metamask.instructions" bundle="login"}}</p>`,
});
