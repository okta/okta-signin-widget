import { ConfigError } from 'util/Errors';
import Util from 'util/Util';
import config from 'config/config.json';
import { WidgetOptions, WidgetOktaAuthConstructor, WidgetOktaAuthInterface } from 'types';

export default function getAuthClientInstance(
  OktaAuth: WidgetOktaAuthConstructor,
  options: WidgetOptions = {}
): WidgetOktaAuthInterface
{
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
    throw new ConfigError('The passed in authClient should be version 5.4.0 or above.');
  } else {
    authClient._oktaUserAgent.addEnvironment(`okta-signin-widget-${config.version}`);
  }

  return authClient;
}
