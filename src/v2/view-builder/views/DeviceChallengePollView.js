/* global Promise */
import { _, $, loc } from 'okta';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import Logger from '../../../util/Logger';

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

  title: loc('signin', 'login'),

  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.deviceChallengePollRemediation = this.options.appState.getCurrentViewState();
    this.doChallenge();
    this.startPolling();
  },

  remove () {
    BaseForm.prototype.remove.apply(this, arguments);
    this.stopPolling();
  },

  doChallenge () {
    const deviceChallenge = this.options.appState.get('currentState')[
      this.deviceChallengePollRemediation.relatesTo
    ];
    switch (deviceChallenge.challengeMethod) {
    case 'LOOPBACK':
      this.doLoopback(deviceChallenge.domain, deviceChallenge.ports, deviceChallenge.challengeRequest);
      break;
    case 'CUSTOM_URI':
      this.doCustomURI(deviceChallenge.href);
      break;
    }
  },

  doLoopback (authenticatorDomainUrl = '', ports = [], challengeRequest = '') {
    let currentPort;
    let foundPort = false;

    const getAuthenticatorUrl = (path) => {
      return `${authenticatorDomainUrl}:${currentPort}/${path}`;
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
          Logger.error('Something unexpected happened during device probing.');
        });
    });
  },

  startPolling () {
    const deviceChallengePollingInterval = this.deviceChallengePollRemediation.refresh;
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
