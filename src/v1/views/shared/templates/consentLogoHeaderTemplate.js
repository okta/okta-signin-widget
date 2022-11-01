import hbs from '@okta/handlebars-inline-precompile';

const consentLogoHeaderTemplate = hbs`{{#if clientURI}}
 <a href="{{clientURI}}" class="client-logo-link" target="_blank">
{{/if}}
{{#if customLogo}}
  <img
    class="client-logo custom-logo"
    src="{{customLogo}}"
    alt="{{i18n code="common.logo.alt" bundle="login"}}"
    aria-hidden="true" />
{{else}}
  <img
  class="client-logo default-logo"
  src="{{defaultLogo}}"
  alt="{{i18n code="common.logo.alt" bundle="login"}}"
  aria-hidden="true" />
{{/if}}
{{#if clientURI}}
  </a>
{{/if}}
<h1>
  <span class="title-text">{{{i18n code="consent.required.text" bundle="login" arguments="appName"}}}</span>
  {{#if issuer}}
    <div class="issuer"><span>{{issuer}}</span></div>
  {{/if}}
</h1>`;

export default consentLogoHeaderTemplate;
