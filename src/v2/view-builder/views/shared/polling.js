import { _ } from 'okta';

export default {
  startPolling () {
    const factor = this.options.appState.get('factor');
    const factorPollingInterval = factor && factor.poll && factor.poll.refresh;
    if (_.isNumber(factorPollingInterval)) {
      this.polling = setInterval(()=>{
        this.options.appState.trigger('invokeAction', 'factor.poll');
      }, factorPollingInterval);
    }
  },

  // currently only device remediation gets polling info from remediation
  // TODO: OKTA-278849 combine startDevicePolling and startPolling
  startDevicePolling () {
    const pollingInterval = this.options.appState.getCurrentViewState().refresh;
    if (_.isNumber(pollingInterval)) {
      this.polling = setInterval(() => {
        this.options.appState.trigger('saveForm', this.model);
      }, pollingInterval);
    }
  },

  stopPolling () {
    if (this.polling) {
      clearInterval(this.polling);
    }
  }
};
