import Form from './Form';
export default Form.extend({
  title: function() {
    return this.$('[data-se="o-form-head"]');
  },

  backLink: function() {
    return this.el('back-link');
  },

  errorHtml: function() {
    return this.el('o-form-error-html').find('strong');
  },
});
