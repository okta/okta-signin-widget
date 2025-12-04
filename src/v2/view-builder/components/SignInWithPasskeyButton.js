import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

export default View.extend({
  className: 'passkey-signin-bar',
  template: hbs`
    <button type="button" class="passkey-signin-btn" style="width:100%;display:flex;align-items:center;
      justify-content:center;padding:16px;gap:8px;font-size:16px;border-radius:8px;border:1px solid #ddd;
      background:#fff;margin-bottom:16px;">
      <span class="passkey-signin-icon" style="font-size:20px;">
        <!-- Passkey Icon SVG -->
      </span>
      <span>{{buttonLabel}}</span>
    </button>
  `,
  events: {
    'click .passkey-signin-btn': function(e) {
      e.preventDefault();
      if (typeof this.options.getCredentialsAndInvokeAction === 'function') {
        this.options.getCredentialsAndInvokeAction.call(this.options.formView);
      }
    }
  },
  getTemplateData() {
    return {
      buttonLabel: 'Sign in with a passkey',
    };
  },
});
