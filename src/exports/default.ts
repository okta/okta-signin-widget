// Default supports both IDX and Authn pipelines
import { OktaAuth } from '../authClient/default';
import { routerClassFactory } from '../router/default';
import { createOktaSignIn } from '../widget/OktaSignIn';

const OktaSignIn = createOktaSignIn(OktaAuth, routerClassFactory);

export default OktaSignIn
export { OktaSignIn }
export * from '../types';
