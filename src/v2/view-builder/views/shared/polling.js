import { _ } from 'okta';

export default {
  startPolling () {
    const factor = this.options.appState.get('factor');
    const factorPollingInterval = factor && factor.poll && factor.poll.refresh;
    if (_.isNumber(factorPollingInterval)) {
      this.polling = setInterval(()=>{
        this.options.appState.trigger('invokeAction', 'factor-poll');
      }, factorPollingInterval);
    }
  },
  stopPolling () {
    if (this.polling) {
      clearInterval(this.polling);
    }
  }
};
