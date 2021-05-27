import { RequestMock } from 'testcafe';
import { renderWidget } from '../framework/shared';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import PlaygroundErrorPageObject from '../framework/page-objects/PlaygroundErrorPageObject';
import xhrErrorWithFailureRedirect from '../../../playground/mocks/data/idp/idx/error-with-failure-redirect';

const userNotAssignedMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrErrorWithFailureRedirect);

fixture('Failure with redirect');

test.requestHooks(userNotAssignedMock)('generic case: redirects', async t => {
  const terminalPage = new TerminalPageObject(t);
  await terminalPage.navigateToPage();
  const errorPage = new PlaygroundErrorPageObject(t);
  await t.expect(errorPage.hasTitle()).eql(true);
});

test.requestHooks(userNotAssignedMock)('oauth: shows the error message', async t => {
  const terminalPage = new TerminalPageObject(t);
  await terminalPage.navigateToPage({ render: false });
  await renderWidget({
    clientId: 'fake',
    redirectUri: 'http://totally-fake'
  });
  await terminalPage.waitForErrorBox();
  await t.expect(terminalPage.getErrorMessages().getTextContent()).eql('You are not allowed to access this app. To request access, contact an admin.');
});

test.requestHooks(userNotAssignedMock)('oauth: will redirect if `redirect === "always"`', async t => {
  const terminalPage = new TerminalPageObject(t);
  await terminalPage.navigateToPage({ render: false });
  await renderWidget({
    clientId: 'fake',
    redirectUri: 'http://totally-fake',
    redirect: 'always'
  });
  const errorPage = new PlaygroundErrorPageObject(t);
  await t.expect(errorPage.hasTitle()).eql(true);
});
