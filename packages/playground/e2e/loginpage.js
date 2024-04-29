import { fixture, ClientFunction, Selector } from 'testcafe';

fixture('Login Page')
  .page('http://localhost:3000');

const getTitle = ClientFunction(() => document.title);

test('renders correct page title', async (t) => {
  await t.expect(getTitle()).eql('Okta loginpage render playground');
});

test('renders siw form', async (t) => {
  const siw = Selector('#okta-sign-in');
  await t.expect(siw.exists).ok();
});