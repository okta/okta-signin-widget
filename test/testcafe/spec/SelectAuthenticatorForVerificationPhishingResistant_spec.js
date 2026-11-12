import { RequestMock, userVariables } from 'testcafe';
import { within } from '@testing-library/testcafe';

import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';

import xhrSelectAuthenticatorsPhishingResistant from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator-phishing-resistant';
import xhrSelectAuthenticators from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator';

const mockPhishingResistant = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorsPhishingResistant);

const mockNoFlag = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticators);

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
