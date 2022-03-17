import AppState from 'v2/models/AppState';
import { FORMS } from 'v2/ion/RemediationConstants';
import { getSwitchAuthenticatorLink, getFactorPageCustomLink } from 'v2/view-builder/utils/LinksUtil';
import Settings from '../../../../../../src/models/Settings';

describe('v2/utils/LinksUtil', function() {
  const mockAppState = (remediationFormName, hasMoreThanOneAuthenticator, isPasswordRecovery) => {
    const appState = new AppState();
    jest.spyOn(appState, 'getRemediationAuthenticationOptions').mockImplementation(formName => {
      if (formName === remediationFormName && hasMoreThanOneAuthenticator) {
        return [ { label: 'some authenticator '}, { label: 'another authenticator' } ];
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
        const appState = mockAppState(FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE, true);
        expect(getSwitchAuthenticatorLink(appState).length).toEqual(1);
      });

      it('returns empty when just one authenticator available', function() {
        const appState = mockAppState(FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE, false);
        expect(getSwitchAuthenticatorLink(appState).length).toEqual(0);
      });
    });

    describe('select-authenticator-enroll', () => {
      it('returns a link when multiple authenticators available', function() {
        const appState = mockAppState(FORMS.SELECT_AUTHENTICATOR_ENROLL, true);
        expect(getSwitchAuthenticatorLink(appState).length).toEqual(1);
      });

      it('returns empty when just one authenticator available', function() {
        const appState = mockAppState(FORMS.SELECT_AUTHENTICATOR_ENROLL, false);
        expect(getSwitchAuthenticatorLink(appState).length).toEqual(0);
      });
    });
  });

  describe('getFactorPageCustomLink', () => {
    it('returns a link when it is in select-authenticator-authenticate, and not a password recover flow', function() {
      const appState = mockAppState(FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE, true, false);
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
      const appState = mockAppState(FORMS.SELECT_AUTHENTICATOR_ENROLL, true, false);
      const settings = new Settings({
        baseUrl: 'https://foo',
        'helpLinks.factorPage.text': 'custom factor page link',
        'helpLinks.factorPage.href': 'https://acme.com/what-is-okta-autheticators',
      });
      expect(getFactorPageCustomLink(appState, settings).length).toEqual(0);
    });

    it('returns empty when  it is in select-authenticator-authenticate but in a password recover flow', function() {
      const appState = mockAppState(FORMS.SELECT_AUTHENTICATOR_AUTHENTICATE, true, true);
      const settings = new Settings({
        baseUrl: 'https://foo',
        'helpLinks.factorPage.text': 'custom factor page link',
        'helpLinks.factorPage.href': 'https://acme.com/what-is-okta-autheticators',
      });
      expect(getFactorPageCustomLink(appState, settings).length).toEqual(0);
    });

    it('returns a link when it is in challenge-authenticator, and not a password recover flow', function() {
      const appState = mockAppState(FORMS.CHALLENGE_AUTHENTICATOR, true, false);
      const settings = new Settings({
        baseUrl: 'https://foo',
        'helpLinks.factorPage.text': 'custom factor page link',
        'helpLinks.factorPage.href': 'https://acme.com/what-is-okta-autheticators',
      });
      expect(getFactorPageCustomLink(appState, settings).length).toEqual(1);
    });

    it('returns empty when it is in challenge-authenticator, and in a password recover flow', function() {
      const appState = mockAppState(FORMS.CHALLENGE_AUTHENTICATOR, true, true);
      const settings = new Settings({
        baseUrl: 'https://foo',
        'helpLinks.factorPage.text': 'custom factor page link',
        'helpLinks.factorPage.href': 'https://acme.com/what-is-okta-autheticators',
      });
      expect(getFactorPageCustomLink(appState, settings).length).toEqual(0);
    });
  });
});
