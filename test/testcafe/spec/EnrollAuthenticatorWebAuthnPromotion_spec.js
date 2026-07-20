import { RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { oktaDashboardContent } from '../framework/shared';
import EnrollWebauthnPageObject from '../framework/page-objects/EnrollWebauthnPageObject';
import xhrPasskeyPromotion from '../../../playground/mocks/data/idp/idx/authenticator-enroll-passkey-promotion';
import xhrPasskeyPromotionSecurityKey from '../../../playground/mocks/data/idp/idx/authenticator-enroll-passkey-promotion-security-key';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const promoPasskeysMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrPasskeyPromotion)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrSuccess)
  .onRequestTo('http://localhost:3000/idp/idx/skip')
  .respond(xhrSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const promoSecurityKeyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrPasskeyPromotionSecurityKey)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrSuccess)
  .onRequestTo('http://localhost:3000/idp/idx/skip')
  .respond(xhrSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

fixture('Enroll Authenticator: Passkey Promotion (Passkeys displayName)')
  .requestHooks(promoPasskeysMock);

// WebAuthn API isn't available in headless-chrome/testcafe without native automation,
// so the interactive credentials.create() path isn't exercisable here — we assert on
// the static shell (title, CTA label, splash structure, skip link presence).
test('shows promo title, "Create a passkey" CTA, splash, and "Maybe later" link', async t => {
  if (!t.browser.nativeAutomation) {
    return;
  }
  const page = new EnrollWebauthnPageObject(t);
  await page.navigateToPage();
  await t.expect(page.formExists()).eql(true);
  await checkA11y(t);

  // Promo-specific copy
  await t.expect(page.getFormTitle()).eql('Set up a passkey: more secure, easier to use.');
  await t.expect(await page.createPasskeyButtonExists()).ok();
  await t.expect(await page.setupButtonExists()).notOk();

  // Splash + FAQ content
  await t.expect(await page.hasPasskeyPromotionSplash()).ok();
  await t.expect(await page.getPromoFaqTitleCount()).eql(3);

  // Skip link
  await t.expect(await page.maybeLaterLinkExists()).ok();
});

fixture('Enroll Authenticator: Passkey Promotion (Security Key or Biometric displayName)')
  .requestHooks(promoSecurityKeyMock);

test('keeps default title and "Set up" CTA, no splash, but skip link is preserved', async t => {
  if (!t.browser.nativeAutomation) {
    return;
  }
  const page = new EnrollWebauthnPageObject(t);
  await page.navigateToPage();
  await t.expect(page.formExists()).eql(true);
  await checkA11y(t);

  // Default enrollment copy — no promo overrides
  await t.expect(page.getFormTitle()).eql('Set up security key or biometric authenticator');
  await t.expect(await page.setupButtonExists()).ok();
  await t.expect(await page.createPasskeyButtonExists()).notOk();

  // Splash is NOT rendered for Security Key or Biometric
  await t.expect(await page.hasPasskeyPromotionSplash()).notOk();
  await t.expect(await page.getPromoFaqTitleCount()).eql(0);

  // Skip link is still rendered because the response ships the skip remediation
  await t.expect(await page.maybeLaterLinkExists()).ok();
});
