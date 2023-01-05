/*!
 * Copyright (c) 2020-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { _, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import Enums from 'util/Enums';
export default View.extend({
  className: 'hide resend-email-infobox',
  template: hbs`
      <div class="infobox infobox-warning" aria-live="polite">
        <span class="icon warning-16"></span>
        <p>
          <span>{{i18n code="email.code.not.received" bundle="login"}}</span>
          <a href="#" class="resend-email-btn">
          {{i18n code="email.button.resend" bundle="login"}}
          </a>
        </p>
      </div>
    `,

  events: {
    'click .resend-email-btn': 'resendEmail',
  },

  postRender: function() {
    this.showResendCallout();
  },

  showResendCallout: function() {
    _.delay(() => {
      this.$el.removeClass('hide');
    }, Enums.API_RATE_LIMIT);
  },

  hideResendCallout: function() {
    this.$el.addClass('hide');
  },

  resendEmail: function(e) {
    e.preventDefault();
    this.hideResendCallout();
    this.model.resend().finally(this.showResendCallout.bind(this));
  },
});
