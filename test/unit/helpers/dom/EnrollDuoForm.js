import Form from './Form';
export default Form.extend({
  backLink: function() {
    return this.el('back-link');
  },

  iframe: function() {
    return this.$('iframe');
  },
});
