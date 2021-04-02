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
  isAuthenticated: boolean;

  constructor(public oktaAuth: OktaAuthService, router: Router) {
    this.signIn = oktaAuth;
    this.router = router;
  }

  async ngOnInit() {
    this.isAuthenticated = await this.signIn.isAuthenticated();
  }

  async logout() {
    // Terminates the session with Okta and removes current tokens.
    await this.signIn.logout();
    this.router.navigateByUrl('/');
  }
}
