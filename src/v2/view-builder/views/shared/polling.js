import { _ } from 'okta';

export default {
  startPolling () {
    // Factor and Authenticator won't co-exists hence it's safe to trigger both.
    this._startAuthenticatorPolling();
  },

  _startAuthenticatorPolling () {
    // Factor and Authenticator won't co-exists hence it's safe to trigger both.
    [
      'currentAuthenticator',
      'currentAuthenticatorEnrollment',
      'factor',
    ].some(responseKey => {
      if (this.options.appState.has(responseKey)) {
        const authenticator = this.options.appState.get(responseKey);
        const authenticatorPollAction = `${responseKey}-poll`;
        const pollInterval = authenticator && authenticator.poll && authenticator.poll.refresh;
        if (_.isNumber(pollInterval)) {
          this.polling = setInterval(()=>{
            this.options.appState.trigger('invokeAction', authenticatorPollAction);
          }, pollInterval);
        }
        return true;
      } else {
        return false;
      }
    });
  },

  // currently only device remediation gets polling info from remediation
  // TODO: OKTA-278849 combine startDevicePolling and startPolling
  startDevicePolling () {
    const pollingInterval = this.options.currentViewState.refresh;
    if (_.isNumber(pollingInterval)) {
      this.polling = setInterval(() => {
        this.options.appState.trigger('saveForm', this.model);
      }, pollingInterval);
    }
  },

  startOVPolling () {
    const pollingInterval = this.options.currentViewState.refresh;
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
