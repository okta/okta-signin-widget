import { Selector } from 'testcafe';
import Form from './Form';
export default Form.extend({
  backLink: function() {
    return this.el('back-link');
  },

  buttonBar: function() {
    return this.$('.o-form-button-bar');
  },

  hasErrorBox: function() {
    return this.el('o-form-error-container').find('.infobox-error').length > 0;
  },

  hasSpinner() {
    this.spinner = new Selector('.okta-waiting-spinner');
    return !!this.spinner;
  },

  errorBoxMessage: function() {
    return this.$('.o-form-error-container .infobox-error h4').text().trim();
  },
});
