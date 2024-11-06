import { _ } from '@okta/courage';
import { MS_PER_SEC } from '../../utils/Constants';
import BrowserFeatures from 'util/BrowserFeatures';

export default {
  startPolling(newRefreshInterval) {
    this.fixedPollingInterval = this.options.currentViewState.refresh;
    this.dynamicPollingInterval = newRefreshInterval;
    this.countDownCounterValue = Math.ceil(this.pollingInterval / MS_PER_SEC);
    // this._bindWindowFocusListener();

    console.log('polling started')

    this._handleWindowUnfocusWhilePolling();
    this.listenToOnce(this.model, 'error', (event) => {
      if (this.pausedForWindowUnfocus) {
        console.log('ignoring polling error due to tab focus')
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
    // if (BrowserFeatures.isIOS()) {
    if (true) {
      const pageVisibilityHandler = () => {
        if (document.hidden && this.polling) {
          // prevent the next poll network request from being sent
          this.stopPolling();
          console.log('POLLING PAUSED')
          this.pausedForWindowUnfocus = true;
          this._handleWindowRefocusWhilePolling();
        }
        document.removeEventListener('visibilitychange', pageVisibilityHandler);
      };

      document.addEventListener('visibilitychange', pageVisibilityHandler);
    }
  },

  _handleWindowRefocusWhilePolling() {
    const pageVisibilityHandler = () => {
      if (!document.hidden && this.pausedForWindowUnfocus) {
        this.pausedForWindowUnfocus = false;
        console.log('POLLING RESTARTED')
        this.startPolling(this.options.appState.get('dynamicRefreshInterval'));
      }

      document.removeEventListener('visibilitychange', pageVisibilityHandler);
    }

    document.addEventListener('visibilitychange', pageVisibilityHandler);
  },

  // _bindWindowFocusListener () {
  //   if (BrowserFeatures.isIOS()) {
  //     const pollInterval = this.fixedPollingInterval ?
  //       this.dynamicPollingInterval || this.fixedPollingInterval :
  //       this.dynamicPollingInterval || authenticator?.poll?.refresh;

  //     let visibilityTimeoutId;
  //     this._visibilityChangeListener = () => {
  //       if (!document.hidden) {
  //         if (this.polling) {
  //           visibilityTimeoutId = setTimeout(() => {
  //             // if polling stops, restart it after a delay
  //             this.stopPolling();
  //             this.startPolling();
  //           }, pollInterval + 100);
  //         }
  //         else {
  //           // if no polling is active, restart it
  //           this.startPolling();
  //         }
  //       }
  //     };
  //     document.addEventListener('visibilitychange', this._visibilityChangeListener);

  //     const onPendingRequestResolves = () => {
  //       clearTimeout(visibilityTimeoutId);
  //     };

  //     this.listenToOnce(this.options.appState, 'saveForm', onPendingRequestResolves);
  //     this.listenToOnce(this.options.appState, 'invokeAction', onPendingRequestResolves);
  //     this.listenToOnce(this.options.appState, 'error', () => {
  //       onPendingRequestResolves();
  //       // if form submission errors (because network request fails), restart polling
  //       this.stopPolling();
  //       this.startPolling();
  //     });
  //   }
  // },

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
            // NOTE: listener bound to appState in form controller (L41)
            // this.polling = null;
            console.log('invoking action');
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
    console.log('queued poll remediation');
    const pollInterval = this.dynamicPollingInterval || this.fixedPollingInterval;
    if (_.isNumber(pollInterval)) {
      this.polling = setTimeout(() => {
        // NOTE: listener bound to appState in form controller (L41)
        // this.polling = null;
        console.log('invoking remediation');
        this.options.appState.trigger('saveForm', this.model);
      }, pollInterval);
    }
  },

  stopPolling() {
    console.log('stop polling called')

    if (this.polling) {
      clearTimeout(this.polling);
      this.polling = null;
    }
  }
};
