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
import hbs from '@okta/handlebars-inline-precompile';
import { FORMS as RemediationForms } from '../../ion/RemediationConstants';
import AuthenticatorEnrollOptions from './AuthenticatorEnrollOptions';
import AuthenticatorEnrollGroupCard from './AuthenticatorEnrollGroupCard';
import remindMeLater from './RemindMeLaterButton';
import skipAll from './SkipOptionalEnrollmentButton';
import { getGracePeriodRequiredSoonCustomLink } from '../utils/LinksUtil';

// Title-only wrapper for sections that contain nothing but group cards. Emits
// the same .authenticator-list-title / .authenticator-list-subtitle DOM as
// AuthenticatorEnrollOptions#getTemplateData produces, so existing selectors
// (e.g. .authenticator-list .authenticator-list-title in the page objects)
// keep working — but skips the empty ListView shell around zero rows.
// Carries `authenticator-list` on the root so shared page-object selectors like
// `.authenticator-list .authenticator-list-title` still resolve when a section
// has no bare rows (only cards).
const AuthenticatorEnrollSectionHeader = View.extend({
  className: 'authenticator-list authenticator-list-header',
  template: hbs`
    <div class="authenticator-list-title">{{title}}</div>
    {{#if subtitle}}
      <p class="authenticator-list-subtitle">{{subtitle}}</p>
    {{/if}}
    {{#if subtitleLinkOptions}}
      <div class="authenticator-list-subtitle-link-container">
        <a href={{subtitleLinkOptions.href}} target="_blank" rel="noopener noreferrer">{{subtitleLinkOptions.label}}</a>
      </div>
    {{/if}}
  `,
  getTemplateData() {
    return {
      title: this.options.title,
      subtitle: this.options.subtitle || null,
      subtitleLinkOptions: this.options.subtitleLinkOptions || null,
    };
  },
});

const isGracePeriodExpiryStillActive = (expiry) => {
  const currentTimestampMs = Date.now();
  const gracePeriodTimestampMs = new Date(expiry).getTime();
  // using isNaN as ie11 does not support Number.isNaN
  // eslint-disable-next-line no-restricted-globals
  return !isNaN(gracePeriodTimestampMs) && currentTimestampMs < gracePeriodTimestampMs;
};

const hasActivePerAuthGracePeriod = (option) => {
  const gp = option?.relatesTo?.gracePeriod;
  if (!gp) {
    return false;
  }
  return (gp.expiry && isGracePeriodExpiryStillActive(gp.expiry))
    || (gp.remainingSkips > 0);
};

const hasActiveGroupGracePeriod = (group) => {
  const gp = group?.gracePeriod;
  if (!gp) {
    return false;
  }
  return (gp.expiry && isGracePeriodExpiryStillActive(gp.expiry))
    || (gp.remainingSkips > 0);
};

