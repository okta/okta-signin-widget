import BaseForm from './BaseForm';

export default BaseForm.extend({
  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.listenTo(this.options.appState, 'refreshUpdated', function (currentViewState) {
      if (this.polling) {
        this.options.currentViewState = currentViewState;
        this.stopPolling();
        this.startPolling();
      }
    });
  },
});
