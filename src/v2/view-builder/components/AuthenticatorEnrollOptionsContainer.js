/*!
 * Copyright (c) 2020, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
import { loc, View, Collection } from '@okta/courage';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';
import AuthenticatorEnrollOptions from './AuthenticatorEnrollOptions';
import remindMeLater from './RemindMeLaterButton';
import skipAll from './SkipOptionalEnrollmentButton';

export default View.extend({

  className: 'authenticator-enroll-list-container',

  initialize: function() {
    const authenticatorsWithGracePeriod = [];
    const authenticators = [];

    this.options.optionItems.forEach((authenticator) => {
      if (authenticator.relatesTo?.gracePeriod?.expiry
        && parseInt(authenticator.relatesTo?.gracePeriod?.expiry) > (new Date(Date.now()).getTime() / 1000)) {
        authenticatorsWithGracePeriod.push(authenticator);
      } else {
        authenticators.push(authenticator);
      }
    });

    this.hasSkipRemediation = !!this.options.appState.hasRemediationObject(RemediationForms?.SKIP);
    this.hasOnlyOptional = this.hasSkipRemediation && authenticatorsWithGracePeriod?.length === 0;
    this.hasOnlyGracePeriod =  this.hasSkipRemediation &&
      this.options.optionItems?.length === authenticatorsWithGracePeriod?.length;

    if (authenticators.length) {
      this.add(new AuthenticatorEnrollOptions({
        ...this.options,
        collection: new Collection(authenticators),
        optionItems: authenticators,
        listTitle: this.hasOnlyOptional
          ? loc('oie.setup.optional.short', 'login') : loc('oie.setup.required.now', 'login'),
      }));
    }
    if (authenticatorsWithGracePeriod.length) {
      this.add(new AuthenticatorEnrollOptions({
        ...this.options,
        collection: new Collection(authenticatorsWithGracePeriod),
        optionItems: authenticatorsWithGracePeriod,
        listTitle: loc('oie.setup.required.soon', 'login'),
      }));
    }

    if (this.hasOnlyGracePeriod) {
      this.add(remindMeLater);
    } else if (this.hasOnlyOptional) {
      this.add(skipAll);
    }
  },
});
