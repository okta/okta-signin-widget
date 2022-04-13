/* eslint-disable @typescript-eslint/no-unused-vars */
import OktaSignIn from '@okta/okta-signin-widget';
import { expectType, expectError } from 'tsd';

expectType<OktaSignIn>(new OktaSignIn({
  baseUrl: 'https://{yourOktaDomain}',
  language: (supportedLanguages, userLanguages) => {
    return supportedLanguages[0];
  }
}));

expectType<OktaSignIn>(new OktaSignIn({
  language: 'byol',
}));

expectError(new OktaSignIn({
  // $ExpectError
  language: false,
}));
