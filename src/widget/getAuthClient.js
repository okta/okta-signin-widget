import { OktaAuth } from '@okta/okta-auth-js';
import Util from 'util/Util';
import config from 'config/config.json';
import _ from 'underscore';

export default function(options) {
  var authParams = _.extend({
    issuer: options.issuer,
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
    // TODO: this block handles OKTA UA for passed in authClient, error should be thrown in the next major version
    // For now, do nothing here to preserve the current behavior
    // JIRA: https://oktainc.atlassian.net/browse/OKTA-433378
    // throw new Errors.ConfigError('The passed in authClient should be version 5.4.0 or above.');
  } else {
    authClient._oktaUserAgent.addEnvironment(`okta-signin-widget-${config.version}`);
  }

  // Set default headers object for widget access
  // TOOD: remove when auth-js includes https://oktainc.atlassian.net/browse/OKTA-435081
  authClient.options.headers = authClient.options.headers || {};

  return authClient;
}
