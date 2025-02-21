export function areCookiesEnabled() {
  // Try setting a test cookie with short expiration
  const expiry = new Date();
  expiry.setTime(expiry.getTime() + (1000 * 1));
  document.cookie = 'okta-cookie-validation=1;expires='+expiry.toUTCString()+';SameSite=Lax';

  // Check if the test cookie was successfully set
  const cookiesEnabled = document.cookie.indexOf('okta-cookie-validation=') !== -1;

  // Ensure cookie is deleted
  document.cookie = 'okta-cookie-validation=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

  return cookiesEnabled;
}