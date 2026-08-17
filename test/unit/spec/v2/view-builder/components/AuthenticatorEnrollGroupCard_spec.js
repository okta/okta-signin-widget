import { Collection } from '@okta/courage';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import AuthenticatorEnrollGroupCard from 'v2/view-builder/components/AuthenticatorEnrollGroupCard';
import authenticatorEnrollResponse from '../../../../../../playground/mocks/data/idp/idx/authenticator-enroll-grace-period.json';

describe('v2/view-builder/components/AuthenticatorEnrollGroupCard', function() {
  let testContext;

  const buildMembers = () => ([
    {
      label: 'Email',
      value: { id: 'aut-email' },
      relatesTo: { key: 'okta_email', id: 'email-enroll', authenticatorId: 'aut-email', groupIds: ['arg-recovery'], allowedFor: 'any' },
      authenticatorKey: 'okta_email',
      groupIds: ['arg-recovery'],
    },
    {
      label: 'Phone',
      value: { id: 'aut-phone' },
      relatesTo: { key: 'phone_number', id: 'phone-enroll', authenticatorId: 'aut-phone', groupIds: ['arg-recovery'], allowedFor: 'any' },
      authenticatorKey: 'phone_number',
      groupIds: ['arg-recovery'],
    },
  ]);

  beforeEach(function() {
    testContext = {};
    testContext.init = (group, members, groupIndex = 0) => {
      const appState = new AppState({}, {});
      appState.set('user', authenticatorEnrollResponse.user.value);
      appState.set('idx', { neededToProceed: [] });
      const settings = new Settings({ baseUrl: 'http://localhost:3000' });
      jest.spyOn(Date, 'now').mockReturnValue(new Date('12/30/2023').getTime());
      jest.spyOn(appState, 'hasRemediationObject').mockReturnValue(false);

      testContext.view = new AuthenticatorEnrollGroupCard({
        appState,
        settings,
        collection: new Collection(members),
        optionItems: members,
        name: 'authenticator',
        group,
        members,
        groupIndex,
      });
      testContext.view.render();
    };
  });

  it('renders the card wrapper with a positional data-se attribute', function() {
    testContext.init(
      { groupId: 'arg-recovery', remaining: 1, criteria: [{ type: 'authenticatorCount', count: 1 }] },
      buildMembers(),
      0,
    );
    expect(testContext.view.el.getAttribute('data-se')).toBe('authenticator-enroll-group-0');
    expect(testContext.view.el.classList.contains('authenticator-enroll-group-card')).toBe(true);
  });

  it('uses the groupIndex option verbatim, never leaking groupId', function() {
    testContext.init(
      { groupId: 'arg-recovery-with-a-really-long-id', remaining: 1 },
      buildMembers(),
      3,
    );
    expect(testContext.view.el.getAttribute('data-se')).toBe('authenticator-enroll-group-3');
    // groupId must never appear in the rendered DOM.
    expect(testContext.view.el.outerHTML.includes('arg-recovery-with-a-really-long-id')).toBe(false);
  });

  it('exposes role=group and aria-labelledby pointing at the per-card label id', function() {
    // Regions with identical member buttons (e.g. Okta Verify in two overlapping
    // groups) must remain distinguishable for AT users — the "Choose N of" chip
    // is the region name via aria-labelledby.
    testContext.init(
      { groupId: 'arg-recovery', remaining: 1 },
      buildMembers(),
      2,
    );
    expect(testContext.view.el.getAttribute('role')).toBe('group');
    expect(testContext.view.el.getAttribute('aria-labelledby')).toBe('authenticator-enroll-group-2-label');
    // The referenced id exists inside the card.
    expect(testContext.view.$('#authenticator-enroll-group-2-label').length).toBe(1);
  });

  it('renders "Choose {remaining} of:" label using group.remaining, not criteria.count', function() {
    // Contract: N reflects transaction-remaining, not the static criteria threshold.
    testContext.init(
      {
        groupId: 'arg-recovery',
        remaining: 2,
        criteria: [{ type: 'authenticatorCount', count: 5 }],
      },
      buildMembers(),
    );
    expect(testContext.view.$('[data-se="authenticator-enroll-group-card-label"]').text().trim())
      .toBe('Choose 2 of:');
  });

  it('renders BY_DATE_TIME group grace period at the top of the card', function() {
    testContext.init(
      {
        groupId: 'arg-recovery',
        remaining: 1,
        gracePeriod: { type: 'BY_DATE_TIME', expiry: '2024-01-06T00:00:00.000Z' }, // ~7 days after mocked Date.now
      },
      buildMembers(),
    );
    expect(testContext.view.$('.authenticator-grace-period-required-description').length).toBe(1);
    expect(testContext.view.$('.authenticator-grace-period-required-description').text()).toContain('7 days');
    expect(testContext.view.$('.authenticator-grace-period-expiry-date').length).toBe(1);
  });

  it('renders BY_SKIP_COUNT group grace period as "N skips remaining"', function() {
    testContext.init(
      {
        groupId: 'arg-recovery',
        remaining: 1,
        gracePeriod: { type: 'BY_SKIP_COUNT', skipCount: 3, remainingSkips: 3 },
      },
      buildMembers(),
    );
    expect(testContext.view.$('.authenticator-grace-period-skip-count-description').text()).toBe('3 skips remaining');
  });

  it('renders BY_SKIP_COUNT with remainingSkips=1 in the singular form', function() {
    testContext.init(
      {
        groupId: 'arg-recovery',
        remaining: 1,
        gracePeriod: { type: 'BY_SKIP_COUNT', skipCount: 3, remainingSkips: 1 },
      },
      buildMembers(),
    );
    expect(testContext.view.$('.authenticator-grace-period-skip-count-description').text()).toBe('1 skip remaining');
  });

  it('renders skip-count grace period when type is BY_DATE_TIME but expiry has lapsed (fall-through)', function() {
    // BY_DATE_TIME expiry in the past + active remainingSkips: hasActiveGroupGracePeriod returns
    // true (via remainingSkips), so _getGroupGracePeriodData must also surface the skip count.
    testContext.init(
      {
        groupId: 'arg-recovery',
        remaining: 1,
        gracePeriod: { type: 'BY_DATE_TIME', expiry: '2020-01-01T00:00:00.000Z', remainingSkips: 2 },
      },
      buildMembers(),
    );
    expect(testContext.view.$('.authenticator-grace-period-skip-count-description').text()).toBe('2 skips remaining');
    expect(testContext.view.$('.authenticator-grace-period-required-description').length).toBe(0);
  });

  it('omits the grace-period block when the group has no gracePeriod', function() {
    testContext.init(
      { groupId: 'arg-recovery', remaining: 1 },
      buildMembers(),
    );
    expect(testContext.view.$('.authenticator-grace-period-text-container').length).toBe(0);
    expect(testContext.view.$('.authenticator-grace-period-required-icon').length).toBe(0);
  });

  it('hosts member rows inside the card without a section title', function() {
    testContext.init(
      { groupId: 'arg-recovery', remaining: 1 },
      buildMembers(),
    );
    // Two member rows.
    expect(testContext.view.$('.authenticator-row').length).toBe(2);
    // No section title inside a card — the card supplies its own "Choose N of:" label.
    expect(testContext.view.$('.authenticator-list-title').length).toBe(0);
  });
});
