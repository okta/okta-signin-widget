/*!
 * Copyright (c) 2026, Okta, Inc. and/or its affiliates. All rights reserved.
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
import hbs from '@okta/handlebars-inline-precompile';
import TimeUtil from 'util/TimeUtil';
import AuthenticatorEnrollOptions from './AuthenticatorEnrollOptions';

/**
 * N-of-M authenticator group card. Renders a bordered container that wraps a
 * group's unenrolled members with:
 *   - an optional group-level grace-period block at the top (BY_DATE_TIME or
 *     BY_SKIP_COUNT — same visual formats as per-authenticator grace period)
 *   - a "Choose {remaining} of:" label chip
 *   - the member rows themselves, rendered by the existing AuthenticatorEnrollOptions
 *     ListView (with its section title suppressed) so per-row DOM matches today's
 *     bare-authenticator rendering exactly
 *
 * `data-se="authenticator-enroll-group-{index}"` on the card wrapper — positional
 * index, never leaks the opaque `groupId` per the contract.
 */
export default View.extend({

  className: 'authenticator-enroll-group-card',

  template: hbs`
    {{#if gracePeriodRequiredDescription}}
      <div class="authenticator-grace-period-container">
        <span class="authenticator-grace-period-required-icon"></span>
        <div class="authenticator-grace-period-text-container">
          <p class="authenticator-grace-period-required-description">
            {{gracePeriodRequiredDescription}}
          </p>
          {{#if gracePeriodExpiry}}
            <p class="authenticator-grace-period-expiry-date" translate="no">{{gracePeriodExpiry}}</p>
          {{/if}}
        </div>
      </div>
    {{else if gracePeriodRemainingSkipsDescription}}
      <div class="authenticator-grace-period-container">
        <span class="authenticator-grace-period-required-icon"></span>
        <div class="authenticator-grace-period-text-container">
          <p class="authenticator-grace-period-skip-count-description">{{gracePeriodRemainingSkipsDescription}}</p>
        </div>
      </div>
    {{/if}}
    <span
      class="authenticator-enroll-group-card__label"
      id="{{labelId}}"
      data-se="authenticator-enroll-group-card-label"
    >
      {{chooseLabel}}
    </span>
    <div class="authenticator-enroll-group-card__members"></div>
  `,

  attributes: function() {
    return {
      'data-se': `authenticator-enroll-group-${this.options.groupIndex}`,
      // role=group + aria-labelledby lets AT users hear the "Choose N of" chip
      // as the region name — critical when the same authenticator (e.g. Okta
      // Verify in two overlapping groups) renders once per card and the button
      // labels alone are identical across cards.
      'role': 'group',
      'aria-labelledby': `authenticator-enroll-group-${this.options.groupIndex}-label`,
    };
  },

  initialize: function() {
    // Members inside a card should not render per-authenticator grace period —
    // the group's grace period at the top of the card is authoritative for the
    // whole set. Clone each member to clear its gracePeriod without mutating
    // the shared optionItems array.
    const members = this.options.members.map(member => ({
      ...member,
      relatesTo: { ...member.relatesTo, gracePeriod: null },
    }));

    this.add(new AuthenticatorEnrollOptions({
      ...this.options,
      collection: new Collection(members),
      optionItems: members,
      showTitle: false,
    }), '.authenticator-enroll-group-card__members');
  },

  getTemplateData() {
    const { group, groupIndex } = this.options;
    const chooseLabel = loc('oie.enrollment.group.choose.n.of', 'login', [group.remaining]);
    const gracePeriodData = this._getGroupGracePeriodData(group.gracePeriod);
    return {
      chooseLabel,
      labelId: `authenticator-enroll-group-${groupIndex}-label`,
      ...gracePeriodData,
    };
  },

  // Same shape / same locale keys as the per-authenticator grace period in
  // AuthenticatorEnrollOptions#_getGracePeriodData — the design intentionally
  // reuses the visual format, so the strings are shared too.
  _getGroupGracePeriodData(gracePeriod) {
    if (!gracePeriod) {
      return {};
    }
    const byDateTimeData = this._byDateTimeGracePeriodData(gracePeriod);
    if (byDateTimeData) {
      return byDateTimeData;
    }
    return this._bySkipCountGracePeriodData(gracePeriod);
  },

  // Returns { gracePeriodRequiredDescription, gracePeriodExpiry } iff the
  // grace period's expiry is present and still in the future; otherwise null
  // (caller falls through to BY_SKIP_COUNT).
  _byDateTimeGracePeriodData(gracePeriod) {
    if (gracePeriod.type !== 'BY_DATE_TIME' && !gracePeriod.expiry) {
      return null;
    }
    const currentTimestampMs = Date.now();
    const gracePeriodEpochTimestampMs = new Date(gracePeriod.expiry).getTime();
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(gracePeriodEpochTimestampMs) || currentTimestampMs >= gracePeriodEpochTimestampMs) {
      return null;
    }
    const remainingDays = TimeUtil.calculateDaysBetween(currentTimestampMs, gracePeriodEpochTimestampMs);
    const gracePeriodExpiry = TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(
      new Date(gracePeriodEpochTimestampMs),
      this.options.settings?.get('languageTags'),
      false,
    );
    return {
      gracePeriodRequiredDescription: this._requiredDescription(remainingDays),
      gracePeriodExpiry,
    };
  },

  _requiredDescription(remainingDays) {
    if (remainingDays === 1) {
      return loc('oie.enrollment.policy.grace.period.required.in.one.day', 'login');
    }
    if (remainingDays > 1) {
      return loc('oie.enrollment.policy.grace.period.required.in.days', 'login', [remainingDays]);
    }
    return loc('oie.enrollment.policy.grace.period.required.today', 'login');
  },

  _bySkipCountGracePeriodData(gracePeriod) {
    if (!(gracePeriod.remainingSkips > 0)) {
      return {};
    }
    if (gracePeriod.remainingSkips === 1) {
      return {
        gracePeriodRemainingSkipsDescription:
          loc('oie.enrollment.policy.grace.period.required.in.one.skip', 'login'),
      };
    }
    return {
      gracePeriodRemainingSkipsDescription: loc(
        'oie.enrollment.policy.grace.period.required.in.number.of.skips',
        'login',
        [gracePeriod.remainingSkips],
      ),
    };
  },
});
