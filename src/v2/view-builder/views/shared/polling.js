import { _ } from '@okta/courage';
import { MS_PER_SEC } from '../../utils/Constants';
import BrowserFeatures from 'util/BrowserFeatures';

export default {
  startPolling(newRefreshInterval) {
    this.fixedPollingInterval = this.options.currentViewState.refresh;
    this.dynamicPollingInterval = newRefreshInterval;
    this.countDownCounterValue = Math.ceil(this.pollingInterval / MS_PER_SEC);

    this._handleWindowUnfocusWhilePolling();
    this.listenToOnce(this.model, 'error', (event) => {
      if (this.pausedForWindowUnfocus) {
        event.stopImmediatePropagation();
      }
    });

    if (this.pausedForWindowUnfocus) {
      // do not trigger polling request until window has been re-focused (see _handleWindowUnfocus)
      return;
    }

    // Poll is present in remediation form
    if (this.fixedPollingInterval) {
      this._startRemediationPolling();
    } else {
      // Poll is present in authenticator/ authenticator Enrollment obj.
      // Authenticator won't co-exists hence it's safe to trigger both.
      this._startAuthenticatorPolling();
    }
  },

  _handleWindowUnfocusWhilePolling() {
    // The only issue with timeout throttling when the tab is not active has been reported in iOS18
    // for now, this logic will only apply to that environment
    if (BrowserFeatures.isIOS()) {
      const pageVisibilityHandler = () => {
        if (document.hidden && this.polling) {
          // prevent the next poll network request from being sent
          this.stopPolling();
          this.pausedForWindowUnfocus = true;
          this._handleWindowRefocusWhilePolling();
        }
        else if (!document.hidden && this.pausedForWindowUnfocus) {
          document.removeEventListener('visibilitychange', pageVisibilityHandler);
          this.pausedForWindowUnfocus = false;
          this.startPolling(100);
        }
      };

      document.addEventListener('visibilitychange', pageVisibilityHandler);
    }
  },

  _startAuthenticatorPolling() {
    console.log('queued poll action');
    // Authenticator won't co-exists hence it's safe to trigger both.
    [
      'currentAuthenticator',
      'currentAuthenticatorEnrollment',
    ].some(responseKey => {
      if (this.options.appState.has(responseKey)) {
        const authenticator = this.options.appState.get(responseKey);
        const authenticatorPollAction = `${responseKey}-poll`;
        const pollInterval = this.dynamicPollingInterval || authenticator?.poll?.refresh;
        if (_.isNumber(pollInterval)) {
          this.polling = setTimeout(()=>{
            this.options.appState.trigger('invokeAction', authenticatorPollAction);
          }, pollInterval);
        }
        return true;
      } else {
        return false;
      }
    });
  },

  _startRemediationPolling() {
    const pollInterval = this.dynamicPollingInterval || this.fixedPollingInterval;
    if (_.isNumber(pollInterval)) {
      this.polling = setTimeout(() => {
        this.options.appState.trigger('saveForm', this.model);
      }, pollInterval);
    }
  },

  stopPolling() {
    if (this.polling) {
      clearTimeout(this.polling);
      this.polling = null;
    }
  }
};
