export default {
  init: (options) => {
    const iframe = typeof options.iframe === 'string'
      ? document.querySelector(options.iframe)
      : (
        options.iframe instanceof HTMLElement
          ? options.iframe
          : null
      );

    // Load a mock iframe
    // and add an event listener to continue with authentication
    iframe.src = '/duo-iframe.html';
    iframe.onload = () => {
      var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
      var duoMockLink = innerDoc.getElementById('duoVerifyLink');
      duoMockLink.addEventListener('click', () => {
        options.post_action('successDuoAuth');
      }, false);
    };
  }
};