export default View.extend({

  className: 'authenticator-enroll-list-container',

  initialize: function() {
    const groups = this.options.appState.get('authenticatorGroups');
    const hasActiveGroup = Array.isArray(groups)
      && groups.some(g => g && g.remaining > 0);

    this.hasSkipRemediation = !!this.options.appState.hasRemediationObject(RemediationForms?.SKIP);
    // Neither flag applies to the N-of-M grouped path (sections are decided by
    // per-group gracePeriod, not by the presence of a skip remediation), but
    // initialize them so the container's public shape stays stable regardless
    // of which branch we take.
    this.hasOnlyOptional = false;
    this.hasOnlyGracePeriod = false;

    if (hasActiveGroup) {
      this._initWithGroups(groups);
    } else {
      this._initLegacy();
    }
  },

  // Existing pre-N-of-M behavior. Kept verbatim so any response that does not
  // carry a top-level authenticatorGroups[] array (or has all groups satisfied)
  // renders byte-identically to today.
  _initLegacy: function() {
    const authenticatorsWithGracePeriod = [];
    const authenticators = [];

    this.options.optionItems.forEach((authenticator) => {
      if (hasActivePerAuthGracePeriod(authenticator)) {
        authenticatorsWithGracePeriod.push(authenticator);
      } else {
        authenticators.push(authenticator);
      }
    });

    this.hasOnlyOptional = this.hasSkipRemediation && authenticatorsWithGracePeriod?.length === 0;
    this.hasOnlyGracePeriod = this.hasSkipRemediation &&
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
        listSubtitle: loc('oie.setup.required.soon.description', 'login'),
        listSubtitleLinkOptions: getGracePeriodRequiredSoonCustomLink(this.options.settings),
      }));
    }

    if (this.hasOnlyGracePeriod) {
      this.add(remindMeLater);
    } else if (this.hasOnlyOptional) {
      this.add(skipAll);
    }
  },

  // Bucket a single active group into the appropriate section, mutating the
  // requiredNow/requiredSoon/emitted collections in place. Returns nothing.
  _bucketGroup: function(group, requiredNow, requiredSoon, emitted) {
    const members = this.options.optionItems.filter(opt =>
      Array.isArray(opt.groupIds) && opt.groupIds.includes(group.groupId)
    );
    if (members.length === 0) {
      return;
    }

    const groupHasGP = hasActiveGroupGracePeriod(group);
    const bucket = groupHasGP ? requiredSoon : requiredNow;

    if (members.length === 1) {
      // Group-of-1 → bare individual, no card wrapper. If the group has a GP,
      // inject it onto the option so the existing per-row grace-period markup
      // picks it up automatically (same visual as legacy per-authenticator GP).
      const [single] = members;
      const decorated = groupHasGP
        ? { ...single, relatesTo: { ...single.relatesTo, gracePeriod: group.gracePeriod } }
        : single;
      bucket.push({ kind: 'bare', option: decorated });
      emitted.push(single);
    } else {
      // Group-of-≥2 → card. Members are cloned inside the card to strip any
      // per-row grace period (group GP wins).
      bucket.push({ kind: 'card', group, members });
      members.forEach(m => emitted.push(m));
    }
  },

  // N-of-M path. Only fires when the response has at least one REQUIRED group
  // with remaining > 0. Preserves the DOM shape of individual authenticator rows.
  _initWithGroups: function(groups) {
    // Section buckets. Each entry is { kind: 'card', group, members } or
    // { kind: 'bare', option }.
    const requiredNow = [];
    const requiredSoon = [];
    // Track options that have already been placed into a section so the
    // ungrouped-remainder pass doesn't double-render them. Using an array +
    // .includes here rather than Set() to sidestep the shared eslint config
    // which does not enumerate Set among the browser globals.
    const emitted = [];

    groups.forEach(group => {
      if (group && group.remaining > 0) {
        this._bucketGroup(group, requiredNow, requiredSoon, emitted);
      }
    });

    // Ungrouped options and options whose only groups are already satisfied
    // (remaining == 0). Fall through to the legacy per-authenticator GP path.
    this.options.optionItems.forEach(opt => {
      if (emitted.includes(opt)) {
        return;
      }
      const bucket = hasActivePerAuthGracePeriod(opt) ? requiredSoon : requiredNow;
      bucket.push({ kind: 'bare', option: opt });
    });

    this._renderGroupedSection(requiredNow, {
      listTitle: loc('oie.setup.required.now', 'login'),
      cardIndexOffset: 0,
    });
    this._renderGroupedSection(requiredSoon, {
      listTitle: loc('oie.setup.required.soon', 'login'),
      listSubtitle: loc('oie.setup.required.soon.description', 'login'),
      listSubtitleLinkOptions: getGracePeriodRequiredSoonCustomLink(this.options.settings),
      // Continue positional index counting across sections so every card in the
      // response has a unique data-se, matching TestCafe's usage of positional
      // selectors.
      cardIndexOffset: requiredNow.filter(i => i.kind === 'card').length,
    });

    // Skip / RemindMeLater button. When the backend allows skipping, it emits a
    // `skip` remediation only if some active group has grace period budget left
    // (see contract). In that case we surface RemindMeLater (matches today's
    // legacy grace-period label). No SkipAll in the required-phase group path.
    if (this.hasSkipRemediation) {
      this.add(remindMeLater);
    }
  },

  _renderGroupedSection: function(items, sectionOptions) {
    if (items.length === 0) {
      return;
    }

    const bareRows = items.filter(i => i.kind === 'bare').map(i => i.option);
    const cards = items.filter(i => i.kind === 'card');

    if (bareRows.length > 0) {
      // At least one bare row → let the standard ListView render the section
      // title/subtitle plus the rows. Cards render as siblings after.
      this.add(new AuthenticatorEnrollOptions({
        ...this.options,
        collection: new Collection(bareRows),
        optionItems: bareRows,
        listTitle: sectionOptions.listTitle,
        listSubtitle: sectionOptions.listSubtitle,
        listSubtitleLinkOptions: sectionOptions.listSubtitleLinkOptions,
      }));
    } else {
      // Card-only section → emit just the title/subtitle DOM without wrapping
      // it in an empty AuthenticatorEnrollOptions ListView.
      this.add(new AuthenticatorEnrollSectionHeader({
        title: sectionOptions.listTitle,
        subtitle: sectionOptions.listSubtitle,
        subtitleLinkOptions: sectionOptions.listSubtitleLinkOptions,
      }));
    }

    cards.forEach((entry, i) => {
      this.add(new AuthenticatorEnrollGroupCard({
        ...this.options,
        group: entry.group,
        members: entry.members,
        groupIndex: (sectionOptions.cardIndexOffset || 0) + i,
      }));
    });
  },
});
