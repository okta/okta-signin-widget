import { InitOptions } from "duo_web_sdk";

const MockDuo = {
  init: (options: InitOptions) => {
    let iframe: HTMLIFrameElement = (() => {
      if (options.iframe instanceof HTMLIFrameElement) {
        return options.iframe;
      }
      if (typeof options.iframe === 'string') {
        const el = document.querySelector(options.iframe);
        if (el instanceof HTMLIFrameElement) {
          return el;
        }
      }
      throw new Error(`could not find iframe "${options.iframe}"`)
    })();

    if (iframe) {
      iframe.src = '/duo-iframe.html';
      iframe.onload = () => {
        var innerDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
        var duoMockLink = innerDoc?.getElementById('duoVerifyLink');
        duoMockLink?.addEventListener('click', () => {
          if (options.post_action) {
            // @ts-expect-error mistake in @types/duo_web_sdk
            options.post_action('successDuoAuth');
          }
        }, false);
      };
    }
  }
};

export default MockDuo;
