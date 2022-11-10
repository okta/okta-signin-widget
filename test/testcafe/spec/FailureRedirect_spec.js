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

test.requestHooks(userNotAssignedMock)('oauth: will redirect if `redirect === "always"`', async t => {
  const terminalPage = new TerminalPageObject(t);
  await terminalPage.navigateToPage({ render: false });
  await renderWidget({
    clientId: 'fake',
    redirectUri: 'http://totally-fake',
    codeChallenge: 'abc', // cannot do PKCE calcs on http://localhost
    authParams: {
      pkce: true // required for interaction code flow
    },
    redirect: 'always'
  });
  const errorPage = new PlaygroundErrorPageObject(t);
  await t.expect(errorPage.hasTitle()).eql(true);
});
