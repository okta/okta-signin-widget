import Form from './Form';

export default Form.extend({
  isTerminalSuccessIconPresent() {
    return this.$('.device-code-terminal--icon.success-24-green').length > 0;
  },

  isTerminalErrorIconPresent() {
    return this.$('.device-code-terminal--icon.error-24-red').length > 0;
  },

  isBeaconTerminalPresent() {
    return this.$('[data-se="factor-beacon"]').length > 0;
  },

  isTryAgainButtonPresent() {
    return this.$('[data-se="try-again"]').length > 0;
  },

  tryAgainButton() {
    return this.$('[data-se="try-again"]');
  },
});