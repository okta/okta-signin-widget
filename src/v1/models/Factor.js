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
/* eslint complexity: [2, 13] */
import { _, loc, Collection } from '@okta/courage';
import Q from 'q';
import { AuthStopPollInitiationError } from 'util/Errors';
import factorUtil from 'util/FactorUtil';
import Util from 'util/Util';
import BaseLoginModel from './BaseLoginModel';
const PUSH_INTERVAL = 4000;

// Avoid setting interval to same value as keep-alive time (5 seconds) because it
// caused an occasional issue with network connection lost errors in Safari and IE

const FactorFactor = BaseLoginModel.extend({
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
        'token:hotp',
        'token:hardware',
        'question',
        'push',
        'u2f',
        'password',
        'assertion:saml2',
        'assertion:oidc',
        'claims_provider',
        'webauthn',
      ],
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
        'CUSTOM',
        'GENERIC_SAML',
        'GENERIC_OIDC',
      ],
    },
    enrollment: {
      type: 'string',
      values: ['OPTIONAL', 'REQUIRED'],
    },
    status: {
      type: 'string',
      values: ['NOT_SETUP', 'ACTIVE'],
    },
    profile: ['object'],
    vendorName: 'string',
    policy: ['object'],
    profiles: ['object'],
  },

  local: {
    answer: 'string',
    password: 'string',
    backupFactor: 'object',
    showAnswer: 'boolean',
    rememberDevice: 'boolean',
    autoPush: ['boolean', true, false],
  },

  derived: {
    isOktaFactor: {
      deps: ['provider'],
      fn: function(provider) {
        return provider === 'OKTA';
      },
    },
    factorName: {
      deps: ['provider', 'factorType'],
      fn: factorUtil.getFactorName,
    },
    factorLabel: {
      deps: ['provider', 'factorType', 'vendorName'],
      fn: function(provider, factorType, vendorName) {
        if (_.contains(['DEL_OATH', 'GENERIC_SAML', 'GENERIC_OIDC', 'CUSTOM'], provider)) {
          return vendorName;
        }
        return factorUtil.getFactorLabel.apply(this, [provider, factorType]);
      },
    },
    factorDescription: {
      deps: ['provider', 'factorType'],
      fn: factorUtil.getFactorDescription,
    },
    sortOrder: {
      deps: ['provider', 'factorType'],
      fn: factorUtil.getFactorSortOrder,
    },
    iconClassName: {
      deps: ['provider', 'factorType'],
      fn: factorUtil.getFactorIconClassName,
    },
    securityQuestion: {
      deps: ['profile', 'factorType'],
      fn: function(profile, factorType) {
        if (factorType !== 'question') {
          return null;
        }
        return profile && factorUtil.getSecurityQuestionLabel(profile);
      },
    },
    phoneNumber: {
      deps: ['profile', 'factorType'],
      fn: function(profile, factorType) {
        if (_.contains(['sms', 'call'], factorType)) {
          return profile && profile.phoneNumber;
        }
        return null;
      },
    },
    email: {
      deps: ['profile', 'factorType'],
      fn: function(profile, factorType) {
        if (factorType === 'email') {
          return profile && profile.email;
        }
        return null;
      },
    },
    deviceName: {
      deps: ['profile', 'factorType'],
      fn: function(profile, factorType) {
        if (factorType !== 'push') {
          return null;
        }
        return profile && profile.name;
      },
    },
    enrolled: {
      deps: ['status'],
      fn: function(status) {
        return status === 'ACTIVE';
      },
    },
    cardinality: {
      deps: ['policy', 'profiles'],
      fn: function(policy, profiles) {
        if (profiles && profiles.length > 0) {
          const profile = profiles[0];
          //assume for now we only get one profile (multiple profiles are not supported yet)

          const enrolled = profile._embedded.enrolledFactors.length;

          const adoption = _.findWhere(profile._embedded.features, { type: 'adoption' });

          if (adoption && adoption.cardinality) {
            return {
              enrolled: enrolled,
              minimum: adoption.cardinality.min,
              maximum: adoption.cardinality.max,
            };
          }
          return false;
        } else if (policy && policy.enrollment) {
          return policy.enrollment;
        } else {
          return false;
        }
      },
    },
    additionalEnrollment: {
      deps: ['cardinality'],
      fn: function(cardinality) {
        if (cardinality) {
          return cardinality.enrolled !== 0 && cardinality.enrolled < cardinality.maximum;
        } else {
          return false;
        }
      },
    },
    required: {
      deps: ['enrollment'],
      fn: function(enrollment) {
        return enrollment === 'REQUIRED';
      },
    },
    canUseResend: {
      deps: ['provider', 'factorType'],
      fn: function(provider, factorType) {
        // Only push, sms and call have resend links.
        return provider === 'OKTA' && _.contains(['push', 'sms', 'call', 'email'], factorType);
      },
    },
    isAnswerRequired: {
      deps: ['factorType'],
      fn: function(factorType) {
        return _.contains(['sms', 'call', 'email', 'token', 'token:software:totp', 'question'], factorType);
      },
    },
    isFactorTypeVerification: {
      deps: ['provider', 'id'],
      fn: function(provider, id) {
        return provider === undefined && id === undefined;
      },
    },
  },

  parse: function(attributes) {
    this.settings = attributes.settings;
    this.appState = attributes.appState;
    // set the initial value for remember device.
    attributes.rememberDevice = factorUtil.getRememberDeviceValue(this.appState);

    // Add vendorname for custom totp enroll
    this.setCustomHotpVendorName(attributes);
    return _.omit(attributes, ['settings', 'appState']);
  },

  validate: function() {
    if (this.get('isAnswerRequired') && !this.get('answer')) {
      return { answer: loc('model.validation.field.blank') };
    } else if (this.get('factorType') === 'password' && !this.get('password')) {
      return { password: loc('error.password.required') };
    }
  },
  needsPasscode: function() {
    // we don't need passcode for email with magic link flow
    return !(this.options.appState.get('isIdxStateToken') && this.get('factorType') === 'email');
  },
  resend: function() {
    this.trigger('form:clear-errors');
    return this.manageTransaction(function(transaction) {
      const firstLink = transaction.data._links.resend[0];

      return transaction.resend(firstLink.name);
    });
  },

  save: function() {
    const rememberDevice = !!this.get('rememberDevice');
    const self = this;
    // Set/Remove the remember device cookie based on the remember device input.

    return this.manageTransaction(function(transaction, setTransaction) {
      const data = {
        rememberDevice: rememberDevice,
      };

      if (this.get('factorType') === 'question') {
        data.answer = this.get('answer');
      } else if (this.get('factorType') === 'password') {
        data.password = this.get('password');
      } else if (this.needsPasscode()) {
        data.passCode = this.get('answer');
      }

      if (this.pushFactorHasAutoPush()) {
        data.autoPush = this.get('autoPush');
      }

      let promise;

      // MFA_REQUIRED, FACTOR_REQUIRED or UNAUTHENTICATED with factors (passwordlessAuth)
      if (
        transaction.status === 'MFA_REQUIRED' ||
        transaction.status === 'FACTOR_REQUIRED' ||
        this.appState.get('promptForFactorInUnauthenticated')
      ) {
        const factor = this._findFactor(transaction);

        promise = factor.verify(data);
      } else if (this.get('canUseResend') && !this.get('answer') && transaction.resend) {
        // MFA_CHALLENGE/ FACTOR_CHALLENGE
        const firstLink = transaction.data._links.resend[0];

        promise = transaction.resend(firstLink.name);
      } else {
        promise = transaction.verify(data);
      }
      //the 'save' event here is triggered and used in the BaseLoginController
      //to disable the primary button on the factor form
      this.trigger('save');

      return promise.then(function(trans) {
        const options = {
          delay: PUSH_INTERVAL,
          transactionCallBack: transaction => {
            self.options.appState.set('lastAuthResponse', transaction);
          },
        };

        setTransaction(trans);
        // In Okta verify case we initiate poll.
        if ((trans.status === 'MFA_CHALLENGE' && trans.poll) || (trans.status === 'FACTOR_CHALLENGE' && trans.poll)) {
          const deferred = Q.defer();
          const initiatePollTimout = Util.callAfterTimeout(deferred.resolve, PUSH_INTERVAL);
          self.listenToOnce(self.options.appState, 'factorSwitched', () => {
            clearTimeout(initiatePollTimout);
            deferred.reject(new AuthStopPollInitiationError());
          });
          return deferred.promise.then(function() {
            // Stop listening if factor was not switched before poll.
            self.stopListening(self.options.appState, 'factorSwitched');
            if (self.pushFactorHasAutoPush()) {
              options.autoPush = function() {
                return self.get('autoPush');
              };
              options.rememberDevice = function() {
                return self.get('rememberDevice');
              };
            }
            return trans.poll(options).then(function(trans) {
              self.options.appState.set('lastAuthResponse', trans.data);
              setTransaction(trans);
            });
          });
        }
      });
    });
  },

  _findFactor: function(transaction) {
    let factor;

    if (transaction.factorTypes) {
      factor = _.findWhere(transaction.factorTypes, {
        factorType: this.get('factorType'),
      });
    }
    if (!factor) {
      factor = _.findWhere(transaction.factors, {
        id: this.get('id'),
      });
    }
    return factor;
  },

  pushFactorHasAutoPush: function() {
    return this.settings.get('features.autoPush') && this.get('factorType') === 'push';
  },

  setCustomHotpVendorName: function(attributes) {
    // If factor is token:hotp and not enrolled, we assume the first profile is the default.
    // If factor is enrolled, we only support one profile to be enrolled, so find that one
    // and display as enrolled profile. We do this by populating profile name in vendorName.
    if (attributes.factorType === 'token:hotp' && attributes.profiles) {
      if (attributes.status === 'NOT_SETUP') {
        attributes.vendorName = attributes.profiles[0].name;
      } else if (attributes.status === 'ACTIVE') {
        const enrolledProfiles = attributes.profiles.filter(profile => {
          return profile._embedded.enrolledFactors.length > 0;
        });
        attributes.vendorName = enrolledProfiles[0].name;
      }
    }
    return attributes;
  },
});
const FactorFactors = Collection.extend({
  model: FactorFactor,
  comparator: 'sortOrder',

  // One override necessary here - When Okta Verify OTP and Push are in the list,
  // they are presented in the view as one factor - in the beacon menu,
  // there's only one option (Okta Verify), and we show a form with Push
  // with an inline totp option. What we need to do is to add totp
  // as a "backupFactor" for push
  parse: function(factors) {
    // Keep a track of the last used factor, since
    // we need it to determine the default factor.
    this.lastUsedFactor = factors[0];

    const oktaPushFactor = _.findWhere(factors, { provider: 'OKTA', factorType: 'push' });

    let totpFactor;

    if (_.where(factors, { factorType: 'push' }).length > 1) {
      totpFactor = _.findWhere(factors, { factorType: 'token:software:totp' });
    } else {
      totpFactor = _.findWhere(factors, { provider: 'OKTA', factorType: 'token:software:totp' });
    }
    if (!oktaPushFactor || !totpFactor) {
      return factors;
    }

    const isTotpFirst = totpFactor === factors[0];

    const parsedFactors = _.reduce(
      factors,
      function(memo, factor) {
        const isOkta = factor.provider === 'OKTA';
        const isOktaTotp = isOkta && factor.factorType === 'token:software:totp';
        const isOktaPush = isOkta && factor.factorType === 'push';
        const notEnrolled = factor.status !== 'ACTIVE';
        const hideOktaTotp = isOktaTotp && (notEnrolled || oktaPushFactor.status === 'ACTIVE');
        const hideOktaPush = isOktaPush && notEnrolled && totpFactor.status === 'ACTIVE';

        if (hideOktaTotp || hideOktaPush) {
          return memo;
        }

        if (isOktaPush) {
          factor.backupFactor = new FactorFactor(totpFactor, { parse: true });
        }
        memo.push(factor);
        return memo;
      },
      []
    );

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
  getDefaultFactor: function() {
    const factor = _.pick(this.lastUsedFactor, 'factorType', 'provider');

    return this.findWhere(factor);
  },

  getFirstUnenrolledRequiredFactor: function() {
    return this.findWhere({ required: true, enrolled: false });
  },

  _getFactorsOfType: function(factorType) {
    return this.where({ factorType: factorType });
  },

  getFactorIndex: function(factorType, factorId) {
    return this._getFactorsOfType(factorType).findIndex(function(factor) {
      return factor.get('id') === factorId;
    });
  },

  hasMultipleFactorsOfSameType: function(factorType) {
    return this._getFactorsOfType(factorType).length > 1;
  },

  getFactorByTypeAndIndex: function(factorType, factorIndex) {
    return this._getFactorsOfType(factorType)[factorIndex];
  },
});
export default {
  Model: FactorFactor,
  Collection: FactorFactors,
};
