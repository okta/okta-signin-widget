import Form from './Form';
export default Form.extend({
  instructions: function() {
    return this.$('.piv-verify-text p').trimmedText();
  },

  spinningIcon: function() {
    return this.el('piv-waiting');
  },

  backLink: function() {
    return this.el('back-link');
  },
});
