import type { JSPDatabag } from '@okta/loginpage-render';

import { databagString, jspPageDatabag } from '@okta/loginpage-mock';
import '@okta/loginpage-render';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RunLoginPageFunction = (fn: any) => void;

declare global {
  interface Window {
    okta: {
      locale: string;
    }
    OktaLoginPageRender: {
      render: (databag: string, jspPageDatabag: JSPDatabag, runLoginPage: RunLoginPageFunction) => void;
    },
    OktaLogin: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initLoginPage: any;
    }
  }
}

window.okta = {
  locale: 'en'
};

// Simulate runLoginPage from JSP
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const runLoginPage: RunLoginPageFunction = (fn: any) => fn();

window.OktaLoginPageRender.render(databagString, jspPageDatabag, runLoginPage);
