import { _ } from 'okta';

export default {
  addPolling () {
    // auto 'save' the form if `refresh` is set. a.k.a polling
    // UI will re-render per response even it might be same response
    // thus don't need `setInterval`.
    const factor = this.options.appState.get('factor');
    const factorPollingInterval = factor && factor.poll && factor.poll.refresh;
    if (_.isNumber(factorPollingInterval)) {
      this.polling = _.delay(()=>{
        this.options.trigger('invokeAction', 'factor.poll');
      }, factorPollingInterval);
    }
  },
  removePolling () {
    if (this.polling) {
      clearTimeout(this.polling);
    }
  }
};
