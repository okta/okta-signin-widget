// src/app/login.component.ts

import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart} from '@angular/router';

import { OktaAuthService } from '@okta/okta-angular';
import * as OktaSignIn from '@okta/okta-signin-widget';

// See extra-webpack.config.js
const { WIDGET_TEST_SERVER, WIDGET_CLIENT_ID } = process.env;

const config = {
  baseUrl: `${WIDGET_TEST_SERVER}`,
  redirectUri: 'http://localhost:4200/implicit/callback',
  clientId: `${WIDGET_CLIENT_ID}`
};

@Component({
  selector: 'app-secure',
  template: `
    <!-- Container to inject the Sign-In Widget -->
    <div id="okta-signin-container"></div>
  `
})
export class LoginComponent {
  signIn;

  widget = new OktaSignIn(config);

  constructor(oktaAuth: OktaAuthService, router: Router) {
    this.signIn = oktaAuth;

    // Show the widget when prompted, otherwise remove it from the DOM.
    router.events.forEach(event => {
      if (event instanceof NavigationStart) {
        switch(event.url) {
          case '/login':
            break;
          case '/protected':
            break;
          default:
            this.widget.remove();
            break;
        }
      }
    });
  }

  ngOnInit() {
    this.widget.renderEl(
      { el: '#okta-signin-container'}, res => {
        if (res.status === 'SUCCESS') {
          this.signIn.loginRedirect({ sessionToken: res.session.token });
          // Hide the widget
          this.widget.hide();
        }
      }
    );
  }
}
