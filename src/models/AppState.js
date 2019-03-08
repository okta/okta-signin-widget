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
  'models/Factor',
  'util/BrowserFeatures',
  'util/Errors'
],
function (Okta, Q, Factor, BrowserFeatures, Errors) {

  // Keep track of stateMachine with this special model. Some reasons to not
  // keep it generic:
  // 1. We know exactly what we're using appState for by requiring props
  // 2. Can have some derived functions to help us translate the lastAuthRes

  var _ = Okta._;
  var $ = Okta.$;

  var DEFAULT_APP_LOGO = '/img/logos/default.png';
  var USER_NOT_SEEN_ON_DEVICE = '/img/security/unknown.png';
  var UNDEFINED_USER = '/img/security/default.png';
  var NEW_USER = '/img/security/unknown-device.png';
  var NEW_USER_IMAGE_DESCRIPTION = '';
  var UNDEFINED_USER_IMAGE_DESCRIPTION = '';
  var UNKNOWN_IMAGE_DESCRIPTION = '';

  var securityImageUrlTpl = Okta.tpl('{{baseUrl}}/login/getimage?username={{username}}');

  function getSecurityImage (baseUrl, username, deviceFingerprint) {
    // When the username is empty, we want to show the default image.
    if (_.isEmpty(username) || _.isUndefined(username)) {
      return Q({
        'securityImage': UNDEFINED_USER,
        'securityImageDescription': UNDEFINED_USER_IMAGE_DESCRIPTION
      });
    }
    
    // Reserved characters in the username must be escaped before the query can be safely executed
    username = encodeURIComponent(username);
    var url = securityImageUrlTpl({ baseUrl: baseUrl, username: username });

    var data = {
      url: url,
      dataType: 'json'
    };
    if (deviceFingerprint) {
      data['headers']= { 'X-Device-Fingerprint': deviceFingerprint };
    }
    return Q($.ajax(data))
      .then(function (res) {
        if (res.pwdImg === USER_NOT_SEEN_ON_DEVICE) {
        // When we get an unknown.png security image from OKTA,
        // we want to show the unknown-device security image.
        // We are mapping the server's img url to a new one because
        // we still need to support the original login page.
          return {
            'securityImage': NEW_USER,
            'securityImageDescription': NEW_USER_IMAGE_DESCRIPTION
          };
        }
        return {
          'securityImage': res.pwdImg,
          'securityImageDescription':
            res.imageDescription || UNKNOWN_IMAGE_DESCRIPTION
        };
      });
  }

  function getMinutesString (factorLifetimeInMinutes) {
    if (factorLifetimeInMinutes > 60 && factorLifetimeInMinutes <= 1440) {
      var lifetimeInHours = (factorLifetimeInMinutes / 60);
      return Okta.loc('hours', 'login', [lifetimeInHours]);
    } else if (factorLifetimeInMinutes > 1440) {
      var lifetimeInDays = (factorLifetimeInMinutes / 1440);
      return Okta.loc('days', 'login', [lifetimeInDays]);
    }
    //Use minutes as the time unit by default
    if (factorLifetimeInMinutes === 1) {
      return Okta.loc('minutes.oneMinute', 'login');
    }
    return Okta.loc('minutes', 'login', [factorLifetimeInMinutes]);
  }

  function getGracePeriodRemainingDays (gracePeriodEndDate) {
    var endDate = new Date(gracePeriodEndDate).getTime();
    var remainingDays = Math.floor((endDate - new Date().getTime()) / (1000 * 3600 * 24));
    return remainingDays;
  }

  function combineFactorsObjects (factorTypes, factors) {
    var addedFactorTypes = [];
    var combinedFactors = [];
    _.each(factors, function (factor) {
      var factorType = factor.factorType;
      if (!_.contains(addedFactorTypes, factorType)) {
        var factorTypeObj = _.findWhere(factorTypes, {factorType: factorType});
        if (factorTypeObj) {
          addedFactorTypes.push(factorType);
          combinedFactors.push(factorTypeObj);
        }
        else {
          combinedFactors.push(factor);
        }
      }
    });
    return combinedFactors;
  }

  return Okta.Model.extend({

    initialize: function () {
      // Handle this in initialize (as opposed to a derived property) because
      // the operation is asynchronous
      if (this.settings.get('features.securityImage')) {
        var self = this;
        this.listenTo(this, 'change:username', function (model, username) {
          getSecurityImage(this.get('baseUrl'), username, this.get('deviceFingerprint'))
            .then(function (image) {
              model.set('securityImage', image.securityImage);
              model.set('securityImageDescription', image.securityImageDescription);
              model.unset('deviceFingerprint'); //Fingerprint can only be used once
            })
            .fail(function (jqXhr) {
            // Only notify the consumer on a CORS error
              if (BrowserFeatures.corsIsNotEnabled(jqXhr)) {
                self.settings.callGlobalError(new Errors.UnsupportedBrowserError(
                  Okta.loc('error.enabled.cors')
                ));
              }
              else {
                throw jqXhr;
              }
            })
            .done();
        });
      }
    },

    local: {
      baseUrl: 'string',
      lastAuthResponse: ['object', true, {}],
      transaction: 'object',
      transactionError: 'object',
      introspectSuccess: 'object', // only set during introspection
      introspectError: 'object', // only set during introspection
      username: 'string',
      factors: 'object',
      policy: 'object',
      securityImage: ['string', true, UNDEFINED_USER],
      securityImageDescription:
          ['string', true, UNDEFINED_USER_IMAGE_DESCRIPTION],
      userCountryCode: 'string',
      userPhoneNumber: 'string',
      factorActivationType: 'string',
      flashError: 'object',
      beaconType: 'string',
      deviceFingerprint: 'string', // valid only once
      typingPattern: 'string',
      // Note: languageCode is special in that it is shared between Settings
      // and AppState. Settings is the *configured* language, and is static.
      // AppState is the dynamic language state - it can be changed via a
      // language picker, etc.
      languageCode: ['string', true],
      disableUsername: ['boolean', false, false],
      trapMfaRequiredResponse: ['boolean', false, false],
      lastFailedChallengeFactorData: ['object', false]
    },

    setAuthResponse: function (res) {
      // Because of MFA_CHALLENGE (i.e. DUO), we need to remember factors
      // across auth responses. Not doing this, for example, results in being
      // unable to switch away from the duo factor dropdown.
      if (res._embedded && res._embedded.policy) {
        this.set('policy', res._embedded.policy);
      }

      if (res._embedded && res._embedded.factors) {
        var factors = res._embedded.factors;
        if (res._embedded.factorTypes) {
          factors = combineFactorsObjects(res._embedded.factorTypes, factors);
        }

        var factorsObject = _.map(factors, (factor) => {
          factor.settings = this.settings;
          factor.appState = this;
          return factor;
        });
        this.set('factors', new Factor.Collection(factorsObject, { parse: true }));
      }

      this.set('lastAuthResponse', res);
    },

    clearLastAuthResponse: function () {
      this.set('lastAuthResponse', {});
    },

    setLastFailedChallengeFactorData: function () {
      this.set('lastFailedChallengeFactorData', {
        factor: this.get('factor'),
        errorMessage: this.get('factorResultErrorMessage'),
      });
    },

    clearLastFailedChallengeFactorData: function () {
      this.unset('lastFailedChallengeFactorData');
    },

    derived: {
      'isSuccessResponse': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.status === 'SUCCESS';
        }
      },
      'isMfaRequired': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.status === 'MFA_REQUIRED' || res.status === 'FACTOR_REQUIRED';
        }
      },
      'isProfileRequired': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.status === 'PROFILE_REQUIRED';
        }
      },
      'isMfaEnroll': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.status === 'MFA_ENROLL' || res.status === 'FACTOR_ENROLL';
        }
      },
      'isMfaChallenge': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.status === 'MFA_CHALLENGE' || res.status === 'FACTOR_CHALLENGE';
        }
      },
      'isUnauthenticated': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.status === 'UNAUTHENTICATED';
        }
      },
      'isMfaRejectedByUser': {
        // MFA failures are usually error responses
        // except in the case of Okta Push, when a
        // user clicks 'deny' on his phone.
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.factorResult === 'REJECTED';
        }
      },
      'isMfaTimeout': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.factorResult === 'TIMEOUT';
        }
      },
      'isMfaEnrollActivate': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.status === 'MFA_ENROLL_ACTIVATE' || res.status === 'FACTOR_ENROLL_ACTIVATE';
        }
      },
      'isWaitingForActivation': {
        deps: ['isMfaEnrollActivate', 'lastAuthResponse'],
        fn: function (isMfaEnrollActivate, res) {
          return isMfaEnrollActivate && res.factorResult === 'WAITING';
        }
      },
      'isWaitingForNumberChallenge': {
        deps: ['lastAuthResponse', 'isMfaChallenge'],
        fn: function (res, isMfaChallenge) {
          if (isMfaChallenge && res && res.factorResult === 'WAITING'
              && res._embedded
              && res._embedded.factor
              && res._embedded.factor._embedded
              && res._embedded.factor._embedded.challenge) {
            return true;
          }
          return false;
        }
      },
      'hasMultipleFactorsAvailable': {
        deps: ['factors', 'isMfaRequired', 'isMfaChallenge', 'isUnauthenticated'],
        fn: function (factors, isMfaRequired, isMfaChallenge, isUnauthenticated) {
          if (!isMfaRequired && !isMfaChallenge && !isUnauthenticated) {
            return false;
          }
          return factors && factors.length > 1;
        }
      },
      'promptForFactorInUnauthenticated': {
        deps: ['lastAuthResponse', 'factors'],
        fn: function (res, factors) {
          if (res.status !== 'UNAUTHENTICATED') {
            return false;
          }
          return factors && factors.length > 0;
        }
      },
      'userId': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          if (!res._embedded || !res._embedded.user) {
            return null;
          }
          return res._embedded.user.id;
        }
      },
      'isIdxStateToken': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res && _.isString(res.stateToken) && res.stateToken.startsWith('01');
        }
      },
      'isPwdExpiringSoon': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.status === 'PASSWORD_WARN';
        }
      },
      'passwordExpireDays': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          if (!res._embedded || !res._embedded.policy || !res._embedded.policy.expiration) {
            return null;
          }
          return res._embedded.policy.expiration.passwordExpireDays;
        }
      },
      'isPwdManagedByOkta': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          if (!res._links || !res._links.next || !res._links.next.title) {
            return true;
          }
          return false;
        }
      },
      'passwordExpiredWebsiteName': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          if (!res._links || !res._links.next || !res._links.next.title) {
            return null;
          }
          return res._links.next.title;
        }
      },
      'passwordExpiredLinkUrl': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          if (!res._links || !res._links.next || !res._links.next.title || !res._links.next.href) {
            return null;
          }
          return res._links.next.href;
        }
      },
      'recoveryType': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.recoveryType;
        }
      },
      'factorType': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.factorType;
        }
      },
      'factor': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          if (!res._embedded || !res._embedded.factor) {
            return null;
          }
          return res._embedded.factor;
        }
      },
      'activatedFactorId': {
        deps: ['factor'],
        fn: function (factor) {
          return factor ? factor.id : null;
        }
      },
      'activatedFactorType': {
        deps: ['factor'],
        fn: function (factor) {
          return factor ? factor.factorType : null;
        }
      },
      'activatedFactorProvider': {
        deps: ['factor'],
        fn: function (factor) {
          return factor ? factor.provider : null;
        }
      },
      'qrcode': {
        deps: ['factor'],
        fn: function (factor) {
          try {
            return factor._embedded.activation._links.qrcode.href;
          } catch (err) {
            return null;
          }
        }
      },
      'activationSendLinks': {
        deps: ['factor'],
        fn: function (factor) {
          var sendLinks;
          try {
            sendLinks = factor._embedded.activation._links.send;
          } catch (err) {
            sendLinks = [];
          }
          return sendLinks;
        }
      },
      'textActivationLinkUrl': {
        deps: ['activationSendLinks'],
        fn: function (activationSendLinks) {
          var item = _.findWhere(activationSendLinks, {name: 'sms'});
          return item ? item.href : null;
        }
      },
      'emailActivationLinkUrl': {
        deps: ['activationSendLinks'],
        fn: function (activationSendLinks) {
          var item = _.findWhere(activationSendLinks, {name: 'email'});
          return item ? item.href : null;
        }
      },
      'sharedSecret': {
        deps: ['factor'],
        fn: function (factor) {
          try {
            return factor._embedded.activation.sharedSecret;
          } catch (err) {
            return null;
          }
        }
      },
      'duoEnrollActivation': {
        deps: ['factor'],
        fn: function (factor) {
          if (!factor || !factor._embedded || !factor._embedded.activation) {
            return null;
          }
          return factor._embedded.activation;
        }
      },
      'prevLink': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          if (res._links && res._links.prev) {
            return res._links.prev.href;
          }
          return null;
        }
      },
      'skipLink': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          if (res._links && res._links.skip) {
            return res._links.skip.href;
          }
          return null;
        }
      },
      'gracePeriodRemainingDays': {
        deps: ['policy'],
        fn: function (policy) {
          if (policy && policy.gracePeriod && policy.gracePeriod.endDate) {
            return getGracePeriodRemainingDays(policy.gracePeriod.endDate);
          }
          return null;
        }
      },
      'user': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          if (!res._embedded || !res._embedded.user) {
            return null;
          }
          return res._embedded.user;
        }
      },
      'recoveryQuestion': {
        deps: ['user'],
        fn: function (user) {
          if (!user || !user.recovery_question) {
            return null;
          }
          return user.recovery_question.question;
        }
      },
      'userProfile': {
        deps: ['user'],
        fn: function (user) {
          if (!user || !user.profile) {
            return null;
          }
          return user.profile;
        }
      },
      'userConsentName': {
        deps: ['userProfile', 'username'],
        fn: function (userProfile, username) {
          if (!userProfile || _.isEmpty(userProfile.firstName)) {
            return username;
          }
          if (_.isEmpty(userProfile.lastName)) {
            return userProfile.firstName;
          }
          return userProfile.firstName + ' ' + userProfile.lastName.charAt(0) + '.';
        }
      },
      'userEmail': {
        deps: ['userProfile'],
        fn: function (userProfile) {
          if (!userProfile || !userProfile.login) {
            return null;
          }
          return userProfile.login;
        }
      },
      'userFullName': {
        deps: ['userProfile'],
        fn: function (userProfile) {
          if (!userProfile || (!userProfile.firstName && !userProfile.lastName)) {
            return '';
          }
          return userProfile.firstName + ' ' + userProfile.lastName;
        }
      },
      'defaultAppLogo' : {
        deps: ['baseUrl'],
        fn: function (baseUrl) {
          return baseUrl + DEFAULT_APP_LOGO;
        }
      },
      'expiresAt': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.expiresAt;
        }
      },
      'target': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          if (!res._embedded) {
            return null;
          }
          return res._embedded.target;
        }
      },
      'targetLabel': {
        deps: ['target'],
        fn: function (target) {
          if (!target) {
            return null;
          }
          return target.label;
        }
      },
      'targetLogo': {
        deps: ['target'],
        fn: function (target) {
          if (!target || !target._links) {
            return null;
          }
          return target._links.logo;
        }
      },
      'targetTermsOfService': {
        deps: ['target'],
        fn: function (target) {
          if (!target || !target._links) {
            return null;
          }
          return target._links['terms-of-service'];
        }
      },
      'targetPrivacyPolicy': {
        deps: ['target'],
        fn: function (target) {
          if (!target || !target._links) {
            return null;
          }
          return target._links['privacy-policy'];
        }
      },
      'targetClientURI': {
        deps: ['target'],
        fn: function (target) {
          if (!target || !target._links) {
            return null;
          }
          return target._links['client-uri'];
        }
      },
      'scopes': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          if (!res._embedded) {
            return null;
          }
          return res._embedded.scopes;
        }
      },
      'hasExistingPhones': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          if (!res._embedded || !res._embedded.factors) {
            return false;
          }
          var factors = res._embedded.factors;
          var factor = _.findWhere(factors, {factorType: 'sms', provider: 'OKTA'});
          if (!factor || !factor._embedded) {
            return false;
          }

          return !!factor._embedded.phones.length;
        }
      },
      'hasExistingPhonesForCall': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          if (!res._embedded || !res._embedded.factors) {
            return false;
          }
          var factors = res._embedded.factors;
          var factor = _.findWhere(factors, {factorType: 'call', provider: 'OKTA'});
          if (!factor || !factor._embedded) {
            return false;
          }

          return !!factor._embedded.phones.length;
        }
      },
      'isUndefinedUser': {
        deps: ['securityImage'],
        fn: function (securityImage) {
          return (securityImage === UNDEFINED_USER);
        }
      },
      'isNewUser': {
        deps: ['securityImage'],
        fn: function (securityImage) {
          return (securityImage === NEW_USER);
        }
      },
      'allowRememberDevice': {
        deps: ['policy'],
        fn: function (policy) {
          return policy && policy.allowRememberDevice;
        }
      },
      'rememberDeviceLabel': {
        deps: ['policy'],
        fn: function (policy) {
          if (policy && policy.rememberDeviceLifetimeInMinutes > 0) {
            var timeString = getMinutesString(policy.rememberDeviceLifetimeInMinutes);
            return Okta.loc('rememberDevice.timebased', 'login', [timeString]);
          } else if (policy && policy.rememberDeviceLifetimeInMinutes === 0) {
            return Okta.loc('rememberDevice.devicebased', 'login');
          }
          return Okta.loc('rememberDevice', 'login');
        }
      },
      'rememberDeviceByDefault': {
        deps: ['policy'],
        fn: function (policy) {
          return policy && policy.rememberDeviceByDefault;
        }
      },
      'factorsPolicyInfo' : {
        deps: ['policy'],
        fn: function (policy) {
          return (policy && policy.factorsPolicyInfo) ? policy.factorsPolicyInfo: null;
        }
      },
      'verifyCustomFactorRedirectUrl': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          if (!res._links || !res._links.next || res._links.next.name !== 'redirect' || !res._links.next.href) {
            return null;
          }
          return res._links.next.href;
        }
      },
      'enrollCustomFactorRedirectUrl': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          if (!res._links || !res._links.next || res._links.next.name !== 'activate' || !res._links.next.href) {
            return null;
          }
          return res._links.next.href;
        }
      },
      'isFactorResultFailed': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.factorResult === 'FAILED';
        }
      },
      'factorResultErrorMessage': {
        deps: ['lastAuthResponse', 'isFactorResultFailed'],
        fn: function (res, isFactorResultFailed) {
          if (isFactorResultFailed) {
            return res.factorResultMessage || Okta.loc('oform.error.unexpected', 'login');
          }
          return null;
        }
      },
    },

    parse: function (options) {
      this.settings = options.settings;
      return _.extend(
        _.omit(options, 'settings'),
        { languageCode: this.settings.get('languageCode' )}
      );
    }

  });

});
