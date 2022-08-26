// Classic supports only the Authn pipeline
import { OktaAuth } from '../authClient/classic';
import { routerClassFactory } from '../router/classic';
import { WidgetOptions } from '../types/options';
import { createOktaSignIn } from '../widget/OktaSignIn';

class OktaSignIn extends createOktaSignIn(OktaAuth, routerClassFactory) {
  constructor(options: WidgetOptions) {
    super(options);
  }
}

export default OktaSignIn
export { OktaSignIn }
export * from '../types';
