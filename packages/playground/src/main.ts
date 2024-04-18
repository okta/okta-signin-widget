import type { Databag } from '@okta/loginpage-render';

import { databag } from '@okta/loginpage-mock';
// import global variable OktaLoginPageRender
import '@okta/loginpage-render';

declare global {
  interface Window {
    okta: {
      locale: string;
    }
    OktaLoginPageRender: {
      render: (databag: Databag) => void;
    }
  }
}

window.okta = {
  locale: 'en'
};

window.OktaLoginPageRender.render(databag);
