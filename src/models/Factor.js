/*!
 * Okta Sign-In Widget SDK LEGAL NOTICES
 *
 * The Okta software accompanied by this notice is provided pursuant to the
 * following terms:
 *
 * Copyright © 2015, Okta, Inc. Licensed under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0. Unless required by applicable
 * law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * The Okta software accompanied by this notice has build dependencies on
 * certain third party software licensed under separate terms ("Third Party
 * Components").
 *
 * Okta makes the following disclaimers regarding the Third Party Components on
 * behalf of itself, the copyright holders, contributors, and licensors of such
 * Third Party Components:
 * TO THE FULLEST EXTENT PERMITTED UNDER APPLICABLE LAW, THE THIRD PARTY
 * COMPONENTS ARE PROVIDED BY THE COPYRIGHT HOLDERS, CONTRIBUTORS, LICENSORS,
 * AND OKTA "AS IS" AND ANY REPRESENTATIONS OR WARRANTIES OF ANY KIND, WHETHER
 * ORAL OR WRITTEN, WHETHER EXPRESS, IMPLIED, OR ARISING BY STATUTE, CUSTOM,
 * COURSE OF DEALING, OR TRADE USAGE, INCLUDING WITHOUT LIMITATION THE IMPLIED
 * WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
 * NON-INFRINGEMENT, ARE DISCLAIMED. IN NO EVENT WILL THE COPYRIGHT OWNER,
 * CONTRIBUTORS, LICENSORS, OR OKTA BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION), HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE THIRD
 * PARTY COMPONENTS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* jshint maxstatements: 18 */
define([
  'okta',
  'util/FactorUtil',
  './BaseLoginModel'
],
function (Okta, factorUtil, BaseLoginModel) {
  var _ = Okta._;
  var $ = Okta.$;
  var LAST_USERNAME_COOKIE_NAME = 'ln';

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
          'token',
          'token:software:totp',
          'token:hardware',
          'question',
          'push'
        ]
      },
      provider: {
        type: 'string',
        values: [
          'OKTA',
          'RSA',
          'SYMANTEC',
          'GOOGLE',
          'YUBICO'
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
      profile: ['object']
    },

    local: {
      'answer': 'string',
      'backupFactor': 'object',
      'showAnswer': 'boolean'
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
        deps: ['provider', 'factorType'],
        fn: factorUtil.getFactorLabel
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
          return profile && profile.questionText;
        }
      },
      phoneNumber: {
        deps: ['profile', 'factorType'],
        fn: function (profile, factorType) {
          if (factorType !== 'sms') {
            return null;
          }
          return profile && profile.phoneNumber;
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
      }
    },

    parse: function (attributes) {
      this.settings = attributes.settings;
      this.appState = attributes.appState;
      return _.omit(attributes, ['settings', 'appState']);
    },

    validate: function() {
      if (this.get('factorType') === 'sms' && !this.get('answer')) {
        return {'answer': Okta.loc('model.validation.field.blank')};
      }
    },

    save: function () {
      var rememberDevice = this.settings.get('features.forceRememberDevice') ? true :
          $.cookie(LAST_USERNAME_COOKIE_NAME);
      return this.doTransaction(function (transaction) {
        var data = {
          rememberDevice: !!rememberDevice
        };
        if (this.get('factorType') === 'question') {
          data.answer = this.get('answer');
        } else {
          data.passCode = this.get('answer');
        }

        var promise;
        // MFA_REQUIRED
        if (transaction.getFactorById) {
          promise = transaction
          .getFactorById(this.get('id'))
          .verifyFactor(data);
        }

        // MFA_CHALLENGE
        else if (this.get('canUseResend') && transaction.resendByName) {
          var firstLink = transaction.response._links.resend[0];
          promise = transaction.resendByName(firstLink.name);
        } else {
          promise = transaction.verifyFactor(data);
        }
        //the 'save' event here is triggered and used in the BaseLoginController
        //to disable the primary button on the factor form
        this.trigger('save');

        return promise
        .then(function (trans) {
          var res = trans.response;
          if (res.status === 'MFA_CHALLENGE' && res._links.next.name === 'poll') {
            return trans.startVerifyFactorPoll(PUSH_INTERVAL);
          }
          return trans;
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
