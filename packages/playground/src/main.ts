import { databagString } from '@okta/loginpage-mock';
// import global variable OktaLoginPageRender
import '@okta/loginpage-render';

declare global {
  interface Window {
    okta: {
      locale: string;
    }
    OktaLoginPageRender: {
      render: (databag: string) => void;
    }
  }
}

window.okta = {
  locale: 'en'
};

window.OktaLoginPageRender.render(databagString);
