import BasePageObject from './BasePageObject';
import { ClientFunction } from 'testcafe';


export default class UiDemoPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  // this method scrolls down the height of the window
  async scrollToNextPage() {
    const getClientHeight = ClientFunction(() => window.document.documentElement.clientHeight);
    const windowheight = await getClientHeight();
    await this.t.scrollBy(0, windowheight);
  }

  // hides the testcafe animated progress bar
  async hideProgressBar() {
    await ClientFunction(() => {
      // the testcafe progress bar element is in the shadow dom so we cannot query it directly
      const style = document.createElement('style');
      style.textContent = '.progress-bar-hammerhead-shadow-ui { visibility: hidden !important; }';
      document.head.appendChild(style);
    })();
  }

  // freezes mui spinner components
  async stopSpinnerAnimation() {
    await ClientFunction(() => {
      const rootSpinnerStyle = document.createElement('style');
      rootSpinnerStyle.textContent = '.MuiCircularProgress-root { animation: none !important; }';
      document.head.appendChild(rootSpinnerStyle);

      const circleSpinnerStyle = document.createElement('style');
      circleSpinnerStyle.textContent = '.MuiCircularProgress-circle { animation: none !important; }';
      document.head.appendChild(circleSpinnerStyle);
    })();
  }
}
