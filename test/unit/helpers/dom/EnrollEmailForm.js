import Form from './Form';
export default Form.extend({
  enrollEmailContent: function () {
    return this.el('enroll-email-content').trimmedText();
  },
});
