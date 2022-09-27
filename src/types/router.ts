import Settings from 'models/Settings';
import { AbstractAppState } from './appState';
import { WidgetOptions } from "./options";

export interface AbstractRouter {
  hide();
  show();
  remove();
  settings: Settings;
  appState: AbstractAppState;
}

export interface RouterConstructor<T = AbstractRouter> {
  new?: () => T;
  prototype: any;
}

export type RouterClassFactory<T = AbstractRouter> = (options: WidgetOptions) => RouterConstructor<T>;
