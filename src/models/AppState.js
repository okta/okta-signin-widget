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

/*jshint newcap:false, camelcase:false */
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

  var securityImageUrlTpl = compile('{{baseUrl}}/login/getimage?username={{username}}');

  function getSecurityImage(baseUrl, username) {
    var url = securityImageUrlTpl({ baseUrl: baseUrl, username: username });

    // When the username is empty, we want to show the default image.
    if (_.isEmpty(username) || _.isUndefined(username)) {
      return Q(UNDEFINED_USER);
    }

    return Q($.get(url)).then(function (res) {
      if (res.pwdImg === USER_NOT_SEEN_ON_DEVICE) {
        // When we get an unknown.png security image from OKTA,
        // we want to show the unknown-device security image.
        // We are mapping the server's img url to a new one because
        // we still need to support the original login page.
        return NEW_USER;
      }
      return res.pwdImg;
    });
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
            model.set('securityImage', image);
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
      securityImage: ['string', true, UNDEFINED_USER],
      userCountryCode: 'string',
      userPhoneNumber: 'string',
      factorActivationType: 'string',
      flashError: 'object'
    },

    setAuthResponse: function (res) {
      // Because of MFA_CHALLENGE (i.e. DUO), we need to remember factors
      // across auth responses. Not doing this, for example, results in being
      // unable to switch away from the duo factor dropdown.
      var self = this;
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
            return null;
          }
          var factors = res._embedded.factors;
          var factor = _.findWhere(factors, {factorType: 'sms', provider: 'OKTA'});
          if (!factor || !factor._embedded) {
            return null;
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
      }
    },

    parse: function (options) {
      this.settings = options.settings;
      return _.omit(options, 'settings');
    }

  });

});
