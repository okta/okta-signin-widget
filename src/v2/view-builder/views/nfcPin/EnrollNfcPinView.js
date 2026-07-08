import { loc } from '@okta/courage';
import { BaseForm, BaseFooter, BaseOktaVerifyChallengeView, BaseView } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import { getFactorPageCustomLink } from '../../utils/LinksUtil';
import { doChallenge } from '../../utils/ChallengeViewUtil';
import { AUTHENTICATOR_CANCEL_ACTION } from '../../utils/Constants';  // used by DeviceChallengeBody.pollingCancelAction
import Link from '../../components/Link';
import { generatePasswordPolicyHtml } from '../password/PasswordPolicyUtil';

/**
 * Phase 1: Device challenge — launches OV via setupNfcUrl, polls
 */
const DeviceChallengeBody = BaseOktaVerifyChallengeView.extend({
  pollingCancelAction: AUTHENTICATOR_CANCEL_ACTION,

  getDeviceChallengePayload: function() {
    const authenticator = this.options.appState.get('currentAuthenticator')
      || this.options.appState.get('currentAuthenticatorEnrollment');
    const setupNfcUrl = authenticator?.contextualData?.setupNfcUrl;
    if (setupNfcUrl) {
      return {
        challengeMethod: 'CUSTOM_URI',
        href: setupNfcUrl,
      };
    }
    return authenticator?.contextualData?.challenge?.value || {};
  },

  doChallenge: function() {
    doChallenge(this);
  },
});

/**
 * Phase 3: PIN creation — same pattern as EnrollAuthenticatorPasswordView
 */
const PinCreateBody = BaseForm.extend({
  className: 'nfc-pin-create',

  title: function() {
    return loc('oie.enroll.nfc_pin.create.title', 'login');
  },

  subtitle: function() {
    return loc('oie.enroll.nfc_pin.create.description', 'login');
  },

  save: function() {
    return loc('oform.next', 'login');
  },

  initialize: function() {
    BaseForm.prototype.initialize.apply(this, arguments);
    // Show PIN requirements (minLength from settings)
    const settings = this.options.currentViewState?.relatesTo?.value?.settings
      || this.options.appState.get('enrollmentAuthenticator')?.settings;
    if (settings?.minLength) {
      const rulesList = [loc('oie.enroll.nfc_pin.create.requirement.length', 'login', [settings.minLength])];
      generatePasswordPolicyHtml(this, rulesList, true);
    }
  },

  getUISchema: function() {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    const confirmPin = {
      name: 'confirmPassword',
      label: loc('oie.enroll.nfc_pin.create.confirmPinLabel', 'login'),
      type: 'password',
      'label-top': true,
      params: {
        showPasswordToggle: this.settings.get('showPasswordToggle'),
      }
    };

    const updatedSchema = [];
    for (let field of uiSchemas) {
      // Rename the passcode field label
      if (field.name === 'credentials.passcode') {
        updatedSchema.push(Object.assign({}, field, {
          label: loc('oie.enroll.nfc_pin.create.pinLabel', 'login'),
        }));
        updatedSchema.push(confirmPin);
      } else {
        updatedSchema.push(field);
      }
    }
    return updatedSchema;
  },
});

const DeviceChallengeFooter = BaseFooter.extend({
  initialize: function() {
    this.add(Link, {
      options: {
        name: 'cancel',
        label: loc('goback', 'login'),
        clickHandler: () => {
          this.options.appState.trigger('invokeAction', 'cancel');
        },
      }
    });
  },
});

const DefaultFooter = BaseFooter.extend({
  links: function() {
    return getFactorPageCustomLink(this.options.appState, this.options.settings);
  },
});

/**
 * NFC PIN enrollment view — routes to the correct phase based on IDX response,
 * same as v3's transformNfcPinEnroll router.
 */
export default BaseAuthenticatorView.extend({
  createModelClass: function() {
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    // Capture PIN settings (minLength/maxLength) in closure for use in validate()
    const pinSettings = this.options.currentViewState?.relatesTo?.value?.settings
      || this.options.appState.get('enrollmentAuthenticator')?.settings
      || {};
    const pinLength = pinSettings.minLength || pinSettings.maxLength || 0;

    const local = Object.assign(
      {
        confirmPassword: {
          type: 'string',
          required: true,
        }
      },
      ModelClass.prototype.local,
    );
    return ModelClass.extend({
      local,
      validate: function() {
        const pin = this.get('credentials.passcode');
        const confirmPin = this.get('confirmPassword');
        const errors = {};

        // Validate length
        if (pin && pinLength > 0 && pin.length !== pinLength) {
          errors['credentials.passcode'] = loc('oie.enroll.nfc_pin.create.requirement.length', 'login', [pinLength]);
        }

        // Validate numeric only
        if (pin && !/^\d+$/.test(pin)) {
          errors['credentials.passcode'] = loc('oie.enroll.nfc_pin.create.error.numeric', 'login');
        }

        // Validate PINs match
        if (pin && confirmPin && pin !== confirmPin) {
          errors['confirmPassword'] = loc('oie.enroll.nfc_pin.create.error.match', 'login');
        }

        return Object.keys(errors).length ? errors : null;
      }
    });
  },

  initialize: function() {
    BaseAuthenticatorView.prototype.initialize.apply(this, arguments);

    const appState = this.options.appState;
    const currentViewState = this.options.currentViewState;

    const uiSchema = currentViewState?.uiSchema || [];
    const hasPinField = uiSchema.some(function(field) {
      return field.name === 'credentials.passcode';
    });

    if (hasPinField) {
      // Phase 2: PIN creation
      this.Body = PinCreateBody;
      this.Footer = DefaultFooter;
    } else {
      // Phase 1: Device challenge — go directly, no setup instructions screen
      this.Body = DeviceChallengeBody;
      this.Footer = DeviceChallengeFooter;
    }
  },
});
