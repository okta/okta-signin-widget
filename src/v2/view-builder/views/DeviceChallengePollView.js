/* eslint-disable no-console */
/* global Promise */
import { $, loc, createButton } from 'okta';
import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
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

const deviceName = 'Galaxy S10e'; // Replace this with your Phone Name
const bleService = 'environmental_sensing';
const bleCharacteristic = 'uv_index';
let bluetoothDeviceDetected;
let gattCharacteristics;

const handleChangedValue = function (event) {
  // (2) The BLE Server can send multiple events with Changed Values here
  console.log('Event Arrived :' + event);
};

const connectGATT = function (challengeRequest) {
  if (bluetoothDeviceDetected.gatt.connect && gattCharacteristics) {
    return Promise.resolve();
  }

  return bluetoothDeviceDetected.gatt.connect()
    .then(server => {
      console.log('Getting GATT Service...');
      return server.getPrimaryService(bleService);
    })
    .then(service => {
      console.log('Getting GATT Characteristic...');
      return service.getCharacteristic(bleCharacteristic);
    })
    .then(characteristic => {
      let queue = Promise.resolve();
      gattCharacteristics = characteristic;
      console.log('Characteristic...' + characteristic);
      let decoder = new TextDecoder('utf-8');
      queue = queue.then(() => characteristic.readValue()).then(value => {
        console.log('Manufacturer Name String: ' + decoder.decode(value));
        // (1) Implement Retry of Challenge here to be Synchronized with (2) with some State
        // TODO: Replace this string with Challenge JWT Exactly identical to FastPass format
        gattCharacteristics.writeValue(challengeRequest);
      });
      gattCharacteristics.addEventListener('characteristicvaluechanged', handleChangedValue);
    });
};

const read = function (challengeRequest) {
  if (bluetoothDeviceDetected) {
    return Promise.resolve()
      .then(() => connectGATT(challengeRequest))
      .then(() => {
        console.log('Reading Data....');
        return gattCharacteristics.readValue();
      })
      .catch(error => {
        console.log('Waiting to start reading:' + error);
      });
  }
};

const Body = BaseForm.extend(Object.assign(
  {
    noButtonBar: true,

    className: 'ion-form device-challenge-poll',

    events: {
      'click #launch-ov': function (e) {
        e.preventDefault();
        this.doCustomURI();
      },
      'click #launch-ble': function (e) {
        e.preventDefault();
        const deviceChallenge = this.deviceChallengePollRemediation.relatesTo.value;
        this.doBLE(deviceChallenge.challengeRequest);
      }
    },

    initialize () {
      BaseForm.prototype.initialize.apply(this, arguments);
      this.listenTo(this.model, 'error', this.onPollingFail);
      this.deviceChallengePollRemediation = this.options.appState.getCurrentViewState();
      const deviceChallenge = this.deviceChallengePollRemediation.relatesTo.value;
      const self = this;
      this.add(createButton({
        className: 'button button-wide button-primary',
        title: 'Sign in with BluePass',
        click () {
          self.doBLE(deviceChallenge.challengeRequest);
        }
      }));
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
      this.title = 'Verifying with BluePass';
      this.add('<div class="spinner"></div>');
      this.add(`
        <div class="skinny-content"> If nothing prompts from the browser, <a href="#" id="launch-ble" class="link">click here</a> to launch Okta Verify, or make sure Okta Verify is installed.</div>
      `);
      this.doBLE(deviceChallenge.challengeRequest);
      // switch (deviceChallenge.challengeMethod) {
      // case 'LOOPBACK':
      // case 'CUSTOM_URI':
      // case 'UNIVERSAL_LINK':
      //   this.title = 'Verifying with Okta Verify through bluetooth';
      //   this.add('<div class="spinner"></div>');
      //   this.doBLE(deviceChallenge.challengeRequest);
      // case 'LOOPBACK':
      //   this.title = loc('signin.with.fastpass', 'login');
      //   this.add('<div class="spinner"></div>');
      //   this.doLoopback(deviceChallenge.domain, deviceChallenge.ports, deviceChallenge.challengeRequest);
      //   break;
      // case 'CUSTOM_URI':
      //   this.title = loc('customUri.title', 'login');
      //   this.subtitle = loc('customUri.subtitle', 'login');
      //   this.add(`
      //     {{{i18n code="customUri.content" bundle="login"}}}
      //   `);
      //   this.customURI = deviceChallenge.href;
      //   this.doCustomURI();
      //   break;
      // case 'UNIVERSAL_LINK':
      //   this.title = loc('universalLink.title', 'login');
      //   this.add(`
      //     {{{i18n code="universalLink.content" bundle="login"}}}
      //   `);
      //   this.add(createButton({
      //     className: 'ul-button button button-wide button-primary',
      //     title: loc('universalLink.button', 'login'),
      //     click () {
      //       // only window.location.href can open universal link in iOS/MacOS
      //       // other methods won't do, ex, AJAX get or form get (Util.redirectWithFormGet)
      //       Util.redirect(deviceChallenge.href);
      //     }
      //   }));
      // }
    },

    doBLE (challengeRequest) {
      // this.doChallenge();
      this.startDevicePolling();
      if (navigator.bluetooth) {
        this.probe(challengeRequest);
      }
    },

    probe (challengeRequest) {
      /*
       * For DEMO we can have a whitelist of all the Phones used for testing.
       * This is a major user fiction that will be addressed when caBLE v2 is standardized
      */
      // let options = {
      //   'filters': [
      //     { 'name': deviceName }
      //   ],
      //   'optionalServices' : [bleService]
      // };
      // let options = {
      //   'filters': [
      //     {
      //       'services': ['environmental_sensing']
      //     }
      //   ],
      //   'optionalServices' : [bleService]
      // };
      const options = {
        'acceptAllDevices': true,
        'optionalServices' : [bleService]
      };
      console.log('Requesting Bluetooth Device...');
      navigator.bluetooth.requestDevice(options).then(device => {
        console.log('> Name: ' + device.name);
        bluetoothDeviceDetected = device;
        const data = read(challengeRequest);
        console.log('Data is ' + data);
      }).catch(error => {
        console.log('Argh! ' + error);
      });
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
    const deviceChallenge = this.options.appState.getCurrentViewState().relatesTo.value;

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
