import V1Router from 'v1/LoginRouter';
import { RouterConstructor, WidgetOptions } from 'types';
import Util from 'util/Util';
import { ConfigError } from 'util/Errors';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function routerClassFactory(options: WidgetOptions): RouterConstructor {
  if (options.stateToken && !Util.isV1StateToken(options.stateToken)) {
    throw new ConfigError('This version of the Sign-in Widget does not support Identity Engine');
  }

  return V1Router;
}
