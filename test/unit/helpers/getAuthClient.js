import { OktaAuth } from '@okta/okta-auth-js';
import getAuthClient from 'widget/getAuthClient';

export default function getAuthClientHelper(options) {
  return getAuthClient(OktaAuth, options);
}
