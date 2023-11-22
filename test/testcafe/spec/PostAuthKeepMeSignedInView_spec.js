import { RequestMock, RequestLogger } from 'testcafe';
import { checkA11y, oktaDashboardContent } from '../framework/a11y';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import PostAuthKeepMeSignedInPageObject from '../framework/page-objects/PostAuthKeepMeSignedInPageObject';
import xhrPostAuthKeepMeSignedIn from '../../../playground/mocks/data/idp/idx/post-auth-keep-me-signed-in';
import xhrIdentify from '../../../playground/mocks/data/idp/idx/identify';
import xhrPassword from '../../../playground/mocks/data/idp/idx/authenticator-verification-password';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrPostAuthKeepMeSignedIn)
  .onRequestTo('http://localhost:3000/idp/idx/keep-me-signed-in')
  .respond(xhrSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const logger = RequestLogger(/idp\/idx/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Post Auth Keep Me Signed In');

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  const postAuthKeepMeSignedInPage = new PostAuthKeepMeSignedInPageObject(t);
  await identityPage.navigateToPage();
  await t.expect(identityPage.formExists()).eql(true);

  return { postAuthKeepMeSignedInPage, identityPage };
}

async function login(identityPage) {
  await identityPage.fillIdentifierField('john.doe@example.com');
  await identityPage.clickNextButton();

  await identityPage.fillPasswordField('testPassword');
  await identityPage.clickVerifyButton();
}

async function testRedirect(t) {
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  return t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
}

test
  .requestHooks(logger, mock)('should render the post auth keep me signed in page', async t => {
    const { postAuthKeepMeSignedInPage, identityPage } = await setup(t);

    await login(identityPage);

    await checkA11y(t);

    await t.expect(postAuthKeepMeSignedInPage.getFormTitle()).eql('Keep me signed in');
    await t.expect(postAuthKeepMeSignedInPage.getFormSubtitle()).eql('Sign in and enter security methods less frequently.');
    await t.expect(postAuthKeepMeSignedInPage.getAcceptButtonText()).eql('Stay signed in');
    await t.expect(postAuthKeepMeSignedInPage.getRejectButtonText()).eql('Don\'t stay signed in');
  });

[true, false].forEach((isAccept) => {
  test
    .requestHooks(logger, mock)('should send the correct payload depending on which button is clicked', async t => {
      const { postAuthKeepMeSignedInPage, identityPage } = await setup(t);

      await login(identityPage);
      
      await isAccept ? postAuthKeepMeSignedInPage.clickAcceptButton() : postAuthKeepMeSignedInPage.clickRejectButton();

      await testRedirect(t);

      let { request: { body, method, url } } = logger.requests[3];
      await t.expect(url).eql('http://localhost:3000/idp/idx/keep-me-signed-in');
      await t.expect(method).eql('post');
      const requestBody = JSON.parse(body);

      const expectedPayload = {
        stateHandle: 'dummy-state-handle',
        keepMeSignedIn: isAccept,
      };

      await t.expect(requestBody).eql(expectedPayload);
    });
});
