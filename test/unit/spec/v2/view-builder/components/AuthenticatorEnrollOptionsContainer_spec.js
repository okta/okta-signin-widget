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
      settingsOptions = {},
      authenticatorGroups,
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
      if (authenticatorGroups) {
        appState.set('authenticatorGroups', authenticatorGroups);
      }

      const settings = new Settings({ baseUrl: 'http://localhost:3000', ...settingsOptions });

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

  it.each([true, false])('renders required now list for all inactive grace periods', function(useRemainingSkips) {
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
            ...(useRemainingSkips ? {
              'remainingSkips': 0,
            } : {
              'expiry': '2019-12-17T05:00:00.000Z'
            }),
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
            ...(useRemainingSkips ? {
              'remainingSkips': 0,
            } : {
              'expiry': '2019-12-17T05:00:00.000Z'
            }),
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
    expect(testContext.view.$('.authenticator-list-subtitle').length).toBe(0);
    expect(testContext.view.$('.authenticator-row').length).toBe(2);
    expect(testContext.view.$('.authenticator-usage-text').length).toBe(2);
    expect(testContext.view.$('.authenticator-grace-period-text-container').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-required-description').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-expiry-date').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-skip-count-description').length).toBe(0);
    expect(testContext.view.$('.skip-all').length).toBe(0);
  });

  it.each([true, false])('renders required soon list for all active grace periods', function(useRemainingSkips) {
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
            ...(useRemainingSkips ? {
              'remainingSkips': 3,
            } : {
              'expiry': '2023-12-31T05:00:00.000Z'
            }),
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
            ...(useRemainingSkips ? {
              'remainingSkips': 1,
            } : {
              'expiry': '2023-12-30T23:00:00.000Z'
            }),
          },
          allowedFor: 'any'
        },
        authenticatorKey: 'webauthn',
      },
    ];
    const settings = {
      'helpLinks.gracePeriodRequiredSoon.text': 'custom grace period link',
      'helpLinks.gracePeriodRequiredSoon.href': 'https://acme.com/grace-period-info',
    };
    testContext.init(authenticators, true, settings);
    expect(testContext.view.el).toMatchSnapshot();
    expect(testContext.view.$('.authenticator-list-title').length).toBe(1);
    expect(testContext.view.$('.authenticator-list-title').text()).toBe('Required soon');
    expect(testContext.view.$('.authenticator-list-subtitle').length).toBe(1);
    expect(testContext.view.$('.authenticator-list-subtitle-link-container').length).toBe(1);
    expect(testContext.view.$('.authenticator-list-subtitle-link-container a').text()).toBe('custom grace period link');
    expect(testContext.view.$('.authenticator-row').length).toBe(2);
    expect(testContext.view.$('.authenticator-usage-text').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-text-container').length).toBe(2);
    if (useRemainingSkips) {
      expect(testContext.view.$('.authenticator-grace-period-skip-count-description').length).toBe(2);
    } else {
      expect(testContext.view.$('.authenticator-grace-period-required-description').length).toBe(2);
      expect(testContext.view.$('.authenticator-grace-period-expiry-date').length).toBe(2);
    }
    expect(testContext.view.$('.skip-all').length).toBe(1);
    expect(testContext.view.$('.skip-all').text()).toBe('Remind me later');
  });

  it.each([true, false])('renders required now and required soon for active and inactive grace periods', function(useRemainingSkips) {
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
            ...(useRemainingSkips ? {
              'remainingSkips': 0,
            } : {
              'expiry': '2020-12-17T05:00:00.000Z'
            }),
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
            ...(useRemainingSkips ? {
              'remainingSkips': 9,
            } : {
              'expiry': '2025-12-17T05:00:00.000Z'
            }),
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
    expect(testContext.view.$('.authenticator-list-subtitle').length).toBe(1);
    expect(testContext.view.$('.authenticator-list-subtitle-link-container').length).toBe(0);
    expect(testContext.view.$('.authenticator-row').length).toBe(2);
    expect(testContext.view.$('.authenticator-usage-text').length).toBe(1);
    expect(testContext.view.$('.authenticator-grace-period-text-container').length).toBe(1);
    if (useRemainingSkips) {
      expect(testContext.view.$('.authenticator-grace-period-skip-count-description').length).toBe(1);
    } else {
      expect(testContext.view.$('.authenticator-grace-period-required-description').length).toBe(1);
      expect(testContext.view.$('.authenticator-grace-period-expiry-date').length).toBe(1);
    }
    expect(testContext.view.$('.skip-all').length).toBe(0);
  });

  it.each([true, false])('renders required now list for all inactive grace periods', function(useRemainingSkips) {
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
            ...(useRemainingSkips ? {
              'remainingSkips': 0,
            } : {
              'expiry': '2019-12-17T05:00:00.000Z'
            }),
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
            ...(useRemainingSkips ? {
              'remainingSkips': 0,
            } : {
              'expiry': '2019-12-17T05:00:00.000Z'
            }),
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
    expect(testContext.view.$('.authenticator-list-subtitle').length).toBe(0);
    expect(testContext.view.$('.authenticator-row').length).toBe(2);
    expect(testContext.view.$('.authenticator-usage-text').length).toBe(2);
    expect(testContext.view.$('.authenticator-grace-period-text-container').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-required-description').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-expiry-date').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-skip-count-description').length).toBe(0);
    expect(testContext.view.$('.skip-all').length).toBe(0);
  });

  it('renders required soon list for all remaining skips and expiry date grace periods', function() {
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
            'remainingSkips': 3,
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
    const settings = {
      'helpLinks.gracePeriodRequiredSoon.text': 'custom grace period link',
      'helpLinks.gracePeriodRequiredSoon.href': 'https://acme.com/grace-period-info',
    };
    testContext.init(authenticators, true, settings);
    expect(testContext.view.el).toMatchSnapshot();
    expect(testContext.view.$('.authenticator-list-title').length).toBe(1);
    expect(testContext.view.$('.authenticator-list-title').text()).toBe('Required soon');
    expect(testContext.view.$('.authenticator-list-subtitle').length).toBe(1);
    expect(testContext.view.$('.authenticator-list-subtitle-link-container').length).toBe(1);
    expect(testContext.view.$('.authenticator-list-subtitle-link-container a').text()).toBe('custom grace period link');
    expect(testContext.view.$('.authenticator-row').length).toBe(2);
    expect(testContext.view.$('.authenticator-usage-text').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-text-container').length).toBe(2);
    expect(testContext.view.$('.authenticator-grace-period-required-description').length).toBe(1);
    expect(testContext.view.$('.authenticator-grace-period-expiry-date').length).toBe(1);
    expect(testContext.view.$('.authenticator-grace-period-skip-count-description').length).toBe(1);
    expect(testContext.view.$('.skip-all').length).toBe(1);
    expect(testContext.view.$('.skip-all').text()).toBe('Remind me later');
  });

  it('renders required now and required soon for remaining skips and expiry date grace periods', function() {
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
            'remainingSkips': 0,
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
    expect(testContext.view.$('.authenticator-list-subtitle').length).toBe(1);
    expect(testContext.view.$('.authenticator-list-subtitle-link-container').length).toBe(0);
    expect(testContext.view.$('.authenticator-row').length).toBe(2);
    expect(testContext.view.$('.authenticator-usage-text').length).toBe(1);
    expect(testContext.view.$('.authenticator-grace-period-text-container').length).toBe(1);
    expect(testContext.view.$('.authenticator-grace-period-required-description').length).toBe(1);
    expect(testContext.view.$('.authenticator-grace-period-expiry-date').length).toBe(1);
    expect(testContext.view.$('.authenticator-grace-period-skip-count-description').length).toBe(0);
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
    expect(testContext.view.$('.authenticator-list-subtitle').length).toBe(0);
    expect(testContext.view.$('.authenticator-row').length).toBe(2);
    expect(testContext.view.$('.authenticator-usage-text').length).toBe(2);
    expect(testContext.view.$('.authenticator-grace-period-text-container').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-required-description').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-expiry-date').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-skip-count-description').length).toBe(0);
    expect(testContext.view.$('.skip-all').length).toBe(0);
  });

  it.each([true, false])('renders required now list for badly formatted grace period values', function(useRemainingSkips) {
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
            ...(useRemainingSkips ? {
              'remainingSkips': 'aksjdfhkawef',
            } : {
              'expiry': 'aksjdfhkawef',
            }),
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
            ...(useRemainingSkips ? {
              'remainingSkips': -9.23,
            } : {
              'expiry': ''
            }),
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
    expect(testContext.view.$('.authenticator-list-subtitle').length).toBe(0);
    expect(testContext.view.$('.authenticator-row').length).toBe(2);
    expect(testContext.view.$('.authenticator-usage-text').length).toBe(2);
    expect(testContext.view.$('.authenticator-grace-period-text-container').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-required-description').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-expiry-date').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-skip-count-description').length).toBe(0);
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
    expect(testContext.view.$('.authenticator-list-subtitle').length).toBe(0);
    expect(testContext.view.$('.authenticator-row').length).toBe(2);
    expect(testContext.view.$('.authenticator-usage-text').length).toBe(2);
    expect(testContext.view.$('.authenticator-grace-period-text-container').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-required-description').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-expiry-date').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-skip-count-description').length).toBe(0);
    expect(testContext.view.$('.skip-all').length).toBe(1);
    expect(testContext.view.$('.skip-all').text()).toBe('Continue');
  });

  // ---------------------------------------------------------------------------
  // N-of-M authenticator groups — new behavior gated on
  // appState.authenticatorGroups[] containing at least one entry with
  // remaining > 0. Legacy responses (empty/absent groups, or all satisfied) take
  // the pre-existing path above and must not change.
  // ---------------------------------------------------------------------------
  describe('N-of-M authenticator groups', function() {
    const groupMemberOptions = (groupIds) => ([
      {
        label: 'Email',
        value: { id: 'aut-email' },
        relatesTo: { key: 'okta_email', id: 'email-enroll', authenticatorId: 'aut-email', groupIds, allowedFor: 'any' },
        authenticatorKey: 'okta_email',
        groupIds,
      },
      {
        label: 'Phone',
        value: { id: 'aut-phone' },
        relatesTo: { key: 'phone_number', id: 'phone-enroll', authenticatorId: 'aut-phone', groupIds, allowedFor: 'any' },
        authenticatorKey: 'phone_number',
        groupIds,
      },
      {
        label: 'Security Question',
        value: { id: 'aut-sq' },
        relatesTo: { key: 'security_question', id: 'sq-enroll', authenticatorId: 'aut-sq', groupIds, allowedFor: 'any' },
        authenticatorKey: 'security_question',
        groupIds,
      },
    ]);

    it('renders one group card with "Choose 1 of:" label for a required 1-of-3 group', function() {
      const authenticators = groupMemberOptions(['arg-recovery']);
      const groups = [{
        groupId: 'arg-recovery',
        status: 'REQUIRED',
        criteria: [{ type: 'authenticatorCount', count: 1 }],
        remaining: 1,
      }];
      testContext.init(authenticators, false, {}, groups);

      expect(testContext.view.$('.authenticator-enroll-group-card').length).toBe(1);
      expect(testContext.view.$('.authenticator-enroll-group-card').attr('data-se'))
        .toBe('authenticator-enroll-group-0');
      expect(testContext.view.$('[data-se="authenticator-enroll-group-card-label"]').text().trim())
        .toBe('Choose 1 of:');
      expect(testContext.view.$('.authenticator-enroll-group-card .authenticator-row').length).toBe(3);
      // Section title still says "Required now" (no group-level grace period).
      expect(testContext.view.$('.authenticator-list-title').text()).toBe('Required now');
      // No skip button (no grace period → backend won't emit skip).
      expect(testContext.view.$('.skip-all').length).toBe(0);
    });

    it('renders two group cards with unique data-se indices when two active groups are present', function() {
      const groupIdsA = ['arg-recovery'];
      const groupIdsB = ['arg-strong'];
      const authenticators = [
        ...groupMemberOptions(groupIdsA),
        {
          label: 'Okta Verify',
          value: { id: 'aut-ov' },
          relatesTo: { key: 'okta_verify', id: 'ov-enroll', authenticatorId: 'aut-ov', groupIds: groupIdsB, allowedFor: 'any' },
          authenticatorKey: 'okta_verify',
          groupIds: groupIdsB,
        },
        {
          label: 'Security Key or Biometric',
          value: { id: 'aut-webauthn' },
          relatesTo: { key: 'webauthn', id: 'webauthn-enroll', authenticatorId: 'aut-webauthn', groupIds: groupIdsB, allowedFor: 'any' },
          authenticatorKey: 'webauthn',
          groupIds: groupIdsB,
        },
      ];
      const groups = [
        { groupId: 'arg-recovery', status: 'REQUIRED', criteria: [{ type: 'authenticatorCount', count: 1 }], remaining: 1 },
        { groupId: 'arg-strong',   status: 'REQUIRED', criteria: [{ type: 'authenticatorCount', count: 1 }], remaining: 1 },
      ];
      testContext.init(authenticators, false, {}, groups);

      const cards = testContext.view.$('.authenticator-enroll-group-card');
      expect(cards.length).toBe(2);
      expect(cards.eq(0).attr('data-se')).toBe('authenticator-enroll-group-0');
      expect(cards.eq(1).attr('data-se')).toBe('authenticator-enroll-group-1');
    });

    it('renders a group-of-1 as a bare authenticator row (no card wrapper)', function() {
      const authenticators = [{
        label: 'Password',
        value: { id: 'aut-pw' },
        relatesTo: { key: 'okta_password', id: 'pw-enroll', authenticatorId: 'aut-pw', groupIds: ['arg-required-pw'], allowedFor: 'any' },
        authenticatorKey: 'okta_password',
        groupIds: ['arg-required-pw'],
      }];
      const groups = [{
        groupId: 'arg-required-pw',
        status: 'REQUIRED',
        criteria: [{ type: 'authenticatorCount', count: 1 }],
        remaining: 1,
      }];
      testContext.init(authenticators, false, {}, groups);

      expect(testContext.view.$('.authenticator-enroll-group-card').length).toBe(0);
      expect(testContext.view.$('.authenticator-row').length).toBe(1);
    });

    it('renders group-level grace-period text inside the card and places it in "Required soon"', function() {
      const authenticators = groupMemberOptions(['arg-recovery']);
      const groups = [{
        groupId: 'arg-recovery',
        status: 'REQUIRED',
        criteria: [{ type: 'authenticatorCount', count: 1 }],
        remaining: 1,
        gracePeriod: { type: 'BY_DATE_TIME', expiry: '2024-01-06T00:00:00.000Z' }, // ~7 days after mocked Date.now
      }];
      testContext.init(authenticators, true, {}, groups);

      expect(testContext.view.$('.authenticator-enroll-group-card').length).toBe(1);
      expect(testContext.view.$('.authenticator-enroll-group-card .authenticator-grace-period-required-description').length).toBe(1);
      // Section title switches to "Required soon" since the group carries a GP.
      const sectionTitles = testContext.view.$('.authenticator-list-title');
      expect(sectionTitles.length).toBeGreaterThanOrEqual(1);
      expect(sectionTitles.last().text()).toBe('Required soon');
      // Skip remediation present + group has GP → RemindMeLater rendered.
      expect(testContext.view.$('.skip-all').text()).toBe('Remind me later');
    });

    it('renders BY_SKIP_COUNT group grace period as "N skips remaining"', function() {
      const authenticators = groupMemberOptions(['arg-recovery']);
      const groups = [{
        groupId: 'arg-recovery',
        status: 'REQUIRED',
        criteria: [{ type: 'authenticatorCount', count: 1 }],
        remaining: 1,
        gracePeriod: { type: 'BY_SKIP_COUNT', skipCount: 3, remainingSkips: 3 },
      }];
      testContext.init(authenticators, true, {}, groups);

      expect(testContext.view.$('.authenticator-enroll-group-card .authenticator-grace-period-skip-count-description').length).toBe(1);
      expect(testContext.view.$('.authenticator-enroll-group-card .authenticator-grace-period-skip-count-description').text()).toBe('3 skips remaining');
    });

    it('suppresses per-row grace period on members inside a card (group GP wins)', function() {
      const authenticators = groupMemberOptions(['arg-recovery']).map(opt => ({
        ...opt,
        relatesTo: {
          ...opt.relatesTo,
          // Simulate a stale per-authenticator gracePeriod on the wire — should
          // NOT render because the group GP takes precedence inside a card.
          gracePeriod: { type: 'BY_SKIP_COUNT', remainingSkips: 42 },
        },
      }));
      const groups = [{
        groupId: 'arg-recovery',
        status: 'REQUIRED',
        criteria: [{ type: 'authenticatorCount', count: 1 }],
        remaining: 1,
        gracePeriod: { type: 'BY_SKIP_COUNT', skipCount: 3, remainingSkips: 3 },
      }];
      testContext.init(authenticators, true, {}, groups);

      // Card-level skip count present; per-row skip counts suppressed.
      expect(testContext.view.$('.authenticator-enroll-group-card .authenticator-grace-period-skip-count-description').length).toBe(1);
      const rowSkipTexts = testContext.view.$('.authenticator-row .authenticator-grace-period-skip-count-description');
      expect(rowSkipTexts.length).toBe(0);
    });

    it('falls back to the legacy path when every group is satisfied (remaining === 0)', function() {
      // Optional-phase: single group, remaining=0. Ungrouped Password should
      // appear as bare individual (legacy path handles this because
      // hasActiveGroup is false).
      const authenticators = [{
        label: 'Okta Password',
        value: { id: 'aut-pw' },
        relatesTo: { key: 'okta_password', id: 'pw-enroll', authenticatorId: 'aut-pw', groupIds: [], allowedFor: 'any' },
        authenticatorKey: 'okta_password',
        groupIds: [],
      }];
      const groups = [{
        groupId: 'arg-recovery',
        status: 'REQUIRED',
        criteria: [{ type: 'authenticatorCount', count: 1 }],
        remaining: 0,
      }];
      testContext.init(authenticators, true, {}, groups);

      // No card at all.
      expect(testContext.view.$('.authenticator-enroll-group-card').length).toBe(0);
      // Bare Password row rendered.
      expect(testContext.view.$('.authenticator-row').length).toBe(1);
    });
  });
});
