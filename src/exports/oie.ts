// OIE supports only IDX pipeline
import { OktaAuth } from '../authClient/oie';
import { routerClassFactory } from '../router/oie';
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
