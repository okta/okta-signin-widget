import V2Router from 'v2/WidgetRouter';
import { RouterConstructor, WidgetOptions } from 'types';

export function routerClassFactory(options: WidgetOptions): RouterConstructor<V2Router> {
  return V2Router;
}
