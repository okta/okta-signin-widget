import Form from './Form';

const USERCODE_FIELD = 'userCode';
const USERCODE_LABEL = 'label[for="user-code"]';
const NEXT_BUTTON = '.button.button-primary';

export default Form.extend({
  userCodeField: function() {
    return this.input(USERCODE_FIELD);
  },

  userCodeLabel: function() {
    return this.$(USERCODE_LABEL);
  },

  userCodeErrorField: function() {
    return this.error(USERCODE_FIELD);
  },

  nextButton: function() {
    return this.$(NEXT_BUTTON);
  },

  editingUserCode: function(val) {
    const field = this.userCodeField();

    field.val(val);
    field.trigger('change');
    return field;
  },

  setUserCode: function(val) {
    this.editingUserCode(val).trigger('focusout');
  },

  setUserCodeAndTriggerKeyup: function(val) {
    this.editingUserCode(val).trigger('keyup');
  },
});