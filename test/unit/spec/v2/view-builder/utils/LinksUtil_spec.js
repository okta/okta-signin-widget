import AppState from 'v2/models/AppState';
import { FORMS } from 'v2/ion/RemediationConstants';
import { getSwitchAuthenticatorLink, getFactorPageCustomLink } from 'v2/view-builder/utils/LinksUtil';
import Settings from '../../../../../../src/models/Settings';

describe('v2/utils/LinksUtil', function() {
  const mockAppState = ({ remediationFormName, authenticatorCount, isPasswordRecovery }) => {
    const appState = new AppState();
    jest.spyOn(appState, 'getRemediationAuthenticationOptions').mockImplementation(formName => {
      if (formName === remediationFormName) {
        if (authenticatorCount === 'many') {
          return [ { label: 'some authenticator '}, { label: 'another authenticator' } ];
        } else if (authenticatorCount === 'one') {
          return [ { label: 'some authenticator '} ];
        }
      }
      return [];
    });
    jest.spyOn(appState, 'get').mockImplementation(attribute => {
      if (attribute === 'currentFormName') {
        return remediationFormName;
      }
      if (attribute === 'isPasswordRecovery') {
        return isPasswordRecovery;
      }
    });
    return appState;
  };

  describe('getSwitchAuthenticatorLink', () => {
    describe('select-authenticator-authenticate', () => {
      it('returns a link when multiple authenticators available', function() {
        const appState = mockAppState({ remediationFormName: FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE, authenticatorCount: 'many' });
        expect(getSwitchAuthenticatorLink(appState).length).toEqual(1);
      });

      it('returns empty when just one authenticator available', function() {
        const appState = mockAppState({ remediationFormName: FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE });
        expect(getSwitchAuthenticatorLink(appState).length).toEqual(0);
      });
    });

    describe('select-authenticator-enroll', () => {
      it('returns a link when multiple authenticators available', function() {
        const appState = mockAppState({ remediationFormName: FORMS.SELECT_AUTHENTICATOR_ENROLL, authenticatorCount: 'many' });
        expect(getSwitchAuthenticatorLink(appState).length).toEqual(1);
      });

      it('returns a link when just one authenticator available', function() {
        const appState = mockAppState({ remediationFormName: FORMS.SELECT_AUTHENTICATOR_ENROLL, authenticatorCount: 'one' });
        expect(getSwitchAuthenticatorLink(appState).length).toEqual(1);
      });

      it('returns empty when there is no authenticator available', function() {
        const appState = mockAppState({ remediationFormName: FORMS.SELECT_AUTHENTICATOR_ENROLL });
        expect(getSwitchAuthenticatorLink(appState).length).toEqual(0);
      });
    });
  });

  describe('getFactorPageCustomLink', () => {
    it('returns a link when it is in select-authenticator-authenticate, and not a password recover flow', function() {
      const appState = mockAppState({ remediationFormName: FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE, isPasswordRecovery: false });
      const settings = new Settings({
        baseUrl: 'https://foo',
        'helpLinks.factorPage.text': 'custom factor page link',
        'helpLinks.factorPage.href': 'https://acme.com/what-is-okta-autheticators',
      });
      const factorPageCustomLink = getFactorPageCustomLink(appState, settings);
      expect(factorPageCustomLink.length).toEqual(1);
      expect(factorPageCustomLink[0].target).toEqual('_blank');
    });

    it('returns empty when is not select-authenticator-authenticate', function() {
      const appState = mockAppState({ remediationFormName: FORMS.SELECT_AUTHENTICATOR_ENROLL, isPasswordRecovery: false });
      const settings = new Settings({
        baseUrl: 'https://foo',
        'helpLinks.factorPage.text': 'custom factor page link',
        'helpLinks.factorPage.href': 'https://acme.com/what-is-okta-autheticators',
      });
      expect(getFactorPageCustomLink(appState, settings).length).toEqual(0);
    });

    it('returns empty when  it is in select-authenticator-authenticate but in a password recover flow', function() {
      const appState = mockAppState({ remediationFormName: FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE, isPasswordRecovery: true });
      const settings = new Settings({
        baseUrl: 'https://foo',
        'helpLinks.factorPage.text': 'custom factor page link',
        'helpLinks.factorPage.href': 'https://acme.com/what-is-okta-autheticators',
      });
      expect(getFactorPageCustomLink(appState, settings).length).toEqual(0);
    });

    it('returns a link when it is in challenge-authenticator, and not a password recover flow', function() {
      const appState = mockAppState({ remediationFormName: FORMS.CHALLENGE_AUTHENTICATOR, isPasswordRecovery: false });
      const settings = new Settings({
        baseUrl: 'https://foo',
        'helpLinks.factorPage.text': 'custom factor page link',
        'helpLinks.factorPage.href': 'https://acme.com/what-is-okta-autheticators',
      });
      expect(getFactorPageCustomLink(appState, settings).length).toEqual(1);
    });

    it('returns empty when it is in challenge-authenticator, and in a password recover flow', function() {
      const appState = mockAppState({ remediationFormName: FORMS.CHALLENGE_AUTHENTICATOR, isPasswordRecovery: true });
      const settings = new Settings({
        baseUrl: 'https://foo',
        'helpLinks.factorPage.text': 'custom factor page link',
        'helpLinks.factorPage.href': 'https://acme.com/what-is-okta-autheticators',
      });
      expect(getFactorPageCustomLink(appState, settings).length).toEqual(0);
    });
  });
});
