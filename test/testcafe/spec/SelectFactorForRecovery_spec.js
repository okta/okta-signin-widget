import SelectFactorPageObject from '../framework/page-objects/SelectFactorPageObject';
import { RequestMock } from 'testcafe';
import selectFactorForPasswordRecovery from '../../../playground/mocks/data/idp/idx/select-factor-for-password-recovery';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(selectFactorForPasswordRecovery);

fixture('Select Factor Form')
  .requestHooks(mock);

async function setup(t) {
  const selectFactorPageObject = new SelectFactorPageObject(t);
  await selectFactorPageObject.navigateToPage();
  return selectFactorPageObject;
}

test('should load select factor list with right title and description', async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Reset your password');
  await t.expect(selectFactorPage.getFormSubtitle()).eql('Verify with one of the following factors to reset your password.');
  await t.expect(selectFactorPage.hasEmailIcon()).eql(true);

  await t.expect(selectFactorPage.getEmailLabel()).eql('Email Label');
});
