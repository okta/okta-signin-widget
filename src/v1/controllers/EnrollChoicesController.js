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
import hbs from '@okta/handlebars-inline-precompile';
import FactorList from 'v1/views/enroll-choices/FactorList';
import Footer from 'v1/views/enroll-choices/Footer';
import RequiredFactorList from 'v1/views/enroll-choices/RequiredFactorList';
import Enums from 'util/Enums';
import FormController from 'v1/util/FormController';
import RouterUtil from 'v1/util/RouterUtil';
const subtitleTpl = hbs('<span>{{{subtitle}}}</span>');
export default FormController.extend({
  className: 'enroll-choices',
  state: {
    pageType: null,
  },

  Model: {},

  Form: {
    noCancelButton: true,

    title: _.partial(loc, 'enroll.choices.title', 'login'),

    noButtonBar: function() {
      return this.state.get('pageType') === Enums.ALL_OPTIONAL_NONE_ENROLLED;
    },

    subtitle: ' ',

    getSubtitle: function() {
      switch (this.state.get('pageType')) {
      case Enums.ALL_OPTIONAL_SOME_ENROLLED:
      case Enums.HAS_REQUIRED_ALL_REQUIRED_ENROLLED:
        return loc('enroll.choices.optional', 'login');
      case Enums.HAS_REQUIRED_SOME_REQUIRED_ENROLLED: {
        const remainingDays = this.options.appState.get('gracePeriodRemainingDays');

        // remainingDays is null if there is no grace period, 0 if we are still in grace period
        return (remainingDays !== null && remainingDays >= 0)
          ? this.getGracePeriodSubtitle(remainingDays)
          : this.getDefaultSubtitle();
      }
      default:
        return this.getDefaultSubtitle();
      }
    },

    getDefaultSubtitle: function() {
      return this.settings.get('brandName')
        ? loc('enroll.choices.description.specific', 'login', [this.settings.get('brandName')])
        : loc('enroll.choices.description.generic', 'login');
    },

    getGracePeriodSubtitle: function(remainingDays) {
      return remainingDays >= 1
        ? loc('enroll.choices.description.gracePeriod.bold', 'login', [remainingDays])
        : loc('enroll.choices.description.gracePeriod.oneDay.bold', 'login');
    },

    save: function() {
      switch (this.state.get('pageType')) {
      case Enums.ALL_OPTIONAL_SOME_ENROLLED:
      case Enums.HAS_REQUIRED_ALL_REQUIRED_ENROLLED:
        return loc('enroll.choices.submit.finish', 'login');
      case Enums.HAS_REQUIRED_NONE_ENROLLED:
        return loc('enroll.choices.submit.configure', 'login');
      case Enums.HAS_REQUIRED_SOME_REQUIRED_ENROLLED:
        return loc('enroll.choices.submit.next', 'login');
      default:
        return '';
      }
    },

    initialize: function(options) {
      this.listenTo(this, 'save', function() {
        let current;

        switch (this.state.get('pageType')) {
        case Enums.HAS_REQUIRED_NONE_ENROLLED:
        case Enums.HAS_REQUIRED_SOME_REQUIRED_ENROLLED:
          current = options.appState.get('factors').getFirstUnenrolledRequiredFactor();
          options.appState.trigger(
            'navigate',
            RouterUtil.createEnrollFactorUrl(current.get('provider'), current.get('factorType'))
          );
          break;
        default:
          return this.model.doTransaction(function(transaction) {
            return transaction.skip();
          });
        }
      });
    },

    preRender: function() {
      // form subtitle does not support unescaped strings, and we need some html elements
      // in the subtitle for this form. So instead of a regular subtitle, we add a <span>
      // with the text we need
      this.add(subtitleTpl({ subtitle: this.getSubtitle() }), 'p.okta-form-subtitle');

      const factors = this.options.appState.get('factors');

      switch (this.state.get('pageType')) {
      case Enums.HAS_REQUIRED_NONE_ENROLLED:
      case Enums.HAS_REQUIRED_SOME_REQUIRED_ENROLLED:
        this.add(
          new RequiredFactorList({
            minimize: true,
            collection: new Collection(factors.where({ required: true })),
            appState: this.options.appState,
          })
        );
        break;
      case Enums.HAS_REQUIRED_ALL_REQUIRED_ENROLLED:
      case Enums.ALL_OPTIONAL_SOME_ENROLLED:
      case Enums.ALL_OPTIONAL_NONE_ENROLLED: {
        const enrolled = factors.where({ enrolled: true });
        const notEnrolled = factors.filter(function(factor) {
          // pick factors that are not enrolled or have additional enrollments
          return !factor.get('enrolled') || factor.get('additionalEnrollment');
        });
        let notEnrolledListTitle;

        if (enrolled.length > 0) {
          notEnrolledListTitle = loc('enroll.choices.list.optional', 'login');
          this.add(
            new FactorList({
              listTitle: loc('enroll.choices.list.enrolled', 'login'),
              minimize: true,
              collection: new Collection(enrolled),
              appState: this.options.appState,
            })
          );
        }
        this.add(
          new FactorList({
            listTitle: notEnrolledListTitle,
            collection: new Collection(notEnrolled),
            appState: this.options.appState,
            showInlineSetupButton: true,
          })
        );
        break;
      }
      }
    },
  },

  initialize: function(options) {
    let numRequiredEnrolled = 0;
    let numRequiredNotEnrolled = 0;
    let numOptionalEnrolled = 0;
    let numOptionalNotEnrolled = 0;
    let hasRequired;
    let pageType;

    options.appState.get('factors').each(function(factor) {
      const required = factor.get('required');
      const enrolled = factor.get('enrolled');
      const additionalEnrollment = factor.get('additionalEnrollment');

      if (required && enrolled) {
        numRequiredEnrolled++;
      } else if (required && !enrolled) {
        numRequiredNotEnrolled++;
      } else if (!required && enrolled) {
        numOptionalEnrolled++;
      } else if (!required && !enrolled) {
        numOptionalNotEnrolled++;
      }
      // If a factor has multiple instances and
      // additional optional enrollments
      if (enrolled && additionalEnrollment) {
        numOptionalNotEnrolled++;
      }
    });

    hasRequired = numRequiredEnrolled > 0 || numRequiredNotEnrolled > 0;

    // There are 5 possible states this screen can be in:

    // 1. Has required, but none have been enrolled. Wizard start page.
    if (hasRequired && numRequiredEnrolled === 0) {
      pageType = Enums.HAS_REQUIRED_NONE_ENROLLED;
    } else if (hasRequired && numRequiredNotEnrolled > 0) {
      // 2. Has required, and have enrolled at least one. The page layout
      //    to configure the remaining required factors.
      pageType = Enums.HAS_REQUIRED_SOME_REQUIRED_ENROLLED;
    } else if (hasRequired && numOptionalNotEnrolled > 0) {
      // 3. Has required, and finished enrolling all required factors. The
      //    page layout you see to configure any optional factors or skip.
      pageType = Enums.HAS_REQUIRED_ALL_REQUIRED_ENROLLED;
    } else if (numOptionalEnrolled === 0 && numOptionalNotEnrolled > 0) {
      // 4. Factors are all optional, no factors enrolled.
      pageType = Enums.ALL_OPTIONAL_NONE_ENROLLED;
    } else if (numOptionalNotEnrolled > 0) {
      // 5. Factors are all optional, some factors have already been
      //    enrolled (can either enroll more or skip).
      pageType = Enums.ALL_OPTIONAL_SOME_ENROLLED;
    } else {
      // 6. Factors are all optional, all factors have already been
      //    enrolled, among them there is OktaVerify with Push enrolled as totp
      //    (API return OktaVerify push factor as unenrolled in this case and as we always merge
      //    push and totp in UI so we redirect to skip link here).
      this.model.doTransaction(function(transaction) {
        return transaction.skip();
      });
    }

    this.state.set('pageType', pageType);

    if (this.options.appState.get('skipLink') && pageType === Enums.HAS_REQUIRED_SOME_REQUIRED_ENROLLED) {
      this.add(new Footer(this.toJSON()));
    }
  },
});
