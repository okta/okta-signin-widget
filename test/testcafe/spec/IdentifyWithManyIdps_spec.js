import { RequestMock, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identifyWithManyIdps from '../../../playground/mocks/data/idp/idx/identify-with-many-idps.json';

const mockWithManyIdps = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyWithManyIdps);

fixture('IdentifyWithManyIdps');

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await t.expect(identityPage.formExists()).eql(true);
  return identityPage;
}

test
  .requestHooks(mockWithManyIdps)('should render search input when there are more than 10 IdPs', async t => {
    const identityPage = await setup(t);
    await checkA11y(t);

    // search input should be present
    await t.expect(identityPage.idpSearchInputExists()).ok();

    // identifier form should still be present
    await t.expect(identityPage.identifierFieldExistsForIdpView()).eql(true);
  });

test
  .requestHooks(mockWithManyIdps)('should render all IdP buttons', async t => {
    const identityPage = await setup(t);

    // 12 redirect-idp entries in mock: 6 standard + 6 custom
    // X509 is treated as PIV and rendered separately, so 11 in the list
    const totalIdpCount = await identityPage.getVisibleIdpButtonCount();
    await t.expect(totalIdpCount).gte(10);
  });

test
  .requestHooks(mockWithManyIdps)('should have a scrollable container with fixed height', async t => {
    const identityPage = await setup(t);

    const scrollContainer = identityPage.getIdpScrollContainer();
    await t.expect(scrollContainer.exists).ok();

    // container should have overflow set to allow scrolling
    const overflowY = await scrollContainer.getStyleProperty('overflow-y');
    await t.expect(overflowY).eql('auto');
  });

test
  .requestHooks(mockWithManyIdps)('should filter IdP buttons by search input', async t => {
    const identityPage = await setup(t);

    const countBefore = await identityPage.getVisibleIdpButtonCount();
    await t.expect(countBefore).gte(10);

    // type a search query that matches only one IdP
    await identityPage.fillIdpSearchInput('Google');

    const countAfter = await identityPage.getVisibleIdpButtonCount();
    await t.expect(countAfter).eql(1);
    await t.expect(identityPage.getIdpButton('Sign in with Google').exists).ok();
  });

test
  .requestHooks(mockWithManyIdps)('should show no results message when filter matches nothing', async t => {
    const identityPage = await setup(t);

    await identityPage.fillIdpSearchInput('nonexistent-idp');

    const visibleCount = await identityPage.getVisibleIdpButtonCount();
    await t.expect(visibleCount).eql(userVariables.gen3 ? 0 : 0);

    const noResults = identityPage.getIdpNoResultsMessage();
    await t.expect(noResults.visible).ok();
    await t.expect(noResults.textContent).contains('No results found');
  });

test
  .requestHooks(mockWithManyIdps)('should restore full list when search is cleared', async t => {
    const identityPage = await setup(t);

    // filter first
    await identityPage.fillIdpSearchInput('Google');
    await t.expect(await identityPage.getVisibleIdpButtonCount()).eql(1);

    // clear the search
    await identityPage.clearIdpSearchInput();
    const countAfterClear = await identityPage.getVisibleIdpButtonCount();
    await t.expect(countAfterClear).gte(10);
  });

test
  .requestHooks(mockWithManyIdps)('should filter as user types (typeahead)', async t => {
    const identityPage = await setup(t);

    // type progressively: "Cust" should match all 6 Custom IdPs
    await identityPage.fillIdpSearchInput('Custom');
    const countCustom = await identityPage.getVisibleIdpButtonCount();
    await t.expect(countCustom).eql(6);

    // refine to "Alpha" — only 1
    await identityPage.clearIdpSearchInput();
    await identityPage.fillIdpSearchInput('Alpha');
    const countAlpha = await identityPage.getVisibleIdpButtonCount();
    await t.expect(countAlpha).eql(1);
  });
