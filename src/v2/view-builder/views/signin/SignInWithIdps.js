import { View, createButton } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

const IDP_SEARCH_THRESHOLD = 10;

export default View.extend({
  className: 'sign-in-with-idp',
  template: hbs`
    {{#if isSecondaryIdpDisplay}}
    <div class="separation-line"><span>{{i18n code="socialauth.divider.text" bundle="login"}}</span></div>
    {{/if}}
    {{#if showSearchContainer}}
    <div class="okta-piv-container"></div>
    <div class="idp-discovery-container">
      <label class="idp-discovery-search-label">{{i18n code="idps.search.label" bundle="login"}}</label>
      <div class="idp-discovery-search-wrapper">
        <input type="search" class="idp-discovery-search-input"
               data-se="idp-search-input"
               aria-label="{{i18n code='idps.search.label' bundle='login'}}"
               placeholder="{{i18n code='idps.search.typeahead.placeholder' bundle='login'}}"
               autocomplete="off">
      </div>
      <div class="okta-idps-container" data-se="idp-list-container"></div>
      <div class="idp-no-results" data-se="idp-no-results">
        {{i18n code="idps.search.no.results" bundle="login"}}
      </div>
    </div>
    {{else}}
    <div class="okta-idps-container"></div>
    {{/if}}
    {{#if isPrimaryIdpDisplay}}
    <div class="separation-line"><span>{{i18n code="socialauth.divider.text" bundle="login"}}</span></div>
    {{/if}}
    `,

  events: {
    'input .idp-discovery-search-input': '_filterIdps',
  },

  initialize() {
    const { idpButtons } = this.options;
    const showSearch = idpButtons.length > IDP_SEARCH_THRESHOLD;

    idpButtons.forEach((idpButton) => {
      const isPiv = idpButton.className && idpButton.className.includes('piv-button');
      const selector = (showSearch && isPiv) ? '.okta-piv-container' : '.okta-idps-container';
      this.add(createButton(idpButton), selector);
    });
  },

  _filterIdps(e) {
    const query = e.target.value.toLowerCase().trim();
    let visibleCount = 0;
    this.$('.okta-idps-container .link-button').each((i, btn) => {
      const text = (btn.textContent || '').toLowerCase().trim();
      const visible = !query || text.includes(query);
      btn.style.display = visible ? '' : 'none';
      if (visible) {
        visibleCount++;
      }
    });
    if (visibleCount > 0) {
      this.$('.okta-idps-container').show();
      this.$('.idp-no-results').hide();
    } else {
      this.$('.okta-idps-container').hide();
      this.$('.idp-no-results').show();
    }
  },

  getTemplateData() {
    const jsonData = View.prototype.getTemplateData.apply(this, arguments);
    const { idpButtons } = this.options;
    const addDivider = idpButtons.length > 0;

    return Object.assign(jsonData, {
      isPrimaryIdpDisplay: addDivider && this.options.isPrimaryIdpDisplay,
      isSecondaryIdpDisplay: addDivider && !this.options.isPrimaryIdpDisplay,
      showSearchContainer: idpButtons.length > IDP_SEARCH_THRESHOLD,
    });
  }
});
