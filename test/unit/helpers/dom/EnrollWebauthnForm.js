import Form from './Form';
export default Form.extend({
  enrollInstructions: function() {
    return this.$('.webauthn-enroll-instructions p');
  },

  enrollEdgeInstructions: function() {
    return this.$('.webauthn-edge-text p');
  },

  enrollRestrictions: function() {
    return this.$('.webauthn-restrictions-text p');
  },

  enrollSpinningIcon: function() {
    return this.el('webauthn-waiting');
  },

  backLink: function() {
    return this.el('back-link');
  },

  errorHtml: function() {
    return this.el('o-form-error-html').find('strong');
  },
});
