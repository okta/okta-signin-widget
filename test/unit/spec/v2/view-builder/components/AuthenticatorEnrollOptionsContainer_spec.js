import { Collection } from '@okta/courage';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import AuthenticatorEnrollOptionsContainer from 'v2/view-builder/components/AuthenticatorEnrollOptionsContainer';
import authenticatorEnrollResponse from '../../../../../../playground/mocks/data/idp/idx/authenticator-enroll-grace-period.json';

describe('v2/view-builder/components/AuthenticatorEnrollOptionsContainer', function() {
  let testContext;

  beforeEach(function() {
    testContext = {};
    testContext.init = (
      authenticators,
      skipRemediation,
    ) => {
      const currentViewState = {
        name: 'select-authenticator-enroll',
      };
      const appState = new AppState({}, {});
      appState.set('user', authenticatorEnrollResponse.user.value);
      appState.set(
        'remediation',
        authenticatorEnrollResponse.remediation.value
      );
      appState.set('idx', {neededToProceed: []});

      const settings = new Settings({ baseUrl: 'http://localhost:3000' });

      jest.spyOn(Date, 'now').mockReturnValue(new Date('12/30/2023').getTime());
      jest.spyOn(appState, 'hasRemediationObject').mockReturnValue(skipRemediation);

      testContext.view = new AuthenticatorEnrollOptionsContainer({
        currentViewState,
        appState,
        settings,
        collection: new Collection(authenticators),
        optionItems: authenticators,
        name: 'authenticator',
      });
      testContext.view.render();
    };
  });

  it('renders required now list for all expired grace periods', function() {
    const authenticators = [
      {
        label: 'Okta Phone',
        value: {
          id: 'aid568g3mXgtID0X1SLH',
        },
        relatesTo: {
          label: 'Okta Phone',
          id: 'phone-enroll-id-123',
          type: 'phone',
          key: 'phone_number',
          authenticatorId: 'aid568g3mXgtID0X1SLH',
          gracePeriod: {
            'id': 'gpe4hiasrPJX4zwZY789',
            'expiry': '2019-12-17T05:00:00.000Z'
          },
          allowedFor: 'any',
        },
        authenticatorKey: 'phone_number',
      },
      {
        label: 'Security Key or Biometric Authenticator',
        value: {
          id: 'aidtheidkwh282hv8g3',
        },
        relatesTo: {
          displayName: 'Security Key or Biometric Authenticator (FIDO2)',
          type: 'security_key',
          key: 'webauthn',
          id: 'webauthn-enroll-id-123',
          authenticatorId: 'aidtheidkwh282hv8g3',
          gracePeriod: {
            'id': 'gpe4hiasrPJX4zwZY789',
            'expiry': '2019-12-17T05:00:00.000Z'
          },
          allowedFor: 'any'
        },
        authenticatorKey: 'webauthn',
      },
    ];
    testContext.init(authenticators, false);
    expect(testContext.view.el).toMatchSnapshot();
    expect(testContext.view.$('.authenticator-list-title').length).toBe(1);
    expect(testContext.view.$('.authenticator-list-title').text()).toBe('Required now');
    expect(testContext.view.$('.authenticator-row').length).toBe(2);
    expect(testContext.view.$('.authenticator-usage-text').length).toBe(2);
    expect(testContext.view.$('.authenticator-grace-period-text-container').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-required-description').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-expiry-date').length).toBe(0);
    expect(testContext.view.$('.skip-all').length).toBe(0);
  });

  it('renders required soon list for all non-expired grace periods', function() {
    const authenticators = [
      {
        label: 'Okta Phone',
        value: {
          id: 'aid568g3mXgtID0X1SLH',
        },
        relatesTo: {
          label: 'Okta Phone',
          id: 'phone-enroll-id-123',
          type: 'phone',
          key: 'phone_number',
          authenticatorId: 'aid568g3mXgtID0X1SLH',
          gracePeriod: {
            'id': 'gpe4hiasrPJX4zwZY789',
            'expiry': '2023-12-31T05:00:00.000Z'
          },
          allowedFor: 'any',
        },
        authenticatorKey: 'phone_number',
      },
      {
        label: 'Security Key or Biometric Authenticator',
        value: {
          id: 'aidtheidkwh282hv8g3',
        },
        relatesTo: {
          displayName: 'Security Key or Biometric Authenticator (FIDO2)',
          type: 'security_key',
          key: 'webauthn',
          id: 'webauthn-enroll-id-123',
          authenticatorId: 'aidtheidkwh282hv8g3',
          gracePeriod: {
            'id': 'gpe4hiasrPJX4zwZY789',
            'expiry': '2023-12-30T23:00:00.000Z'
          },
          allowedFor: 'any'
        },
        authenticatorKey: 'webauthn',
      },
    ];
    testContext.init(authenticators, true);
    expect(testContext.view.el).toMatchSnapshot();
    expect(testContext.view.$('.authenticator-list-title').length).toBe(1);
    expect(testContext.view.$('.authenticator-list-title').text()).toBe('Required soon');
    expect(testContext.view.$('.authenticator-row').length).toBe(2);
    expect(testContext.view.$('.authenticator-usage-text').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-text-container').length).toBe(2);
    expect(testContext.view.$('.authenticator-grace-period-required-description').length).toBe(2);
    expect(testContext.view.$('.authenticator-grace-period-expiry-date').length).toBe(2);
    expect(testContext.view.$('.skip-all').length).toBe(1);
    expect(testContext.view.$('.skip-all').text()).toBe('Remind me later');
  });

  it('renders required now and required soon for expired and non-expired grace periods', function() {
    const authenticators = [
      {
        label: 'Okta Phone',
        value: {
          id: 'aid568g3mXgtID0X1SLH',
        },
        relatesTo: {
          label: 'Okta Phone',
          id: 'phone-enroll-id-123',
          type: 'phone',
          key: 'phone_number',
          authenticatorId: 'aid568g3mXgtID0X1SLH',
          gracePeriod: {
            'id': 'gpe4hiasrPJX4zwZY789',
            'expiry': '2020-12-17T05:00:00.000Z'
          },
          allowedFor: 'any',
        },
        authenticatorKey: 'phone_number',
      },
      {
        label: 'Security Key or Biometric Authenticator',
        value: {
          id: 'aidtheidkwh282hv8g3',
        },
        relatesTo: {
          displayName: 'Security Key or Biometric Authenticator (FIDO2)',
          type: 'security_key',
          key: 'webauthn',
          id: 'webauthn-enroll-id-123',
          authenticatorId: 'aidtheidkwh282hv8g3',
          gracePeriod: {
            'id': 'gpe4hiasrPJX4zwZY789',
            'expiry': '2025-12-17T05:00:00.000Z'
          },
          allowedFor: 'any'
        },
        authenticatorKey: 'webauthn',
      },
    ];
    testContext.init(authenticators, false);
    expect(testContext.view.el).toMatchSnapshot();
    expect(testContext.view.$('.authenticator-list-title').length).toBe(2);
    expect(testContext.view.$('.authenticator-list-title')[0].textContent).toBe('Required now');
    expect(testContext.view.$('.authenticator-list-title')[1].textContent).toBe('Required soon');
    expect(testContext.view.$('.authenticator-row').length).toBe(2);
    expect(testContext.view.$('.authenticator-usage-text').length).toBe(1);
    expect(testContext.view.$('.authenticator-grace-period-text-container').length).toBe(1);
    expect(testContext.view.$('.authenticator-grace-period-required-description').length).toBe(1);
    expect(testContext.view.$('.authenticator-grace-period-expiry-date').length).toBe(1);
    expect(testContext.view.$('.skip-all').length).toBe(0);
  });

  it('renders required now list for no grace periods', function() {
    const authenticators = [
      {
        label: 'Okta Phone',
        value: {
          id: 'aid568g3mXgtID0X1SLH',
        },
        relatesTo: {
          label: 'Okta Phone',
          id: 'phone-enroll-id-123',
          type: 'phone',
          key: 'phone_number',
          authenticatorId: 'aid568g3mXgtID0X1SLH',
          allowedFor: 'any',
        },
        authenticatorKey: 'phone_number',
      },
      {
        label: 'Security Key or Biometric Authenticator',
        value: {
          id: 'aidtheidkwh282hv8g3',
        },
        relatesTo: {
          displayName: 'Security Key or Biometric Authenticator (FIDO2)',
          type: 'security_key',
          key: 'webauthn',
          id: 'webauthn-enroll-id-123',
          authenticatorId: 'aidtheidkwh282hv8g3',
          allowedFor: 'any'
        },
        authenticatorKey: 'webauthn',
      },
    ];
    testContext.init(authenticators, false);
    expect(testContext.view.el).toMatchSnapshot();
    expect(testContext.view.$('.authenticator-list-title').length).toBe(1);
    expect(testContext.view.$('.authenticator-list-title')[0].textContent).toBe('Required now');
    expect(testContext.view.$('.authenticator-row').length).toBe(2);
    expect(testContext.view.$('.authenticator-usage-text').length).toBe(2);
    expect(testContext.view.$('.authenticator-grace-period-text-container').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-required-description').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-expiry-date').length).toBe(0);
    expect(testContext.view.$('.skip-all').length).toBe(0);
  });

  it('renders required now list for badly formatted grace period dates', function() {
    const authenticators = [
      {
        label: 'Okta Phone',
        value: {
          id: 'aid568g3mXgtID0X1SLH',
        },
        relatesTo: {
          label: 'Okta Phone',
          id: 'phone-enroll-id-123',
          type: 'phone',
          key: 'phone_number',
          authenticatorId: 'aid568g3mXgtID0X1SLH',
          gracePeriod: {
            'id': 'gpe4hiasrPJX4zwZY789',
            'expiry': 'aksjdfhkawef'
          },
          allowedFor: 'any',
        },
        authenticatorKey: 'phone_number',
      },
      {
        label: 'Security Key or Biometric Authenticator',
        value: {
          id: 'aidtheidkwh282hv8g3',
        },
        relatesTo: {
          displayName: 'Security Key or Biometric Authenticator (FIDO2)',
          type: 'security_key',
          key: 'webauthn',
          id: 'webauthn-enroll-id-123',
          authenticatorId: 'aidtheidkwh282hv8g3',
          gracePeriod: {
            'id': 'gpe4hiasrPJX4zwZY789',
            'expiry': ''
          },
          allowedFor: 'any'
        },
        authenticatorKey: 'webauthn',
      },
    ];
    testContext.init(authenticators, false);
    expect(testContext.view.el).toMatchSnapshot();
    expect(testContext.view.$('.authenticator-list-title').length).toBe(1);
    expect(testContext.view.$('.authenticator-list-title')[0].textContent).toBe('Required now');
    expect(testContext.view.$('.authenticator-row').length).toBe(2);
    expect(testContext.view.$('.authenticator-usage-text').length).toBe(2);
    expect(testContext.view.$('.authenticator-grace-period-text-container').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-required-description').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-expiry-date').length).toBe(0);
    expect(testContext.view.$('.skip-all').length).toBe(0);
  });

  it('renders optional authenticators', function() {
    const authenticators = [
      {
        label: 'Okta Phone',
        value: {
          id: 'aid568g3mXgtID0X1SLH',
        },
        relatesTo: {
          label: 'Okta Phone',
          id: 'phone-enroll-id-123',
          type: 'phone',
          key: 'phone_number',
          authenticatorId: 'aid568g3mXgtID0X1SLH',
          allowedFor: 'any',
        },
        authenticatorKey: 'phone_number',
      },
      {
        label: 'Security Key or Biometric Authenticator',
        value: {
          id: 'aidtheidkwh282hv8g3',
        },
        relatesTo: {
          displayName: 'Security Key or Biometric Authenticator (FIDO2)',
          type: 'security_key',
          key: 'webauthn',
          id: 'webauthn-enroll-id-123',
          authenticatorId: 'aidtheidkwh282hv8g3',
          allowedFor: 'any'
        },
        authenticatorKey: 'webauthn',
      },
    ];
    testContext.init(authenticators, true);
    expect(testContext.view.el).toMatchSnapshot();
    expect(testContext.view.$('.authenticator-list-title').length).toBe(1);
    expect(testContext.view.$('.authenticator-list-title')[0].textContent).toBe('Optional');
    expect(testContext.view.$('.authenticator-row').length).toBe(2);
    expect(testContext.view.$('.authenticator-usage-text').length).toBe(2);
    expect(testContext.view.$('.authenticator-grace-period-text-container').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-required-description').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-expiry-date').length).toBe(0);
    expect(testContext.view.$('.skip-all').length).toBe(1);
    expect(testContext.view.$('.skip-all').text()).toBe('Continue');
  });
});
