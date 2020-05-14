import { _ } from 'okta';

export default {
  startPolling () {
    // Factor and Authenticator won't co-exists hence it's safe to trigger both.
    this._startFactorPolling();
    this._startAuthenticatorPolling();
  },

  _startFactorPolling () {
    const factor = this.options.appState.get('factor');
    const factorPollingInterval = factor && factor.poll && factor.poll.refresh;
    if (_.isNumber(factorPollingInterval)) {
      this.polling = setInterval(()=>{
        this.options.appState.trigger('invokeAction', 'factor-poll');
      }, factorPollingInterval);
    }
  },

  _startAuthenticatorPolling () {
    const authenticator = this.options.appState.get('authenticator');
    const pollInterval = authenticator && authenticator.poll && authenticator.poll.refresh;
    if (_.isNumber(pollInterval)) {
      this.polling = setInterval(()=>{
        this.options.appState.trigger('invokeAction', 'authenticator-poll');
      }, pollInterval);
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
