import { RequestMock, userVariables } from 'testcafe';
import { within } from '@testing-library/testcafe';

import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';

import xhrSelectAuthenticatorsPhishingResistant from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator-phishing-resistant';
import xhrSelectAuthenticators from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator';

import xhrOktaVerifyMethodsPhishingResistant from '../../../playground/mocks/data/idp/idx/authenticator-verification-data-ov-phishing-resistant';
import xhrOktaVerifyMethodsNoFlag from '../../../playground/mocks/data/idp/idx/authenticator-verification-data-ov-only-without-device-known';
import xhrUnlockAccountPhishingResistant from '../../../playground/mocks/data/idp/idx/user-unlock-account-choose-auth-phishing-resistant';

const mockPhishingResistant = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsPhishingResistant);

const mockNoFlag = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators);

const mockOktaVerifyMethodsPhishingResistant = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrOktaVerifyMethodsPhishingResistant);

const mockOktaVerifyMethodsNoFlag = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrOktaVerifyMethodsNoFlag);

const mockUnlockAccountPhishingResistant = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrUnlockAccountPhishingResistant);

fixture('Select Authenticator for verification - phishing resistant first');

async function setup(t) {
  const selectFactorPage = new SelectFactorPageObject(t);
  await selectFactorPage.navigateToPage();
  await t.expect(selectFactorPage.formExists()).ok();
  return selectFactorPage;
}

// Gen2 renders a plain button; Gen3 renders the Odyssey accordion summary (also a button).
const getMoreOptionsToggle = (selectFactorPage) => userVariables.gen3
  ? within(selectFactorPage.form.el).queryByRole('button', { name: 'More options' })
  : selectFactorPage.form.getElement('[data-se="authenticator-more-options-toggle"]');

test.requestHooks(mockPhishingResistant)('lists phishing resistant methods first and collapses the rest', async t => {
  const selectFactorPage = await setup(t);
  const toggle = getMoreOptionsToggle(selectFactorPage);
  const passwordLabel = within(selectFactorPage.form.el).queryByText('Password');

  await t.expect(toggle.exists).ok();
  await t.expect(toggle.getAttribute('aria-expanded')).eql('false');
  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Security Key or Biometric Authenticator');
  // Methods that are not phishing resistant are hidden until the toggle is opened
  await t.expect(passwordLabel.visible).notOk();
});

test.requestHooks(mockPhishingResistant)('expands and collapses "More options"', async t => {
  const selectFactorPage = await setup(t);
  const toggle = getMoreOptionsToggle(selectFactorPage);
  const passwordLabel = within(selectFactorPage.form.el).queryByText('Password');

  await t.click(toggle);
  await t.expect(toggle.getAttribute('aria-expanded')).eql('true');
  await t.expect(passwordLabel.visible).ok();

  await t.click(toggle);
  await t.expect(toggle.getAttribute('aria-expanded')).eql('false');
  await t.expect(passwordLabel.visible).notOk();
});

test.requestHooks(mockNoFlag)('keeps a flat list when the backend sends no phishing resistant flag', async t => {
  const selectFactorPage = await setup(t);
  const toggle = getMoreOptionsToggle(selectFactorPage);

  await t.expect(toggle.exists).notOk();
  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Password');
});

test.requestHooks(mockOktaVerifyMethodsPhishingResistant)('Okta Verify method picker lists FastPass first and collapses push and TOTP', async t => {
  const selectFactorPage = await setup(t);
  const toggle = getMoreOptionsToggle(selectFactorPage);

  await t.expect(toggle.exists).ok();
  await t.expect(toggle.getAttribute('aria-expanded')).eql('false');
  await t.expect(selectFactorPage.getFactorLabelByIndex(0))
    .eql(userVariables.gen3 ? 'Okta Verify' : 'Use Okta FastPass');
  // Gen3 does not render collapsed buttons; v2 renders them hidden
  await t.expect(selectFactorPage.getFactorsCount()).eql(userVariables.gen3 ? 1 : 3);

  await t.click(toggle);
  await t.expect(toggle.getAttribute('aria-expanded')).eql('true');
  await t.expect(selectFactorPage.getFactorsCount()).eql(3);
  await t.expect(selectFactorPage.getFactorButtons().nth(1).visible).ok();
  await t.expect(selectFactorPage.getFactorButtons().nth(2).visible).ok();
});

test.requestHooks(mockOktaVerifyMethodsNoFlag)('Okta Verify method picker stays flat when the backend sends no flag', async t => {
  const selectFactorPage = await setup(t);
  const toggle = getMoreOptionsToggle(selectFactorPage);

  await t.expect(toggle.exists).notOk();
  await t.expect(selectFactorPage.getFactorsCount()).eql(3);
});

test.requestHooks(mockUnlockAccountPhishingResistant)('unlock account lists phishing resistant methods first and collapses the rest', async t => {
  const selectFactorPage = await setup(t);
  const toggle = getMoreOptionsToggle(selectFactorPage);
  const emailLabel = within(selectFactorPage.form.el).queryByText('Email');

  await t.expect(toggle.exists).ok();
  await t.expect(toggle.getAttribute('aria-expanded')).eql('false');
  await t.expect(selectFactorPage.getFactorLabelByIndex(0))
    .eql(userVariables.gen3 ? 'Security Key or Biometric Authenticator' : 'Security Key or Biometric');
  await t.expect(emailLabel.visible).notOk();

  await t.click(toggle);
  await t.expect(toggle.getAttribute('aria-expanded')).eql('true');
  await t.expect(emailLabel.visible).ok();
});
