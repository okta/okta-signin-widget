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

/*jshint maxcomplexity:9*/
define([
  'okta',
  './util/FormController',
  './util/Enums',
  './util/RouterUtil',
  'shared/views/forms/components/Toolbar',
  'views/enroll-choices/FactorList',
  'views/enroll-choices/RequiredFactorList'
],
function (Okta, FormController, Enums, RouterUtil, Toolbar, FactorList,
          RequiredFactorList) {

  return FormController.extend({
    className: 'enroll-choices',
    state: {
      pageType: null
    },

    Model: {},

    Form: {
      noCancelButton: true,

      title: Okta.loc('enroll.choices.title', 'login'),

      noButtonBar: function () {
        return this.state.get('pageType') === Enums.ALL_OPTIONAL_NONE_ENROLLED;
      },

      subtitle: function () {
        switch (this.state.get('pageType')) {
        case Enums.ALL_OPTIONAL_SOME_ENROLLED:
        case Enums.HAS_REQUIRED_ALL_REQUIRED_ENROLLED:
          return Okta.loc('enroll.choices.optional', 'login');
        default:
          return Okta.loc('enroll.choices.description', 'login');
        }
      },

      save: function () {
        switch (this.state.get('pageType')) {
        case Enums.ALL_OPTIONAL_SOME_ENROLLED:
        case Enums.HAS_REQUIRED_ALL_REQUIRED_ENROLLED:
          return Okta.loc('enroll.choices.submit.finish', 'login');
        case Enums.HAS_REQUIRED_NONE_ENROLLED:
          return Okta.loc('enroll.choices.submit.configure', 'login');
        case Enums.HAS_REQUIRED_SOME_REQUIRED_ENROLLED:
          return Okta.loc('enroll.choices.submit.next', 'login');
        default:
          return '';
        }
      },

      initialize: function (options) {
        this.listenTo(this, 'save', function () {
          var current;
          switch (this.state.get('pageType')) {
          case Enums.HAS_REQUIRED_NONE_ENROLLED:
          case Enums.HAS_REQUIRED_SOME_REQUIRED_ENROLLED:
            current = options.appState.get('factors').getFirstUnenrolledRequiredFactor();
            options.appState.trigger('navigate', RouterUtil.createEnrollFactorUrl(
              current.get('provider'),
              current.get('factorType')
            ));
            break;
          default:
            return this.model.doTransaction(function(transaction) {
              return transaction.skip();
            });
          }
        });
      },

      preRender: function () {
        var factors = this.options.appState.get('factors');
        switch(this.state.get('pageType')) {
        case Enums.HAS_REQUIRED_NONE_ENROLLED:
        case Enums.HAS_REQUIRED_SOME_REQUIRED_ENROLLED:
          this.add(new RequiredFactorList({
            minimize: true,
            collection: new Okta.Collection(factors.where({ required: true })),
            appState: this.options.appState
          }));
          break;
        case Enums.HAS_REQUIRED_ALL_REQUIRED_ENROLLED:
        case Enums.ALL_OPTIONAL_SOME_ENROLLED:
        case Enums.ALL_OPTIONAL_NONE_ENROLLED:
          var enrolled = factors.where({ enrolled: true }),
              notEnrolled = factors.where({ enrolled: false }),
              notEnrolledListTitle;
          if (enrolled.length > 0) {
            notEnrolledListTitle = Okta.loc('enroll.choices.list.optional', 'login');
            this.add(new FactorList({
              listTitle: Okta.loc('enroll.choices.list.enrolled', 'login'),
              minimize: true,
              collection: new Okta.Collection(enrolled),
              appState: this.options.appState
            }));
          }
          this.add(new FactorList({
            listTitle: notEnrolledListTitle,
            collection: new Okta.Collection(notEnrolled),
            appState: this.options.appState
          }));
          break;
        }
      }

    },

    initialize: function (options) {
      var numRequiredEnrolled = 0,
          numRequiredNotEnrolled = 0,
          numOptionalEnrolled = 0,
          numOptionalNotEnrolled = 0,
          hasRequired,
          pageType;

      options.appState.get('factors').each(function (factor) {
        var required = factor.get('required'),
            enrolled = factor.get('enrolled');
        if (required && enrolled) {
          numRequiredEnrolled++;
        }
        else if (required && !enrolled) {
          numRequiredNotEnrolled++;
        }
        else if (!required && enrolled) {
          numOptionalEnrolled++;
        }
        else if (!required && !enrolled) {
          numOptionalNotEnrolled++;
        }
      });

      hasRequired = numRequiredEnrolled > 0 || numRequiredNotEnrolled > 0;

      // There are 5 possible states this screen can be in:

      // 1. Has required, but none have been enrolled. Wizard start page.
      if (hasRequired && numRequiredEnrolled === 0) {
        pageType = Enums.HAS_REQUIRED_NONE_ENROLLED;
      }

      // 2. Has required, and have enrolled at least one. The page layout
      //    to configure the remaining required factors.
      else if (hasRequired && numRequiredNotEnrolled > 0) {
        pageType = Enums.HAS_REQUIRED_SOME_REQUIRED_ENROLLED;
      }

      // 3. Has required, and finished enrolling all required factors. The
      //    page layout you see to configure any optional factors or skip.
      else if (hasRequired && numOptionalNotEnrolled > 0) {
        pageType = Enums.HAS_REQUIRED_ALL_REQUIRED_ENROLLED;
      }

      // 4. Factors are all optional, no factors enrolled.
      else if (numOptionalEnrolled === 0 && numOptionalNotEnrolled > 0) {
        pageType = Enums.ALL_OPTIONAL_NONE_ENROLLED;
      }

      // 5. Factors are all optional, some factors have already been
      //    enrolled (can either enroll more or skip).
      else if (numOptionalNotEnrolled > 0) {
        pageType = Enums.ALL_OPTIONAL_SOME_ENROLLED;
      }

      // 6. Factors are all optional, all factors have already been
      //    enrolled, among them there is OktaVerify with Push enrolled as totp
      //    (API return OktaVerify push factor as unenrolled in this case and as we always merge
      //    push and totp in UI so we redirect to skip link here).
      else {
        this.model.doTransaction(function(transaction) {
          return transaction.skip();
        });
      }

      this.state.set('pageType', pageType);
    }
  });

});
