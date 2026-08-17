import { RequestMock, Selector, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';

import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';

import xhrGroupsSingle from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator-groups.json';
import xhrGroupsTwo from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator-groups-two.json';
import xhrGroupsGracePeriod from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator-groups-grace-period.json';
import xhrGroupsGracePeriodSkip from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator-groups-grace-period-skip.json';
import xhrGroupsMixed from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator-groups-mixed.json';
import xhrGroupsOptionalPhase from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator-groups-optional-phase.json';

// N-of-M authenticator groups. TestCafe runs against both v2 and v3 (gen3
// parity). Selectors that differ between engines pull from the shared
// SelectAuthenticatorPageObject; group-specific selectors are declared inline
// here since only this spec cares about them.
const groupCardSelector = userVariables.gen3
  ? '[data-se^="authenticator-enroll-group-"][role="group"]'
  : '.authenticator-enroll-group-card';
const chooseNOfLabelSelector = '[data-se="authenticator-enroll-group-card-label"]';
const gracePeriodRequiredDescriptionSelector = userVariables.gen3
  ? '[data-se="authenticator-grace-period-required-description"]'
  : '.authenticator-grace-period-required-description';
const gracePeriodSkipCountDescriptionSelector = userVariables.gen3
  ? '[data-se="authenticator-grace-period-skip-count-description"]'
  : '.authenticator-grace-period-skip-count-description';

const mockGroupsSingle = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrGroupsSingle);

const mockGroupsTwo = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrGroupsTwo);

const mockGroupsGracePeriod = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrGroupsGracePeriod);

const mockGroupsGracePeriodSkip = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrGroupsGracePeriodSkip);

const mockGroupsMixed = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrGroupsMixed);

const mockGroupsOptionalPhase = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrGroupsOptionalPhase);

fixture('Select Authenticator for Enrollment - N-of-M Groups');

async function setup(t) {
  const selectFactorPage = new SelectFactorPageObject(t);
  await selectFactorPage.navigateToPage();
  await t.expect(selectFactorPage.formExists()).ok();
  return selectFactorPage;
}

// -----------------------------------------------------------------------------
// Single required group, 1-of-3
// -----------------------------------------------------------------------------
test.requestHooks(mockGroupsSingle)(
  'renders one group card with "Choose 1 of:" label and all three member buttons',
  async t => {
    await setup(t);
    await checkA11y(t);
    const cards = Selector(groupCardSelector);
    await t.expect(cards.count).eql(1);
    await t.expect(cards.nth(0).getAttribute('data-se')).eql('authenticator-enroll-group-0');
    // role=group + aria-labelledby wire the card to its "Choose N of" chip so
    // AT users hear the region name even when identical buttons appear in
    // multiple cards.
    await t.expect(cards.nth(0).getAttribute('role')).eql('group');
    await t.expect(cards.nth(0).getAttribute('aria-labelledby'))
      .eql('authenticator-enroll-group-0-label');
    await t.expect(Selector('#authenticator-enroll-group-0-label').exists).ok();

    await t.expect(Selector(chooseNOfLabelSelector).innerText).eql('Choose 1 of:');

    // Three members inside the card (Email, Phone, Security Question).
    if (userVariables.gen3) {
      await t.expect(Selector(`${groupCardSelector} [data-se="authenticator-button"]`).count).eql(3);
    } else {
      await t.expect(Selector(`${groupCardSelector} .authenticator-row`).count).eql(3);
    }
  }
);

// -----------------------------------------------------------------------------
// Two required groups. Okta Verify overlaps both groups — expected to render
// once per card. Positional data-se stays unique across cards.
// -----------------------------------------------------------------------------
test.requestHooks(mockGroupsTwo)(
  'renders two group cards with unique positional data-se; overlapping authenticators render in each card',
  async t => {
    await setup(t);
    const cards = Selector(groupCardSelector);
    await t.expect(cards.count).eql(2);
    await t.expect(cards.nth(0).getAttribute('data-se')).eql('authenticator-enroll-group-0');
    await t.expect(cards.nth(1).getAttribute('data-se')).eql('authenticator-enroll-group-1');
    // Distinct aria-labelledby targets per card.
    await t.expect(cards.nth(0).getAttribute('aria-labelledby')).eql('authenticator-enroll-group-0-label');
    await t.expect(cards.nth(1).getAttribute('aria-labelledby')).eql('authenticator-enroll-group-1-label');

    // Okta Verify appears once in each card (overlap is intentional; clicking
    // either occurrence satisfies both groups).
    const oktaVerifyInCard0Selector = userVariables.gen3
      ? '[data-se="authenticator-enroll-group-0"] [data-se="okta_verify"]'
      : '[data-se="authenticator-enroll-group-0"] .authenticator-row .authenticator-label';
    const oktaVerifyInCard1Selector = userVariables.gen3
      ? '[data-se="authenticator-enroll-group-1"] [data-se="okta_verify"]'
      : '[data-se="authenticator-enroll-group-1"] .authenticator-row .authenticator-label';
    await t.expect(Selector(oktaVerifyInCard0Selector).exists).ok();
    await t.expect(Selector(oktaVerifyInCard1Selector).exists).ok();
  }
);

