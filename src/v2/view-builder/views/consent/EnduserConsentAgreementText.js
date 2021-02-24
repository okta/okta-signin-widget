import { View } from 'okta';
import hbs from 'handlebars-inline-precompile';


export default View.extend({
  className: 'consent-description detail-row',
  template: hbs(
    '\
      <p>{{i18n code="consent.required.description" bundle="login"}}</p>\
    '
  )
});
