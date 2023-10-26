import BasePageObject from './BasePageObject';
import { ClientFunction } from 'testcafe';


export default class UiDemoPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  async scrollToNextPage() {
    const getClientHeight = ClientFunction(() => window.document.documentElement.clientHeight);
    const windowheight = await getClientHeight();
    await this.t.scrollBy(0, windowheight);
  }

  async hideProgressBar() {
    await ClientFunction(() => {
      // the testcafe progress bar element is in the shadow dom so we cannot query it directly
      const style = document.createElement('style');
      style.textContent = '.progress-bar-hammerhead-shadow-ui { visibility: hidden !important; }';
      document.head.appendChild(style);
    })();
  }

  async stopSpinnerAnimation() {
    await ClientFunction(() => {
      const spinnerRoot = document.querySelector('.MuiCircularProgress-root');
      const spinnerCircle = document.querySelector('.MuiCircularProgress-circle');
      spinnerRoot.setAttribute('style', 'animation: none;');
      spinnerCircle.setAttribute('style', 'animation: none;');
    })();
  }
}
