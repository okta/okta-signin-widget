import { OktaAuth } from '@okta/okta-auth-js';
import Util from 'util/Util';
import _ from 'underscore';

export default function(options) {
  var authParams = _.extend({
    transformErrorXHR: Util.transformErrorXHR,
  }, options);
  
  return new OktaAuth(authParams);
}
