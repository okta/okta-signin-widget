/* global Promise */
import { _, $, loc } from 'okta';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import BaseFooter from '../internals//BaseFooter';
import Logger from '../../../util/Logger';

const request = (opts) => {
  const ajaxOptions = Object.assign({
    method: 'GET',
    contentType: 'application/json',
  }, opts);
  return $.ajax(ajaxOptions);
};

const Body = BaseForm.extend({
  noButtonBar: true,

  className: 'ion-form device-challenge-poll',

  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.deviceChallengePollRemediation = this.options.appState.getCurrentViewState();
    this.doChallenge();
  },

  remove () {
    BaseForm.prototype.remove.apply(this, arguments);
    this.stopPolling();
  },

  doChallenge () {
    const deviceChallenge = this.options.appState.get(
      this.deviceChallengePollRemediation.relatesTo
    );
    switch (deviceChallenge.challengeMethod) {
    case 'LOOPBACK':
      this.title = loc('signin', 'login');
      this.add('<div class="spinner"></div>');
      this.doLoopback(deviceChallenge.domain, deviceChallenge.ports, deviceChallenge.challengeRequest);
      break;
    case 'CUSTOM_URI':
      this.title = 'Verify account access';
      this.subtitle = 'Launching Okta Verify...';
      this.add(`
        If nothing prompts from the browser,  
        <a href="#" id="launch-ov" class="link">click here</a> to launch Okta Verify, 
        or make sure Okta Verify is installed.
      `);
      this.customURI = deviceChallenge.href;
      this.doCustomURI();
      this.startPolling();
      break;
    }
  },

  postRender () {
    BaseForm.prototype.postRender.apply(this, arguments);
    this.$('#launch-ov').on('click', this.doCustomURI.bind(this));
  },

  doLoopback (authenticatorDomainUrl = '', ports = [], challengeRequest = '') {
    const self = this;
    let currentPort;
    let foundPort = false;

    const getAuthenticatorUrl = (path) => {
      return `${authenticatorDomainUrl}:${currentPort}/${path}`;
    };

    const checkPort = () => {
      return request({
        url: getAuthenticatorUrl('probe'),
        timeout: 1000 // if authenticator & its probing endpoint exist, it should respond within 1000ms
      });
    };

    const onPortFound = () => {
      foundPort = true;
      return request({
        url: getAuthenticatorUrl('challenge'),
        method: 'POST',
        data: JSON.stringify({ challengeRequest }),
        timeout: 3000 // authenticator should respond within 3000ms for challenge request
      });
    };

    const onFailure = () => {};

    const onProbingComplete = () => {
      Logger.info(`Probing is completed, port ${currentPort} is listening.`);
      self.startPolling();
    };

    const doProbing = () => {
      return checkPort() // 1. jqXHR
        .done(onPortFound) // 2
        .fail(onFailure) // 2
        .then(onProbingComplete); // 3
    };

    let probeChain = Promise.resolve();
    let maxTries = ports.length;
    ports.forEach((port, idx) => {
      probeChain = probeChain
        .then(() => {
          if (!foundPort) {
            currentPort = port;
            return doProbing();
          }
        })
        .catch(() => {
          Logger.info(`Authenticator is not listening to port ${currentPort}.`);
          if (maxTries === idx + 1) { // SIW has exhausted all the ports
            Logger.info('Probing is completed, no port is listening.');
            self.startPolling();
          }
        });
    });
  },

  doCustomURI () {
    return request({
      url: this.customURI,
      method: 'POST',
    });
  },

  startPolling () {
    const deviceChallengePollingInterval = this.deviceChallengePollRemediation.refresh;
    if (_.isNumber(deviceChallengePollingInterval)) {
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

const Footer = BaseFooter.extend({
  links () {
    let links = [];
    const deviceChallenge = this.options.appState.get(
      this.options.appState.getCurrentViewState().relatesTo
    );
    if (deviceChallenge.challengeMethod === 'CUSTOM_URI') {
      links = [
        {
          name: 'sign-in-options',
          type: 'link',
          label: loc('goback', 'login'),
          href: this.settings.get('baseUrl')
        }
      ];
    }
    return links;
  }
});

export default BaseView.extend({
  Body,
  Footer
});
