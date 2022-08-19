import V1Router from 'v1/LoginRouter';
import { RouterConstructor, WidgetOptions } from 'types';

export function routerClassFactory(options: WidgetOptions): RouterConstructor {
  return V1Router;
}
