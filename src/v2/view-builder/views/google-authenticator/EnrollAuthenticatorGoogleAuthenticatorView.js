import { loc, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { addCustomButton, BaseForm, BaseView } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import EnrollGoogleAuthenticatorBarcodeView from './EnrollGoogleAuthenticatorBarcodeView';
import EnrollAuthenticatorManualSetupView from './EnrollAuthenticatorManualSetupView';

const VIEW_TO_DISPLAY = 'viewToDisplay';
const viewToDisplayState = {
  BARCODE: 'barcode',
  MANUAL: 'manual',
  ENTER_CODE: 'enterCode',
};

const Body = BaseForm.extend({
  title() {
    return loc('oie.enroll.google_authenticator.setup.title', 'login');
  },

  noButtonBar: true,

  className: 'oie-enroll-google-authenticator',

  enterCodeSubtitle: View.extend({
    template: hbs`
      <div class="google-authenticator-setup-info-title enter-code-title">
      {{i18n code="oie.enroll.google_authenticator.enterCode.title" bundle="login"}}
      </div>
    `,
  }),

  getUISchema() {
    const schema = BaseForm.prototype.getUISchema.apply(this, arguments);
    // https://oktainc.atlassian.net/browse/OKTA-555191
    const nextButton = addCustomButton({
      className: 'google-authenticator-next',
      title: loc('oform.next', 'login'),
      click: () => {
        this.model.set(VIEW_TO_DISPLAY, viewToDisplayState.ENTER_CODE);
      }
    });

    const verifyButton = addCustomButton({
      className: 'google-authenticator-verify',
      title: loc('oform.verify', 'login'),
      click: () => {
        this.$el.submit();
      }
    });

    schema[0].showWhen = {
      viewToDisplay: viewToDisplayState.ENTER_CODE,
    };

    // Add Enter Code Subtitle
    schema.unshift({
      View: this.enterCodeSubtitle,
      selector: '.o-form-fieldset-container',
      showWhen: {
        viewToDisplay: viewToDisplayState.ENTER_CODE,
      }
    });

    schema.push(
      {
        View: EnrollGoogleAuthenticatorBarcodeView,
        selector: '.o-form-fieldset-container',
        showWhen: {
          viewToDisplay: viewToDisplayState.BARCODE,
        }
      }, {
        View: EnrollAuthenticatorManualSetupView,
        selector: '.o-form-fieldset-container',
        showWhen: {
          viewToDisplay: viewToDisplayState.MANUAL,
        }
      }, {
        View: View.extend({
          className: 'o-form-fieldset o-form-label-top',
          // Render the secret as plain, selectable text (not a readonly input, which
          // looked disabled and let a double-click selection spill into the Next
          // button). Keeping it a single contiguous string lets a double-click select
          // the whole value; letter-spacing (see SCSS) provides the visual spacing.
          // tabindex="0" keeps the secret in the tab order (as the previous readonly
          // input was), and the aria-label spells out each character so screen readers
          // announce the code one letter at a time on focus.
          // https://oktainc.atlassian.net/browse/OKTA-1185578
          template: hbs`
            <div class="o-form-input">
              <span
                class="shared-secret no-translate"
                tabindex="0"
                aria-label="{{sharedSecretSpaced}}"
              >{{sharedSecret}}</span>
            </div>
          `,
          getTemplateData() {
            const sharedSecret = this.options.appState.get('currentAuthenticator').contextualData.sharedSecret || '';
            return {
              sharedSecret,
              sharedSecretSpaced: sharedSecret.split('').join(' '),
            };
          },
        }),
        selector: '.o-form-fieldset-container',
        showWhen: {
          viewToDisplay: viewToDisplayState.MANUAL,
        }
      },
      {
        View: nextButton,
        showWhen: {
          viewToDisplay: (val) => val === viewToDisplayState.BARCODE || val === viewToDisplayState.MANUAL,
        }
      },
      {
        View: verifyButton,
        showWhen: {
          viewToDisplay: (val) => val === viewToDisplayState.ENTER_CODE,
        }
      },
    );
    return schema;
  },
});

export default BaseAuthenticatorView.extend({
  Body,
  createModelClass() {
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const local = Object.assign(
      {
        viewToDisplay: {
          value: 'barcode',
          type: 'string',
          required: true,
          values: [viewToDisplayState.BARCODE, viewToDisplayState.MANUAL, viewToDisplayState.ENTER_CODE],
        }
      },
      ModelClass.prototype.local,
    );
    return ModelClass.extend({
      local,
    });
  },
});
