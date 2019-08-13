import PrimaryAuthPageObject from '../framework/page-objects/PrimaryAuthPageObject';

fixture(`PrimaryAuth Form`);

async function setup(t) {
  const primaryAuthPage = new PrimaryAuthPageObject(t);
  await primaryAuthPage.navigateToPage();
  return primaryAuthPage;
}

test(`should have editable fields`, async t => {
  const primaryAuthPage = await setup(t);

  await primaryAuthPage.fillUsernameField('Test Username');
  await primaryAuthPage.fillPasswordField('Test Password');
  await primaryAuthPage.setRememberMeField(true);

  await t.expect(primaryAuthPage.getUsernameValue()).eql('Test Username');
  await t.expect(primaryAuthPage.getPasswordValue()).eql('Test Password');
  await t.expect(primaryAuthPage.getRememberMeValue()).eql(true);
});

test(`should show errors if required fields are empty`, async t => {
  const primaryAuthPage = await setup(t);

  await primaryAuthPage.clickSignInButton();
  await primaryAuthPage.waitForErrorBox();

  await t.expect(primaryAuthPage.hasUsernameError()).eql(true);
  await t.expect(primaryAuthPage.hasUsernameErrorMessage()).eql(true);
  await t.expect(primaryAuthPage.hasPasswordError()).eql(true);
  await t.expect(primaryAuthPage.hasPasswordErrorMessage()).eql(true);
});

test(`should show errors after empty required fields are focused out`, async t => {
  const primaryAuthPage = await setup(t);

  await primaryAuthPage.fillUsernameField('');
  await primaryAuthPage.fillPasswordField('');
  await primaryAuthPage.setRememberMeField(true);

  await primaryAuthPage.waitForPasswordError();

  await t.expect(primaryAuthPage.hasUsernameError()).eql(true);
  await t.expect(primaryAuthPage.hasUsernameErrorMessage()).eql(true);
  await t.expect(primaryAuthPage.hasPasswordError()).eql(true);
  await t.expect(primaryAuthPage.hasPasswordErrorMessage()).eql(true);
});

test(`should not show errors on first field if not interacted with`, async t => {
  const primaryAuthPage = await setup(t);

  await primaryAuthPage.fillPasswordField('');
  await primaryAuthPage.setRememberMeField(true);

  await primaryAuthPage.waitForPasswordError();

  await t.expect(primaryAuthPage.hasUsernameError()).eql(false);
  await t.expect(primaryAuthPage.hasUsernameErrorMessage()).eql(false);
  await t.expect(primaryAuthPage.hasPasswordError()).eql(true);
  await t.expect(primaryAuthPage.hasPasswordErrorMessage()).eql(true);
});
