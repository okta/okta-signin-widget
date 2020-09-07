/* global Promise */
import { $, loc, createButton, View } from 'okta';
import hbs from 'handlebars-inline-precompile';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import BaseHeader from '../internals/BaseHeader';
import HeaderBeacon from '../components/HeaderBeacon';
import BaseFooter from '../internals//BaseFooter';
import Logger from '../../../util/Logger';
import DeviceFingerprint from '../../../util/DeviceFingerprint';
import polling from './shared/polling';
import Util from '../../../util/Util';

const request = (opts) => {
  const ajaxOptions = Object.assign({
    method: 'GET',
    contentType: 'application/json',
  }, opts);
  return $.ajax(ajaxOptions);
};

const Body = BaseForm.extend(Object.assign(
  {
    noButtonBar: true,

    className: 'ion-form device-challenge-poll',

    events: {
      'click #launch-ov': function (e) {
        e.preventDefault();
        this.doCustomURI();
      }
    },

    initialize () {
      BaseForm.prototype.initialize.apply(this, arguments);
      this.listenTo(this.model, 'error', this.onPollingFail);
      this.deviceChallengePollRemediation = this.options.currentViewState;
      this.doChallenge();
      this.startPolling();
    },

    onPollingFail () {
      this.$('.spinner').hide();
      this.stopPolling();
    },

    remove () {
      BaseForm.prototype.remove.apply(this, arguments);
      this.stopPolling();
    },

    doChallenge () {
      const deviceChallenge = this.deviceChallengePollRemediation.relatesTo.value;
      switch (deviceChallenge.challengeMethod) {
      case 'LOOPBACK':
        this.title = loc('signin.with.fastpass', 'login');
        this.add(View.extend({
          template: hbs`<div class="spinner"></div>`
        }));
        this.doLoopback(deviceChallenge.domain, deviceChallenge.ports, deviceChallenge.challengeRequest);
        break;
      case 'CUSTOM_URI':
        this.title = loc('customUri.title', 'login');
        this.subtitle = loc('customUri.subtitle', 'login');
        this.add(View.extend({
          template: hbs`{{{i18n code="customUri.content" bundle="login"}}}`
        }));
        this.customURI = deviceChallenge.href;
        this.doCustomURI();
        break;
      case 'UNIVERSAL_LINK':
        this.title = loc('universalLink.title', 'login');
        this.add(View.extend({
          template: hbs`{{{i18n code="universalLink.content" bundle="login"}}}`
        }));
        this.add(createButton({
          className: 'ul-button button button-wide button-primary',
          title: loc('oktaVerify.button', 'login'),
          click: () => {
            // only window.location.href can open universal link in iOS/MacOS
            // other methods won't do, ex, AJAX get or form get (Util.redirectWithFormGet)
            Util.redirect(deviceChallenge.href);
          }
        }));
      }
    },

    doLoopback (authenticatorDomainUrl = '', ports = [], challengeRequest = '') {
      let currentPort;
      let foundPort = false;
      let countFailedPorts = 0;

      const getAuthenticatorUrl = (path) => {
        return `${authenticatorDomainUrl}:${currentPort}/${path}`;
      };

      const checkPort = () => {
        return request({
          url: getAuthenticatorUrl('probe'),
          // in loopback server, SSL handshake sometimes takes more than 1000 ms and thus needs additional timeout
          // however, increasing timeout is a temporary solution since user will need to wait much longer in worst case
          // TODO: OKTA-278573 Android timeout is temporarily set to 3000ms and needs optimization post-Beta
          timeout: DeviceFingerprint.isAndroid() ? 3000 : 1000
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

      const onFailure = () => {
        Logger.error(`Something unexpected happened while we were checking port ${currentPort}.`);
      };

      const doProbing = () => {
        return checkPort()
          // TODO: can we use standard ES6 promise methods, then/catch?
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
            countFailedPorts++;
            Logger.error(`Authenticator is not listening on port ${currentPort}.`);
            if (countFailedPorts === ports.length) {
              Logger.error('No available ports. Loopback server failed and polling is cancelled.');
              this.options.appState.trigger('invokeAction', 'authenticatorChallenge-cancel');
            }
          });
      });
    },

    doCustomURI () {
      this.ulDom && this.ulDom.remove();
      this.ulDom = this.add(`
        <iframe src="${this.customURI}" id="custom-uri-container" style="display:none;"></iframe>
      `).last();
    },
  },

  polling,
));

const Footer = BaseFooter.extend({
  links () {
    let links = [];

    const deviceChallenge = this.options.currentViewState.relatesTo.value;
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
  Header: BaseHeader.extend({
    HeaderBeacon: HeaderBeacon.extend({
      getBeaconClassName: () => 'mfa-okta-verify'
    }),
  }),
  Body,
  Footer
});
