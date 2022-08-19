// OIE supports only IDX pipeline
import { OktaAuth } from '../authClient/oie';
import { routerClassFactory } from '../router/oie';
import { createOktaSignIn } from '../widget/OktaSignIn';


const OktaSignIn = createOktaSignIn(OktaAuth, routerClassFactory);

export default OktaSignIn
export { OktaSignIn }
export * from '../types';
