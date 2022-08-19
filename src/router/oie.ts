import V2Router from 'v2/WidgetRouter';
import { RouterConstructor, WidgetOptions } from 'types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function routerClassFactory(options: WidgetOptions): RouterConstructor<V2Router> {
  return V2Router;
}
