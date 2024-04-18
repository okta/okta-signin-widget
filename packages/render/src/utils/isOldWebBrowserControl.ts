export function isOldWebBrowserControl() {
  // We no longer support IE7. If we see the MSIE 7.0 browser mode, it's a good signal
  // that we're in a windows embedded browser.
  if (navigator.userAgent.indexOf('MSIE 7.0') === -1) {
    return false;
  }

  // Because the userAgent is the same across embedded browsers, we use feature
  // detection to see if we're running on older versions that do not support updating
  // the documentMode via x-ua-compatible.
  return !!(document.all && !window.atob);
}
