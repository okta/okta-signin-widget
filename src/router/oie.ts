import V2Router from 'v2/WidgetRouter';
import { RouterConstructor, WidgetOptions } from 'types';
import Util from 'util/Util';
import { ConfigError } from 'util/Errors';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function routerClassFactory(options: WidgetOptions): RouterConstructor<V2Router> {
  if (options.stateToken && Util.isV1StateToken(options.stateToken)) {
    throw new ConfigError('This version of the Sign-in Widget does not support Classic Engine');
  }
  return V2Router;
}
