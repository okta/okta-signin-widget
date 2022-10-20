
// Default router factory will detect between classic and OIE pipeline
import Util from 'util/Util';
import V1Router from 'v1/LoginRouter';
import V2Router from 'v2/WidgetRouter';

import { RouterConstructor, WidgetOptions } from 'types';


export function routerClassFactory(options: WidgetOptions) {
  let Router: RouterConstructor;

  // V1 ("classic") flow will load under these conditions:
  const v1DefaultFlow = (!options.stateToken && !options.clientId && !options.proxyIdxResponse); // Default entry flow on okta-hosted login page
  const v1StateTokenFlow = options.stateToken && Util.isV1StateToken(options.stateToken); // Resuming a flow on okta-hosted login page
  const v1AuthFlow = (options.clientId && options.useClassicEngine === true); // Self hosted widget can set the `useClassicEngine` option to use V1Router

  if (v1DefaultFlow || v1StateTokenFlow || v1AuthFlow) {
    Router = V1Router;
  } else {
    Router = V2Router;
  }
  return Router;
}
