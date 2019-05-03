// app.module.ts

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { environment } from '../environments/environment';

import {
  OktaAuthModule,
  OktaCallbackComponent,
  OktaAuthGuard
} from '@okta/okta-angular';

import { AppComponent } from './app.component';
import { ProtectedComponent } from './protected.component';
import { LoginComponent } from './login.component';

// See extra-webpack.config.js
const { WIDGET_TEST_SERVER, WIDGET_CLIENT_ID } = process.env;

const config = {
  issuer: `${WIDGET_TEST_SERVER}/oauth2/default`,
  redirectUri: 'http://localhost:4200/implicit/callback',
  clientId: `${WIDGET_CLIENT_ID}`
};

export function onAuthRequired({ oktaAuth, router }) {
  // Redirect the user to your custom login page
  router.navigate(['/login']);
}

const appRoutes: Routes = [
  {
    path: 'implicit/callback',
    component: OktaCallbackComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [ OktaAuthGuard ],
    data: {
      onAuthRequired
    }
  }
]
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProtectedComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),    
    OktaAuthModule.initAuth(config)
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
