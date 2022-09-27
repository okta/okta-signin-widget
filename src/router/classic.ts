import V1Router from 'v1/LoginRouter';
import { RouterConstructor, WidgetOptions } from 'types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function routerClassFactory(options: WidgetOptions): RouterConstructor {
  return V1Router;
}
