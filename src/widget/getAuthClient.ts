import Errors from 'util/Errors';
import Util from 'util/Util';
import config from 'config/config.json';
import { WidgetOptions, WidgetOktaAuthConstructor, WidgetOktaAuthInterface, WidgetOktaAuthOptions } from 'types';

export default function getAuthClientInstance
<
  O extends WidgetOktaAuthOptions = WidgetOktaAuthOptions,
  I extends WidgetOktaAuthInterface<O> = WidgetOktaAuthInterface<O>
>
(OktaAuth: WidgetOktaAuthConstructor<O, I>, options: WidgetOptions<I>= {}): I
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
    throw new Errors.ConfigError('The passed in authClient should be version 5.4.0 or above.');
  } else {
    authClient._oktaUserAgent.addEnvironment(`okta-signin-widget-${config.version}`);
  }

  return authClient;
}
