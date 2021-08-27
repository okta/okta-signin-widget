import { OktaAuth } from '@okta/okta-auth-js';
import Util from 'util/Util';
import Errors from 'util/Errors';
import config from 'config/config.json';
import _ from 'underscore';

export default function(options) {
  var authParams = _.extend({
    clientId: options.clientId,
    redirectUri: options.redirectUri,
    state: options.state,
    scopes: options.scopes,
    transformErrorXHR: Util.transformErrorXHR,
  }, options.authParams);

  if (!authParams.issuer) {
    authParams.issuer = options.baseUrl + '/oauth2/default';
  }

  var authClient = options.authClient ? options.authClient : new OktaAuth(authParams);
  if (!authClient._oktaUserAgent) {
    throw new Errors.ConfigError('The passed in authClient should be version 5.4.0 or above.');
  } else {
    authClient._oktaUserAgent.addEnvironment(`okta-signin-widget-${config.version}`);
  }

  return authClient;
}
