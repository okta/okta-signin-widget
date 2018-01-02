// src/app/app.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { OktaAuthService } from '@okta/okta-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  signIn;
  router;

  constructor(public oktaAuth: OktaAuthService, router: Router) {
    this.signIn = oktaAuth;
    this.router = router;
  }

  async logout() {
    // Terminates the session with Okta and removes current tokens.
    await this.signIn.logout();
    this.router.navigateByUrl('/');
  }
}
