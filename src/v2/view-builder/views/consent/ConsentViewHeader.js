import { View, _ } from 'okta';
import hbs from 'handlebars-inline-precompile';

const defaultLogo = '/img/logos/default.png';

const ConsentViewHeader = View.extend({
  className: 'consent-title detail-row',
  template: hbs`
    {{#if clientURI}}
    <a href="{{clientURI}}" class="client-logo-link" target="_blank">
    {{/if}}
    {{#if customLogo}}
      <img class="client-logo custom-logo" src="{{customLogo}}" alt="{{altText}}" aria-hidden="true" />
    {{else}}
      <img class="client-logo default-logo" src="{{defaultLogo}}" alt="{{altText}}" aria-hidden="true" />
    {{/if}}
    {{#if clientURI}}
      </a>
    {{/if}}
    <h1>
      <span class="title-text">
        {{#if isAdminConsent}}
          {{{i18n code="consent.required.text" bundle="login" arguments="appName"}}}
        {{else}}
          {{{i18n code="consent.required.header" bundle="login" arguments="appName"}}}
        {{/if}}
      </span>
      {{#if issuer}}
        <div class="issuer"><span>{{issuer}}</span></div>
      {{/if}}
    </h1>`,
  getTemplateData: function () {
    const { appState } = this.options;
    const currentFormName = appState.get('currentFormName');
    const { label, clientUri, logo } =  appState.get('app');
    const { issuer: issuerObj } = appState.get('authentication');
    const customLogo = logo?.href;
    const altText = logo?.alt || 'aria logo';

    const isAdminConsent = currentFormName === 'admin-consent';

    const appName = _.escape(label);

    const clientURI = clientUri?.href;
    const issuer = isAdminConsent ? issuerObj?.uri : null;

    return {
      appName,
      customLogo,
      defaultLogo,
      clientURI,
      issuer,
      isAdminConsent,
      altText,
    };
  }
});

export default ConsentViewHeader;
