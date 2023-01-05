// Classic supports only the Authn pipeline
import { loc } from '@okta/courage';
import Logger from 'util/Logger';
import { ConfigError } from 'util/Errors';
import { OktaAuth } from '../authClient/classic';
import { routerClassFactory } from '../router/classic';
import { WidgetOptions } from '../types/options';
import { createOktaSignIn } from '../widget/OktaSignIn';

class OktaSignIn extends createOktaSignIn(OktaAuth, routerClassFactory) {
  constructor(options: WidgetOptions) {
    super(options);
    if (this.options.useClassicEngine !== true) {
      Logger.error('This version of the Okta Signin Widget only supports classic engine. Set `useClassicEngine` to `true`.');
      throw new ConfigError(loc('error.config'));
    }
  }
}

export default OktaSignIn
export { OktaSignIn }
export * from '../types';
