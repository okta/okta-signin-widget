/*!
 * Copyright (c) 2017, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
/* eslint max-len: [2, 131] */
import hbs from '@okta/handlebars-inline-precompile';
import { _, View, loc } from '@okta/courage';
import ScopeItem from './ScopeItem';

const SCOPE_N_GROUP_CONFIG = {
  groups: 'user',
  myAccount: 'user',
  users: 'user',
  apps: 'resource',
  authenticators: 'resource',
  authorizationServers: 'resource',
  clients: 'resource',
  domains: 'resource',
  factors: 'resource',
  idps: 'resource',
  linkedObjects: 'resource',
  policies: 'resource',
  templates: 'resource',
  eventHooks: 'hook',
  inlineHooks: 'hook',
  events: 'system',
  logs: 'system',
  orgs: 'system',
  roles: 'system',
  schemas: 'system',
  sessions: 'system',
  trustedOrigins: 'system',
};

const DEFAULT_GROUP = 'system';

const findScopeGroupKey = ({ name = '' }) => {
  const xs = name.split('.');
  const groupType = xs[1];

  return SCOPE_N_GROUP_CONFIG[groupType] || DEFAULT_GROUP;
};

const ScopeGroupHeaderView = View.extend({
  className: 'scope-group',

  events: {
    'click': 'expandScopes',
  },

  template: hbs`
    <div class="scope-group--header">
    <h3>{{groupName}}</h3>
    <span class="scope-group--toggle">
      <svg class="caret"
           width="12" height="12"
           viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path class="path" fill-rule="evenodd"
              clip-rule="evenodd"
              d="M5.99967 4.66663L10.2663 8.66663L11.333 7.66663L5.99967 2.66663L0.666342 7.73636L1.73301 8.66663L5.99967 4.66663Z"
              fill="#A0A7AC">
        </path>
      </svg>
    </span>
    </div>`,

  expandScopes() {
    this.$el.toggleClass('scope-group--is-expanded');
    this.$('.caret').toggleClass('caret--is-rotated');
  },

  preRender() {
    _.chain(this.options.scopes)
      .sortBy(({ name }) => name)
      .each(({ name, displayName, description }) => {
        this.add(ScopeItem, {
          options: {
            name: displayName || name,
            description,
          },
        });
      });
  }
});

export default View.extend({
  className: 'scope-list detail-row',

  postRender: function() {
    const allScopes = this.model.get('scopes');
    const scopesWithGroup = _.groupBy(allScopes, findScopeGroupKey);

    const SCOPE_GROUP_NAMES_CONFIG = {
      'user': loc('admin.consent.group.user.group', 'login'),
      'resource': loc('admin.consent.group.resource.policy', 'login'),
      'hook': loc('admin.consent.group.hook', 'login'),
      'system': loc('admin.consent.group.system', 'login'),
    };

    // loop through SCOPE_GROUP_NAMES_CONFIG to keep group order consistent in UI.
    _.each(SCOPE_GROUP_NAMES_CONFIG, (groupName, groupKey) => {
      const scopes = scopesWithGroup[groupKey];
      if (!Array.isArray(scopes)) {
        return;
      }
      // add scope group header and scopes
      this.add(ScopeGroupHeaderView, {
        options: {
          groupName,
          scopes,
        }
      });
    });
  },
});