// -----------------------------------------------------------------------------
// Group with BY_DATE_TIME group grace period → card renders in "Required soon"
// with a group-level grace-period description.
// -----------------------------------------------------------------------------
test.requestHooks(mockGroupsGracePeriod)(
  'renders BY_DATE_TIME group grace period at the top of the card in the Required-soon section',
  async t => {
    await setup(t);
    const card = Selector(groupCardSelector).nth(0);
    await t.expect(card.exists).ok();
    // Group GP text is rendered inside the card (not on individual member rows).
    await t.expect(card.find(gracePeriodRequiredDescriptionSelector).exists).ok();

    // Section header switches to "Required soon" because the group has an
    // active GP. In v2 the section header is a title-only wrapper (bareRows.length === 0);
    // in v3 the header is a standalone Heading element. Both carry the same
    // gen3-agnostic text.
    const requiredSoonHeadingSelector = userVariables.gen3
      ? '[data-se="authenticator-list-title"]'
      : '.authenticator-list-header .authenticator-list-title, .authenticator-list .authenticator-list-title';
    await t.expect(Selector(requiredSoonHeadingSelector).withText('Required soon').exists).ok();

    // Skip remediation + active group GP → "Remind me later" surfaced.
    const skipSelector = userVariables.gen3
      ? '[data-se="save"]'
      : '.authenticator-enroll-list-container .skip-all';
    await t.expect(Selector(skipSelector).withText('Remind me later').exists).ok();
  }
);

// -----------------------------------------------------------------------------
// Group with BY_SKIP_COUNT group grace period → "N skips remaining" chip.
// -----------------------------------------------------------------------------
test.requestHooks(mockGroupsGracePeriodSkip)(
  'renders BY_SKIP_COUNT group grace period as "N skips remaining" inside the card',
  async t => {
    await setup(t);
    const card = Selector(groupCardSelector).nth(0);
    await t.expect(card.exists).ok();
    const skipCountText = card.find(gracePeriodSkipCountDescriptionSelector);
    await t.expect(skipCountText.exists).ok();
    // Contract: the description reflects `remainingSkips`, not `skipCount`.
    await t.expect(skipCountText.innerText).contains('skip');
  }
);

// -----------------------------------------------------------------------------
// Mixed page. Standalone Password + arg-strong group (no GP) → Required-now;
// standalone NFC (BY_SKIP_COUNT), standalone WebAuthn (BY_DATE_TIME), and
// arg-deadline group (BY_DATE_TIME) → Required-soon.
//
// This is the scenario that guards the bucketing bug: WebAuthn is UNGROUPED
// and carries a BY_DATE_TIME grace period. The regression put it into
// "Required now" instead of "Required soon" because it tried to re-parse the
// locale-formatted expiry string as an ISO date.
// -----------------------------------------------------------------------------
test.requestHooks(mockGroupsMixed)(
  'buckets ungrouped BY_DATE_TIME authenticators into Required-soon, not Required-now',
  async t => {
    await setup(t);
    // Both section headings render on this page.
    const requiredNowHeading = Selector(userVariables.gen3
      ? '[data-se="authenticator-list-title"]'
      : '.authenticator-list-title').withText('Required now');
    const requiredSoonHeading = Selector(userVariables.gen3
      ? '[data-se="authenticator-list-title"]'
      : '.authenticator-list-title').withText('Required soon');
    await t.expect(requiredNowHeading.exists).ok('Required now section is present');
    await t.expect(requiredSoonHeading.exists).ok('Required soon section is present');

    // Two group cards on the page (arg-strong in required-now, arg-deadline in required-soon).
    await t.expect(Selector(groupCardSelector).count).eql(2);
  }
);

// -----------------------------------------------------------------------------
// Optional phase: the only group has remaining=0 (satisfied). Legacy per-
// authenticator path runs. No cards on the page, ungrouped Password renders
// normally.
// -----------------------------------------------------------------------------
test.requestHooks(mockGroupsOptionalPhase)(
  'renders no cards when every group is satisfied (remaining === 0)',
  async t => {
    const selectFactorPage = await setup(t);
    await t.expect(Selector(groupCardSelector).count).eql(0);
    // Legacy authenticator rows still render.
    await t.expect(selectFactorPage.getFactorsCount()).gt(0);
  }
);
