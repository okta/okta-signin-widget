export function areCookiesEnabled() {
  // Try setting a test cookie with short expiration
  const expiry = new Date();
  expiry.setTime(expiry.getTime() + 1000 * 5);
  document.cookie = 'testcookie=1;expires='+expiry.toUTCString()+';SameSite=Lax';

  // Check if the test cookie was successfully set
  const cookiesEnabled = document.cookie.indexOf('testcookie=') !== -1;
  return cookiesEnabled;
}