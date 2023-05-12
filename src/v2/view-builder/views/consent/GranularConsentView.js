import { BaseView, BaseForm } from '../../internals';
import { _, $, View } from '@okta/courage';
import ConsentViewForm from './ConsentViewForm';
import AdminConsentViewHeader from './AdminConsentViewHeader';
import EnduserConsentViewFooter from './EnduserConsentViewFooter';
import ScopeCheckBox from '../../components/ScopeCheckBox';
// let { BaseSchema, SchemaProperty } = internal.models;
import hbs from '@okta/handlebars-inline-precompile';
// import oktaUnderscore from "@okta/courage/esm/src/courage/util/underscore-wrapper";
// import Backbone from "@okta/courage/esm/src/courage/vendor/lib/backbone";

const granularConsentViewHeader = AdminConsentViewHeader.extend({
  hasIssuer: false,
  template: hbs`
    {{#if clientURI}}
    <a href="{{clientURI}}" class="client-logo-link" title="{{altText}}" target="_blank">
    {{/if}}
    {{#if customLogo}}
      <img class="client-logo custom-logo" src="{{customLogo}}" alt="{{altText}}" aria-hidden />
    {{else}}
      <img class="client-logo default-logo" src="{{defaultLogo}}" alt="{{altText}}" aria-hidden />
    {{/if}}
    {{#if clientURI}}
      </a>
    {{/if}}
    <h1>
      <span class="title-text">
        {{i18n 
            code="oie.consent.scopes.granular.title" bundle="login" 
            arguments="appName"
            $1="<b class='no-translate'>$1</b>"
            $2="<p>$2</p>"
        }}
      </span>
    </h1>
    `,
});

const granularConsentViewForm = ConsentViewForm.extend({
  cancel: BaseForm.prototype.cancel,

  getUISchema() {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    uiSchemas.forEach(schema => {
      if (schema.type === 'checkbox') {
        _.assign(schema, {
          input: ScopeCheckBox,
          options: {
            desc: schema.desc,
            mutable: schema.mutable,
            // need to extract scope name because it is in a subform (optedScopes.name)
            scopeName: schema.name.substring(schema.name.indexOf('.') + 1)
          }
        });
      }
    });
    return uiSchemas;
  }
});

// const modelExtend = BaseSchema.Model.extend({
//
//   toJSON: function (options) {
//     options || (options = {});
//
//     var res = oktaUnderscore.clone(Backbone.Model.prototype.toJSON.apply(this, arguments));
//
//     var schema = this['__schema__']; // cleanup local properties
//
//     if (!options.verbose) {
//       res = oktaUnderscore.omit(res, oktaUnderscore.keys(schema.local));
//     } else {
//       // add derived properties
//       oktaUnderscore.each(schema.derived, function (options, name) {
//         res[name] = this.get(name);
//       }, this);
//     }
//
//     if (this.flat) {
//       res = unflatten(res);
//     }
//
//     return res;
//   },
// });
//
//
// function unflatten(data) {
//   console.log("unflatten custom");
//   oktaUnderscore.each(data, function (value, key, data) {
//     if (key.indexOf('.') === -1) {
//       return;
//     }
//
//     var part;
//     var ref = data;
//     var parts = key.split('.');
//
//     while ((part = parts.shift()) !== undefined) {
//       if (!ref[part]) {
//         ref[part] = parts.length ? {} : value;
//       }
//
//       ref = ref[part];
//     }
//
//     delete data[key];
//   });
//
//   return data;
// }

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
