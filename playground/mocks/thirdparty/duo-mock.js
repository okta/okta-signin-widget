module.exports = {
  init: (options) => {
    // Load a mock iframe
    // and add an event listener to continue with authentication
    options.iframe.src = '/mocks/thirdparty/duo-iframe.html';
    options.iframe.onload = () => {
      var innerDoc = options.iframe.contentDocument || options.iframe.contentWindow.document;
      var duoMockLink = innerDoc.getElementById('duoVerifyLink');
      duoMockLink.addEventListener('click', () => {
        options.post_action('successDuoAuth');
      }, false);
    };
  }
};
