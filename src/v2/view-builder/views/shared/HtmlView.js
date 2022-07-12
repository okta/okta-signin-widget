import { View } from 'okta';
import hbs from 'handlebars-inline-precompile';

export default View.extend({
  template: hbs`{{{message}}}`,
  getTemplateData() {
    return { message: this.options.message };
  }
});