// Default supports both Authn and IDX pipelines
import { mixinAuthn } from '@okta/okta-auth-js';
import { OktaAuth as OktaAuthIdx } from './oie';

// Simply add Authn support to the IDX client
const OktaAuth = mixinAuthn(OktaAuthIdx);

export { OktaAuth };
