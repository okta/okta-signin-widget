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
  var compile = Okta.Handlebars.compile;

  var USER_NOT_SEEN_ON_DEVICE = '/img/security/unknown.png';
  var UNDEFINED_USER = '/img/security/default.png';
  var NEW_USER = '/img/security/unknown-device.png';
  var NEW_USER_IMAGE_DESCRIPTION = '';
  var UNDEFINED_USER_IMAGE_DESCRIPTION = '';
  var UNKNOWN_IMAGE_DESCRIPTION = '';

  var securityImageUrlTpl = compile('{{baseUrl}}/login/getimage?username={{username}}');

  function getSecurityImage(baseUrl, username) {
    var url = securityImageUrlTpl({ baseUrl: baseUrl, username: username });

    // When the username is empty, we want to show the default image.
    if (_.isEmpty(username) || _.isUndefined(username)) {
      return Q({
        'securityImage': UNDEFINED_USER,
        'securityImageDescription': UNDEFINED_USER_IMAGE_DESCRIPTION
      });
    }

    return Q($.get(url)).then(function (res) {
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

  function getMinutesString(factorLifetimeInMinutes) {
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

  return Okta.Model.extend({

    initialize: function () {
      // Handle this in initialize (as opposed to a derived property) because
      // the operation is asynchronous
      if (this.settings.get('features.securityImage')) {
        var self = this;
        this.listenTo(this, 'change:username', function (model, username) {
          getSecurityImage(this.get('baseUrl'), username)
          .then(function (image) {
            model.set('securityImage', image.securityImage);
            model.set(
              'securityImageDescription', image.securityImageDescription);
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

      // Note: languageCode is special in that it is shared between Settings
      // and AppState. Settings is the *configured* language, and is static.
      // AppState is the dynamic language state - it can be changed via a
      // language picker, etc.
      languageCode: ['string', true]
    },

    setAuthResponse: function (res) {
      // Because of MFA_CHALLENGE (i.e. DUO), we need to remember factors
      // across auth responses. Not doing this, for example, results in being
      // unable to switch away from the duo factor dropdown.
      var self = this;
      if (res._embedded && res._embedded.policy) {
        this.set('policy', res._embedded.policy);
      }
      if (res._embedded && res._embedded.factors) {
        var settings = this.settings;
        var factors = _.map(res._embedded.factors, function (factor) {
          factor.settings = settings;
          factor.appState = self;
          return factor;
        });
        this.set('factors', new Factor.Collection(factors, { parse: true }));
      }
      this.set('lastAuthResponse', res);
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
          return res.status === 'MFA_REQUIRED';
        }
      },
      'isMfaEnroll': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.status === 'MFA_ENROLL';
        }
      },
      'isMfaChallenge': {
        deps: ['lastAuthResponse'],
        fn: function (res) {
          return res.status === 'MFA_CHALLENGE';
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
          return res.status === 'MFA_ENROLL_ACTIVATE';
        }
      },
      'isWaitingForActivation': {
        deps: ['isMfaEnrollActivate', 'lastAuthResponse'],
        fn: function (isMfaEnrollActivate, res) {
          return isMfaEnrollActivate && res.factorResult === 'WAITING';
        }
      },
      'hasMfaRequiredOptions': {
        deps: ['lastAuthResponse', 'factors'],
        fn: function (res, factors) {
          if (res.status !== 'MFA_REQUIRED' && res.status !== 'MFA_CHALLENGE') {
            return false;
          }
          return factors && factors.length > 1;
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
      }
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
