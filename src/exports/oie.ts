// OIE supports only IDX pipeline
import { loc } from '@okta/courage';
import Logger from 'util/Logger';
import { ConfigError } from 'util/Errors';
import { OktaAuth } from '../authClient/oie';
import { routerClassFactory } from '../router/oie';
import { WidgetOptions } from '../types/options';
import { createOktaSignIn } from '../widget/OktaSignIn';

class OktaSignIn extends createOktaSignIn(OktaAuth, routerClassFactory) {
  constructor(options: WidgetOptions) {
    super(options);

    if (options.useClassicEngine !== false) {
      Logger.error('This version of the Okta Signin Widget only supports OIE. Remove `useClassicEngine` option or set it to `false`.');
      throw new ConfigError(loc('error.config'));
    }
  }
}

export default OktaSignIn
export { OktaSignIn }
export * from '../types';
