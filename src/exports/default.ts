// Default supports both IDX and Authn pipelines
import { OktaAuth } from '../authClient/default';
import { routerClassFactory } from '../router/default';
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
