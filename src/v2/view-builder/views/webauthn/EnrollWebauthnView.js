import { _, loc, createCallout, createButton, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { BaseForm } from '../../internals';
import AuthenticatorFooter from '../../components/AuthenticatorFooter';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import webauthn from 'util/webauthn';
import CryptoUtil from 'util/CryptoUtil';
import EnrollWebauthnInfoView from './EnrollWebauthnInfoView';
import { getMessageFromBrowserError } from '../../../ion/i18nTransformer';
import { FORMS as RemediationForms } from '../../../ion/RemediationConstants';
import { getWebAuthnTitle } from '../../utils/AuthenticatorUtil';
import { getSkipSetupLink } from '../../utils/LinksUtil';
import {
  getWebAuthnI18nKey,
  isPromotionPasskeys as isPromotionPasskeysShared,
  shouldShowPasskeySplash,
} from 'util/webauthnDisplayNameUtils';
import { passkeyPromotionIllustration } from './passkeyPromotionIllustration';

const isPromotionPasskeys = (currentViewState) => isPromotionPasskeysShared(
  currentViewState?.name,
  currentViewState?.relatesTo?.value?.displayName,
);

// Splash content (illustration + FAQ) shown when the passkey displayName applies.
// Illustration SVG uses `fill="currentColor"` so it inherits from the enclosing
// element's CSS `color`, which ColorsUtil overrides with `colors.brand` when configured.
//
// {{{illustrationSvg}}} renders unescaped. Safe here because `passkeyPromotionIllustration`
// is a compile-time constant defined in this repo — do NOT wire user-controlled input
// through this field or the SVG becomes an XSS vector.
const PasskeySplashInfoView = View.extend({
  className: 'oie-passkey-splash-content',
  template: hbs`
    <div class="passkey-promotion-illustration">{{{illustrationSvg}}}</div>
    <div class="passkey-promotion-faq">
      <h3 class="passkey-promotion-faq-title">
        {{i18n code="oie.enroll.authenticator.promotion.faq.benefit.title" bundle="login"}}
      </h3>
      <p class="passkey-promotion-faq-description">
        {{i18n code="oie.enroll.authenticator.promotion.faq.benefit.description" bundle="login"}}
      </p>
      <h3 class="passkey-promotion-faq-title">
        {{i18n code="oie.enroll.authenticator.promotion.faq.definition.title" bundle="login"}}
      </h3>
      <p class="passkey-promotion-faq-description">
        {{i18n code="oie.enroll.authenticator.promotion.faq.definition.description" bundle="login"}}
      </p>
      <h3 class="passkey-promotion-faq-title">
        {{i18n code="oie.enroll.authenticator.promotion.faq.storage.title" bundle="login"}}
      </h3>
      <p class="passkey-promotion-faq-description">
        {{i18n code="oie.enroll.authenticator.promotion.faq.storage.description" bundle="login"}}
      </p>
    </div>
  `,
  getTemplateData() {
    return {
      illustrationSvg: passkeyPromotionIllustration,
    };
  },
});

function getExcludeCredentials(authenticatorEnrollments = []) {
  const credentials = [];
  authenticatorEnrollments.forEach((enrollement) => {
    if (enrollement.key === 'webauthn') {
      const credential = {
        type: 'public-key',
        id: CryptoUtil.strToBin(enrollement.credentialId),
      };
      // okta-core may emit profile.transports as a comma separated string so the entire
      // profile serializes as Map<String,String>; tolerate both array and string shapes.
      let transports = enrollement.transports ?? enrollement.profile?.transports;
      if (typeof transports === 'string') {
        transports = transports.split(',');
      }
      if (Array.isArray(transports)) {
        credential.transports = transports;
      }
      credentials.push(credential);
    }
  });
  return credentials;
}

const Body = BaseForm.extend({
  title() {
    if (isPromotionPasskeys(this.options.currentViewState)) {
      return loc('oie.enroll.authenticator.promotion.title', 'login');
    }
    return getWebAuthnTitle(this.options.currentViewState, false);
  },
  className: 'oie-enroll-webauthn',
  modelEvents: {
    'error': '_stopEnrollment',
  },
  getUISchema() {
    const schema = [];
    // Returning custom array so no input fields are displayed for webauthn
    if (webauthn.isNewApiAvailable()) {
      const displayName = this.options.currentViewState?.relatesTo?.value?.displayName;
      // The passkey splash (illustration + FAQ) is additive — when the displayName
      // qualifies, it prepends above the existing EnrollWebauthnInfoView, which
      // continues to render the instructions line, Edge/UV callouts, custom
      // additional-instructions callout, and spinner.
      if (shouldShowPasskeySplash(displayName)) {
        schema.push({
          View: PasskeySplashInfoView,
        });
      }
      schema.push({
        View: EnrollWebauthnInfoView,
      });
      const ctaLabel = isPromotionPasskeys(this.options.currentViewState)
        ? loc('oie.enroll.authenticator.promotion.cta.createPasskey', 'login')
        : loc('oie.enroll.webauthn.save', 'login');
      schema.push({
        View: createButton({
          className: 'webauthn-setup button button-primary button-wide',
          title: ctaLabel,
          click: () => {
            this.triggerWebauthnPrompt();
          },
        }),
      });
    } else {
      schema.push({
        View: createCallout({
          className: 'webauthn-not-supported',
          type: 'error',
          subtitle: getWebAuthnI18nKey({
            DEFAULT: loc('oie.webauthn.error.not.supported', 'login'),
            PASSKEYS: loc('oie.webauthn.passkeysRebrand.error.not.supported', 'login'),
            CUSTOM: loc('oie.webauthn.passkeysRebrand.error.not.supported', 'login')
          }, this.options.currentViewState.relatesTo?.value?.displayName),
        }),
      });
    }
    return schema;
  },
  triggerWebauthnPrompt() {
    this.$el.find('.o-form-error-container').empty();
    this._startEnrollment();
    const relatesToObject = this.options.currentViewState.relatesTo;
    const activationData = relatesToObject?.value.contextualData.activationData;
    if (webauthn.isNewApiAvailable()) {
      const excludeCredentials = activationData.authenticatorSelection?.requireResidentKey === true ?
        [] :
        getExcludeCredentials(this.options.appState.get('authenticatorEnrollments').value);
      const options = _.extend({}, activationData, {
        challenge: CryptoUtil.strToBin(activationData.challenge),
        user: {
          id: CryptoUtil.strToBin(activationData.user.id),
          name: activationData.user.name,
          displayName: activationData.user.displayName
        },
        excludeCredentials
      });
      // AbortController is not supported in IE11
      if (typeof AbortController !== 'undefined') {
        this.webauthnAbortController = new AbortController();
      }
      navigator.credentials.create({
        publicKey: options,
        signal: this.webauthnAbortController && this.webauthnAbortController.signal
      }).then((newCredential) => {
        // example data: ["nfc", "usb"]
        const transports =
          webauthn.processWebAuthnResponse(newCredential.response.getTransports, newCredential.response);
        this.model.set({
          credentials : {
            clientData: CryptoUtil.binToStr(newCredential.response.clientDataJSON),
            attestation: CryptoUtil.binToStr(newCredential.response.attestationObject),
            ...(transports !== null && { transports }),
            // example data: {"credProps":{"rk":true}}
            clientExtensions: webauthn.processWebAuthnResponse(newCredential.getClientExtensionResults, newCredential)
          }
        });
        this.saveForm(this.model);
      })
        .catch((error) => {
          // Override the default browser RP ID mismatch error in order to provide
          // a more user friendly error and have it localized
          if (webauthn.isRelyingPartyIdMismatchError(error)) {
            this.model.trigger('error', this.model, {
              responseJSON: {
                errorSummary: loc('signin.passkeys.error.SecurityError', 'login')
              }
            });
            return;
          }
          this.model.trigger('error', this.model, {responseJSON: {errorSummary: getMessageFromBrowserError(error)}});
        }).finally(() => {
          this.webauthnAbortController = null;
        });
    }
  },
  _startEnrollment: function() {
    this.$('.okta-waiting-spinner').show();
    this.$('.webauthn-setup').hide();
  },

  _stopEnrollment: function() {
    this.$('.okta-waiting-spinner').hide();
    this.$('.webauthn-setup').show();
  },
});

// Extend AuthenticatorFooter (rather than BaseFooter) so the switch-authenticator
// link ("Return to authenticator list") and any factor-page custom link keep
// rendering. Append the "Maybe later" skip link on top ONLY when this view is
// serving the `enroll-authenticator-promotion` remediation — the API always
// ships a sibling `skip` on that remediation. Scoping by form name (rather than
// just presence of `skip`) prevents the promotion-specific "Maybe later" label
// from leaking into any standard `enroll-authenticator` response that happens
// to include a skip step.
const Footer = AuthenticatorFooter.extend({
  links() {
    const baseLinks = AuthenticatorFooter.prototype.links.call(this);
    if (!this.options.appState.hasRemediationObject(RemediationForms.ENROLL_AUTHENTICATOR_PROMOTION)) {
      return baseLinks;
    }
    return baseLinks.concat(
      getSkipSetupLink(
        this.options.appState,
        loc('oie.enroll.authenticator.promotion.skip', 'login'),
      ),
    );
  },
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer,
  postRender() {
    BaseAuthenticatorView.prototype.postRender.apply(this, arguments);
    this.$el.find('.o-form-button-bar [type="submit"]').remove();
  },
});
