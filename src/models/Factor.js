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
  'vendor/lib/q',
  'util/FactorUtil',
  './BaseLoginModel'
],
function (Okta, Q, factorUtil, BaseLoginModel) {
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
          'token',
          'token:software:totp',
          'token:hardware',
          'question',
          'push',
          'u2f'
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
          'FIDO'
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
          if (provider === 'DEL_OATH') {
            return vendorName;
          }
          return factorUtil.getFactorLabel(provider, factorType);
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
          // Only push and sms have resend links.
          // However, we currently have a problem with SMS
          // (no way to know whether we want resend or verifyFactor),
          // so we're turning it off for now.
          return (provider === 'OKTA' && factorType === 'push');
        }
      },
      isSMSorCall: {
        deps: ['factorType'],
        fn: function (factorType) {
          return _.contains(['sms', 'call'], factorType);
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
      if (this.get('isSMSorCall') && !this.get('answer')) {
        return {'answer': Okta.loc('model.validation.field.blank')};
      }
    },

    save: function () {
      var rememberDevice = !!this.get('rememberDevice');
      // Set/Remove the remember device cookie based on the remember device input.

      return this.doTransaction(function (transaction) {
        var data = {
          rememberDevice: rememberDevice
        };
        if (this.get('factorType') === 'question') {
          data.answer = this.get('answer');
        } else {
          data.passCode = this.get('answer');
        }

        var promise;
        // MFA_REQUIRED
        if (transaction.status === 'MFA_REQUIRED') {
          var factor = _.findWhere(transaction.factors, {
            id: this.get('id')
          });
          promise = factor.verify(data);
        }

        // MFA_CHALLENGE
        else if (this.get('canUseResend') && transaction.resend) {
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
          if (trans.status === 'MFA_CHALLENGE' && trans.poll) {
            return Q.delay(PUSH_INTERVAL).then(function() {
              return trans.poll(PUSH_INTERVAL);
            });
          }
          return trans;
        })
        .fail(function (err) {
          // Clean up the cookie on failure.
          throw err;
        });
      });
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
