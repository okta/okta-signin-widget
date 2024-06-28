import { randomStr } from '../../util/random';
import getOktaClient from './getOktaClient';
import { OpenIdConnectApplication, OpenIdConnectApplicationType } from '@okta/okta-sdk-nodejs';


type Options = {
  appType: OpenIdConnectApplicationType;
}

export default async function (options: Options) {
  const oktaClient = getOktaClient();

  const { appType } = options;
  const testApp: OpenIdConnectApplication = {
    'name': 'oidc_client',
    'label': `Generated E2E Test Client - ${randomStr(6)}`,
    'signOnMode': 'OPENID_CONNECT',
    'credentials': {
      'oauthClient': {
        'token_endpoint_auth_method': appType === 'browser' ? 'none' : 'client_secret_basic'
      }
    },
    'settings': {
      'oauthClient': {
        'client_uri': 'http://localhost:3000',
        'logo_uri': 'http://developer.okta.com/assets/images/logo-new.png',
        'redirect_uris': [
          'http://localhost:3000/done'
        ],
        'post_logout_redirect_uris': [
          'http://localhost:3000'
        ],
        'response_types': [
          'token',
          'id_token',
          'code'
        ],
        'grant_types': [
          'implicit',
          'authorization_code',
          'interaction_code',
          'refresh_token'
        ],
        'application_type': appType,
        'consent_method': 'REQUIRED'
      }
    }
  };

  const app = await oktaClient.applicationApi.createApplication({
    application: testApp
  });
  return app;
}
