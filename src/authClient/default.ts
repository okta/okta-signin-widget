// Default supports both Authn and IDX pipelines
import { mixinAuthn } from '@okta/okta-auth-js';
import { OktaAuth as OktaAuthIdx } from './oie';

// okta-auth-js supports a mixin pattern that allows us to compose a custom version containing only the code we need
// build an AuthJS client that supports both the Classic and OIE engines

// Simply add Authn support to the IDX client
const OktaAuth = mixinAuthn(OktaAuthIdx);

export { OktaAuth };
