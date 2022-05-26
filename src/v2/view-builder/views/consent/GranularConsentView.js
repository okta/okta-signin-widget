import { BaseView, BaseForm } from '../../internals';
import { $, loc, View } from 'okta';
import ConsentViewForm from './ConsentViewForm';
import AdminConsentViewHeader from './AdminConsentViewHeader';
import EnduserConsentViewFooter from './EnduserConsentViewFooter';
import hbs from 'handlebars-inline-precompile';

const granularConsentViewHeader = AdminConsentViewHeader.extend({
  titleText: () => loc('oie.consent.scopes.granular.title', 'login'),
  hasIssuer: false,
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
        <b class="no-translate">{{appName}}</b><p>{{titleText}}</p>
      </span>
    </h1>
    `,
});

const granularConsentViewForm = ConsentViewForm.extend({
  cancel: BaseForm.prototype.cancel
});

const GranularConsentAgreementText = View.extend({
  className: 'consent-description',
  template: hbs`<p>{{i18n code="oie.consent.scopes.granular.description" bundle="login"}}</p>`
});


export default BaseView.extend({
  Header: granularConsentViewHeader,
  Body: granularConsentViewForm,
  Footer: EnduserConsentViewFooter,

  postRender() {
    const scopeList = this.$el.find('.o-form-fieldset-container');

    // Show consent agreement text
    scopeList.before(new GranularConsentAgreementText().render().el);

    // Re-order scopes so mandatory ones are on bottom
    this.$(':disabled').each(function() {
      scopeList.append($(this).closest('.o-form-fieldset'));
    });
  }
});
