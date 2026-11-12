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
import { ListView, View, createButton, loc } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

const AuthenticatorRow = View.extend({
  className: 'authenticator-row clearfix',
  template: hbs`
    <div class="authenticator-icon-container">
      {{#if logoUri}}
        <div class="factor-icon authenticator-icon {{iconClassName}} custom-logo" role="img" 
          aria-label="{{i18n code="oie.auth.logo.aria.label" bundle="login"}}"></div>
      {{else}}
        <div class="factor-icon authenticator-icon {{iconClassName}}" role="img" 
          aria-label="{{i18n code="oie.auth.logo.aria.label" bundle="login"}}"></div>
      {{/if}}
    </div>
    <div class="authenticator-description">
      <div>
        <h3 class="authenticator-label no-translate {{#if description}}authenticator-label--small{{/if}}">{{label}}</h3>
        {{#if description}}
          <p class="authenticator-description--text {{noTranslateClassName}}">{{description}}</p>
        {{/if}}
        {{#if nickname}}
          <p class="authenticator-enrollment-nickname {{noTranslateClassName}}">{{nickname}}</p>
        {{/if}}
      </div>
      <div class="authenticator-button" {{#if buttonDataSeAttr}}data-se="{{buttonDataSeAttr}}"{{/if}}></div>
    </div>
  `,
  postRender: function() {
    View.prototype.postRender.apply(this, arguments);
    const logoUri = this.model.get('logoUri');
    if (logoUri) {
      this.el.querySelector('.custom-logo').style.backgroundImage = `url(${logoUri})`;
    }
  },
  children: function(){
    return [[createButton({
      className: 'button select-factor',
      title: function() {
        return loc('oie.verify.authenticator.button.text', 'login');
      },
      attributes: {
        'aria-label': this.model.get('ariaLabel'),
      },
      click: function() {
        this.model.trigger('selectAuthenticator', this.model.get('value'));
      }
    }), '.authenticator-button']];
  },
  minimize: function() {
    this.$el.addClass('authenticator-row-min');
  }
});

const AuthenticatorVerifyList = ListView.extend({

  className: 'authenticator-verify-list authenticator-list',

  item: AuthenticatorRow,

  itemSelector: '.list-content',

  initialize: function() {
    this.listenTo(this.collection,'selectAuthenticator', this.handleSelect);
    this.listenTo(this.model, 'invalid', this.handleModelInvalid);
  },

  postRender: function() {
    ListView.prototype.postRender.apply(this, arguments);
    // When the list mixes phishing resistant and other methods, the others are collapsed
    // under a "More options" toggle.
    const moreCollection = this.options.moreCollection;
    if (!moreCollection || !moreCollection.length) {
      return;
    }
    this.renderMoreOptions(moreCollection);
  },
  
  renderMoreOptions(moreCollection) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'authenticator-more-options-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    const containerId = `authenticator-more-options-${this.cid}`;
    toggle.setAttribute('aria-controls', containerId);
    toggle.setAttribute('data-se', 'authenticator-more-options-toggle');
    toggle.textContent = loc('oie.select.authenticators.verify.more.options', 'login');
    const container = document.createElement('div');
    container.id = containerId;
    container.className = 'authenticator-more-options';
    container.hidden = true;
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      container.hidden = expanded;
    });
    // Gray wrapper around the toggle and the collapsed list
    this.el.appendChild(Object.assign(document.createElement('div'), {
      className: 'authenticator-more-options-group',
    })).append(toggle, container);
    const moreList = new AuthenticatorVerifyList({
      model: this.model,
      collection: moreCollection,
      name: this.options.name,
      appState: this.options.appState,
    });
    container.appendChild(moreList.render().el);
    this.moreList = moreList;
  },

  remove() {
    this.moreList?.remove();
    return ListView.prototype.remove.apply(this, arguments);
  },

  handleModelInvalid(data, error) {
    if (this.options.name in error && !this.model.get(this.options.name)) {
      this.showAuthenticatorRequiredError();
    }
  },

  showAuthenticatorRequiredError() {
    const errorSummary = this.collection.length > 1
      ? loc('account.unlock.authenticatorRequired.multiple', 'login')
      : loc('account.unlock.authenticatorRequired.single', 'login');
    this.model.trigger('error', this.model, { responseJSON: { errorSummary } });
  },

  handleSelect(data) {
    //If schema contains a required identifier to fill first then validate the form
    const validationError = this.model.validateField('identifier');
    this.model.trigger('clearFormError');
    if(this.model.getPropertySchema('identifier')?.required && validationError) {
      this.model.trigger('invalid', this.model, validationError);
    } else {
      this.model.set(this.options.name, data);
      this.options.appState.trigger('saveForm', this.model); 
    }
  },

  template: hbs`<div class="list-content"> </div>`,

});

export default AuthenticatorVerifyList;
