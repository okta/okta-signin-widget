import { OktaAuth } from '@okta/okta-auth-js';
import Util from 'util/Util';
import config from 'config/config.json';
import { WidgetOptions } from 'types';

export default function(options: WidgetOptions = {}): OktaAuth {
  // if authClient is set, authParams are disregarded
  let { authClient, authParams } = options;

  if (!authClient) {
    // Create an authClient using widget options and optional authParams
    const {
      issuer,
      clientId,
      redirectUri,
      state,
      scopes,
      flow,
      codeChallenge,
      codeChallengeMethod,
      recoveryToken
    } = options;
    authParams = {
      issuer,
      clientId,
      redirectUri,
      state,
      scopes,
      flow,
      codeChallenge,
      codeChallengeMethod,
      transformErrorXHR: Util.transformErrorXHR,
      recoveryToken,
      ...authParams
    };

    if (!authParams.issuer) {
      authParams.issuer = options.baseUrl + '/oauth2/default';
    }

    authClient = new OktaAuth(authParams);
  }

  // Add widget version to extended user agent header
  if (!authClient._oktaUserAgent) {
    // TODO: this block handles OKTA UA for passed in authClient, error should be thrown in the next major version
    // For now, do nothing here to preserve the current behavior
    // JIRA: https://oktainc.atlassian.net/browse/OKTA-433378
    // throw new ConfigError('The passed in authClient should be version 5.4.0 or above.');
  } else {
    authClient._oktaUserAgent.addEnvironment(`okta-signin-widget-${config.version}`);
  }

  return authClient;
}
