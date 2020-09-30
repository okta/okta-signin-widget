import Form from './Form';
const CLASS_SELECTOR = '.error-state';
export default Form.extend({
  isErrorStateView: function () {
    return this.$(CLASS_SELECTOR).length === 1;
  },
});
