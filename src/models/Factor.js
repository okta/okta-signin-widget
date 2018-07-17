/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

define([
  'okta',
  'q',
  'util/FactorUtil',
  'util/Util',
  'util/Errors',
  './BaseLoginModel'
],
function (Okta, Q, factorUtil, Util, Errors, BaseLoginModel) {
  var _ = Okta._;

  // Note: Keep-alive is set to 5 seconds - using 5 seconds here will result
  // in network connection lost errors in Safari and IE.
  var PUSH_INTERVAL = 6000;

  var Factor = BaseLoginModel.extend({
    extraProperties: true,
    flat: false,

    props: {
      id: 'string',
      factorType: {
        type: 'string',
        values: [
          'sms',
          'call',
          'email',
          'token',
          'token:software:totp',
          'token:hardware',
          'question',
          'push',
          'u2f',
          'password',
          'assertion:saml2',
          'assertion:oidc'
        ]
      },
      provider: {
        type: 'string',
        values: [
          'OKTA',
          'RSA',
          'DEL_OATH',
          'SYMANTEC',
          'GOOGLE',
          'YUBICO',
          'FIDO',
          'GENERIC_SAML',
          'GENERIC_OIDC'
        ]
      },
      enrollment: {
        type: 'string',
        values: [
          'OPTIONAL',
          'REQUIRED'
        ]
      },
      status: {
        type: 'string',
        values: [
          'NOT_SETUP',
          'ACTIVE'
        ]
      },
      profile: ['object'],
      vendorName: 'string'
    },

    local: {
      'answer': 'string',
      'password': 'string',
      'backupFactor': 'object',
      'showAnswer': 'boolean',
      'rememberDevice': 'boolean',
      'autoPush': ['boolean', true, false]
    },

    derived: {
      isOktaFactor: {
        deps: ['provider'],
        fn: function (provider) {
          return provider === 'OKTA';
        }
      },
      factorName: {
        deps: ['provider', 'factorType'],
        fn: factorUtil.getFactorName
      },
      factorLabel: {
        deps: ['provider', 'factorType', 'vendorName'],
        fn: function (provider, factorType, vendorName) {
          if (_.contains(['DEL_OATH', 'GENERIC_SAML', 'GENERIC_OIDC'], provider)) {
            return vendorName;
          }
          return factorUtil.getFactorLabel.apply(this, [provider, factorType]);
        }
      },
      factorDescription: {
        deps: ['provider', 'factorType'],
        fn: factorUtil.getFactorDescription
      },
      sortOrder: {
        deps: ['provider', 'factorType'],
        fn: factorUtil.getFactorSortOrder
      },
      iconClassName: {
        deps: ['provider', 'factorType'],
        fn: factorUtil.getFactorIconClassName
      },
      securityQuestion: {
        deps: ['profile', 'factorType'],
        fn: function (profile, factorType) {
          if (factorType !== 'question') {
            return null;
          }
          return profile && factorUtil.getSecurityQuestionLabel(profile);
        }
      },
      phoneNumber: {
        deps: ['profile', 'factorType'],
        fn: function (profile, factorType) {
          if (_.contains(['sms', 'call'], factorType)) {
            return profile && profile.phoneNumber;
          }
          return null;
        }
      },
      email: {
        deps: ['profile', 'factorType'],
        fn: function (profile, factorType) {
          if (factorType === 'email') {
            return profile && profile.email;
          }
          return null;
        }
      },
      deviceName: {
        deps: ['profile', 'factorType'],
        fn: function (profile, factorType) {
          if (factorType !== 'push') {
            return null;
          }
          return profile && profile.name;
        }
      },
      enrolled: {
        deps: ['status'],
        fn: function (status) {
          return status === 'ACTIVE';
        }
      },
      required: {
        deps: ['enrollment'],
        fn: function (enrollment) {
          return enrollment === 'REQUIRED';
        }
      },
      canUseResend: {
        deps: ['provider', 'factorType'],
        fn: function (provider, factorType) {
          // Only push, sms and call have resend links.
          return (provider === 'OKTA' && _.contains(['push', 'sms', 'call', 'email'], factorType));
        }
      },
      isAnswerRequired: {
        deps: ['factorType'],
        fn: function (factorType) {
          return _.contains(['sms', 'call', 'email', 'token', 'token:software:totp', 'question'], factorType);
        }
      }
    },

    parse: function (attributes) {
      this.settings = attributes.settings;
      this.appState = attributes.appState;
      // set the initial value for remember device.
      attributes.rememberDevice = factorUtil.getRememberDeviceValue(this.appState);
      return _.omit(attributes, ['settings', 'appState']);
    },

    validate: function () {
      if (this.get('isAnswerRequired') && !this.get('answer')) {
        return {'answer': Okta.loc('model.validation.field.blank')};
      }
      else if(this.get('factorType') === 'password' && !this.get('password')) {
        return {'password': Okta.loc('error.password.required')};
      }
    },

    /* eslint complexity: [2, 7] */
    save: function () {
      var rememberDevice = !!this.get('rememberDevice');
      // Set/Remove the remember device cookie based on the remember device input.
      var self = this;

      return this.manageTransaction(function (transaction, setTransaction) {
        var data = {
          rememberDevice: rememberDevice
        };
        if (this.get('factorType') === 'question') {
          data.answer = this.get('answer');
        }
        else if (this.get('factorType') === 'password') {
          data.password = this.get('password');
        }
        else {
          data.passCode = this.get('answer');
        }

        if (this.pushFactorHasAutoPush()) {
          data.autoPush = this.get('autoPush');
        }

        var promise;
        // MFA_REQUIRED or UNAUTHENTICATED with factors (passwordlessAuth)
        if (transaction.status === 'MFA_REQUIRED' || this.appState.get('promptForFactorInUnauthenticated')) {
          var factor = _.findWhere(transaction.factors, {
            id: this.get('id')
          });
          promise = factor.verify(data);
        }

        // MFA_CHALLENGE
        else if (this.get('canUseResend') && !this.get('answer') && transaction.resend) {
          var firstLink = transaction.data._links.resend[0];
          promise = transaction.resend(firstLink.name);
        } else {
          promise = transaction.verify(data);
        }
        //the 'save' event here is triggered and used in the BaseLoginController
        //to disable the primary button on the factor form
        this.trigger('save');

        return promise
        .then(function (trans) {
          var options = {
            'delay': PUSH_INTERVAL
          };
          setTransaction(trans);
          // In Okta verify case we initiate poll.
          if (trans.status === 'MFA_CHALLENGE' && trans.poll) {
            const deferred = Q.defer();
            const initiatePollTimout = Util.callAfterTimeout(deferred.resolve, PUSH_INTERVAL);
            self.listenToOnce(self.options.appState, 'factorSwitched', () => {
              clearTimeout(initiatePollTimout);
              deferred.reject(new Errors.AuthStopPollInitiationError());
            });
            return deferred.promise.then(function() {
              // Stop listening if factor was not switched before poll.
              self.stopListening(self.options.appState, 'factorSwitched');
              if (self.pushFactorHasAutoPush()) {
                options.autoPush = function () {
                  return self.get('autoPush');
                };
                options.rememberDevice = function () {
                  return self.get('rememberDevice');
                };
              }
              return trans.poll(options).then(function(trans) {
                setTransaction(trans);
              });
            });
          }
        });
      });
    },

    pushFactorHasAutoPush: function() {
      return this.settings.get('features.autoPush') && this.get('factorType') === 'push';
    }
  });

  var Factors = Okta.Collection.extend({

    model: Factor,
    comparator: 'sortOrder',

    // One override necessary here - Okta Verify with Push is treated like
    // one factor. In the beacon menu, there's only one option - only in the
    // view can you choose to enable the other factor (which will be exposed
    // by the backupFactor property)
    parse: function (factors) {
      // Keep a track of the last used factor, since
      // we need it to determine the default factor.
      this.lastUsedFactor = factors[0];

      var oktaPushFactor = _.findWhere(factors, { provider: 'OKTA', factorType: 'push' });
      if (!oktaPushFactor) {
        return factors;
      }
      var totpFactor = _.findWhere(factors, { provider: 'OKTA', factorType: 'token:software:totp' });

      var isTotpFirst = (totpFactor === factors[0]);

      var parsedFactors = _.reduce(factors, function (memo, factor) {
        var isOkta = factor.provider === 'OKTA';
        var isOktaTotp = isOkta && factor.factorType === 'token:software:totp';
        var isOktaPush = isOkta && factor.factorType === 'push';
        var notEnrolled = factor.status !== 'ACTIVE';

        var hideOktaTotp = isOktaTotp && (notEnrolled || oktaPushFactor.status === 'ACTIVE');
        var hideOktaPush = isOktaPush && notEnrolled && totpFactor.status === 'ACTIVE';

        if (hideOktaTotp || hideOktaPush) {
          return memo;
        }

        if (isOktaPush) {
          factor.backupFactor = new Factor(totpFactor, { parse: true });
        }
        memo.push(factor);
        return memo;
      }, []);

      // Use push factor instead of TOTP, if TOTP is first in the list
      // (since it is stored as backupFactor for push).
      if (isTotpFirst) {
        this.lastUsedFactor = oktaPushFactor;
      }

      return parsedFactors;
    },

    // Will need to update this to use HAL link to get last used factor:
    // https://oktainc.atlassian.net/browse/OKTA-58380
    // However, current code returns last used factor as first factor in list.
    // Also, will need to add priority - i.e. if they do not have a last used
    // factor, should try Okta Verify, then Okta SMS, etc.
    getDefaultFactor: function () {
      var factor = _.pick(this.lastUsedFactor, 'factorType', 'provider');
      return this.findWhere(factor);
    },

    getFirstUnenrolledRequiredFactor: function () {
      return this.findWhere({ required: true, enrolled: false });
    }

  });

  return {
    Model: Factor,
    Collection: Factors
  };

});
