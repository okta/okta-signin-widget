import { RequestLogger, RequestMock } from 'testcafe';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import BasePageObject from '../framework/page-objects/BasePageObject';
import identifyWithAppleSSOExtension from '../../../playground/mocks/idp/idx/data/identify-with-apple-sso-extension';
import success from '../../../playground/mocks/idp/idx/data/success';

const logger = RequestLogger(/introspect|verify/);

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyWithAppleSSOExtension)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/sso_extension/transactions/123/verify')
  .respond(success);

fixture(`App SSO Extension View`)
  .requestHooks(logger, mock);

test(`should have the correct content`, async t => {
  const ssoExtensionPage = new BasePageObject(t);
  await ssoExtensionPage.navigateToPage();
  await t.expect(logger.count(
    record => record.response.statusCode === 200 &&
    record.request.url.match(/introspect/)
  )).eql(1);
  await t.expect(logger.count(
    record => record.response.statusCode === 200 &&
    record.request.method === 'post' &&
    record.request.url.match(/authenticators\/sso_extension\/transactions\/123\/verify/)
  )).eql(1);
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});
