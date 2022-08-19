// Classic supports only the Authn pipeline
import { OktaAuth } from '../authClient/classic';
import { routerClassFactory } from '../router/classic';
import { createOktaSignIn } from '../widget/OktaSignIn';

const OktaSignIn = createOktaSignIn(OktaAuth, routerClassFactory);

export default OktaSignIn
export { OktaSignIn }
export * from '../types';
