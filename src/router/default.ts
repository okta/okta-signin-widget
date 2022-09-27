
// Default router factory will detect between classic and OIE pipeline
import Util from 'util/Util';
import V1Router from 'v1/LoginRouter';
import V2Router from 'v2/WidgetRouter';

import { RouterConstructor, WidgetOptions } from 'types';


export function routerClassFactory(options: WidgetOptions) {
  let Router: RouterConstructor;
  if ((options.stateToken && Util.isV1StateToken(options.stateToken))
    // Self hosted widget can set the `useClassicEngine` option to use V1Router
    || options.useClassicEngine === true)
  {
    Router = V1Router;
  } else {
    Router = V2Router;
  }
  return Router;
}
