/* global Promise */
import { _, $ } from 'okta';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';

const request = (url, method = 'GET', body = null, timeout = 1000) => {
  return $.ajax({
    url,
    method,
    timeout,
    contentType: 'application/json',
    data: body,
  });
};

const Body = BaseForm.extend({
  noButtonBar: true,

  className: 'ion-form device-challenge-poll',

  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.deviceChallengePollRemediation = this.options.appState.get('remediation').find(
      rem => rem.name === 'device-challenge-poll'
    );
    this.doChallenge();
    this.startPolling();
  },

  remove () {
    BaseForm.prototype.remove.apply(this, arguments);
    this.stopPolling();
  },

  doChallenge () {
    const deviceChallengeHintsKey = this.deviceChallengePollRemediation.relatesTo;
    const deviceChallenge = deviceChallengeHintsKey &&
      this.options.appState.get('currentState')[deviceChallengeHintsKey];
    switch (deviceChallenge.challengeMethod) {
    case 'LOOPBACK':
      this.doLoopback(deviceChallenge.domain, deviceChallenge.ports, deviceChallenge.challengeRequest);
      break;
    case 'custom-scheme':
      this.doCustomURI(deviceChallenge.href);
      break;
    }
  },

  doLoopback (authenticatorDomainUrl = '', ports = [], challengeRequest = '') {
    let currentPort;
    let foundPort = false;

    const getAuthenticatorUrl = (path) => {
      // To use the mock server by running `yarn authenticator`
      // return `http://localhost:4000/${path}?authenticator=${currentPort}`;

      if (authenticatorDomainUrl === 'localhost:3000') {
        // for testing
        return `https://${authenticatorDomainUrl}/${path}${currentPort}`;
      }

      return `http://${authenticatorDomainUrl}:${currentPort}/${path}`;
    };

    const checkPort = () => {
      return request(getAuthenticatorUrl('probe'));
    };

    const onPortFound = () => {
      foundPort = true;
      return request(getAuthenticatorUrl('challenge'), 'POST', JSON.stringify({ challengeRequest }) , 3000);
    };

    const onFailure = () => {};

    const doProbing = () => {
      return checkPort()
        .done(onPortFound)
        .fail(onFailure);
    };

    let probeChain = Promise.resolve();
    ports.forEach(port => {
      probeChain = probeChain
        .then(() => {
          if (!foundPort) {
            currentPort = port;
            return doProbing();
          }
        })
        .catch(() => {
          // console.log('Something unexpected happened during device probing.', 'error');
        });
    });
  },

  startPolling () {
    const deviceChallengePollingInterval = this.deviceChallengePollRemediation &&
      this.deviceChallengePollRemediation.refresh;
    if (_.isNumber(deviceChallengePollingInterval)) {
      // TODO: how to show spinner to indicating action in progress?
      this.polling = setInterval(() => {
        this.options.appState.trigger('saveForm', this.model);
      }, deviceChallengePollingInterval);
    }
  },

  stopPolling () {
    if (this.polling) {
      clearInterval(this.polling);
    }
  },
});

export default BaseView.extend({
  Body,
});
