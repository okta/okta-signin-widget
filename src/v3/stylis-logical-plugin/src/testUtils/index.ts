import type { Middleware } from 'stylis';
import {
  compile,
  middleware,
  serialize,
  stringify,
} from 'stylis';

import stylisLogicalPlugin from '..';

export const setupSerializer = (plugins: Middleware[] = [
  stylisLogicalPlugin({ rootDirElement: 'html' }),
  stringify,
]) => (css: string) => {
  const compiled = compile(css);

  return serialize(compiled, middleware(plugins));
};

export const minify = (css: string) => serialize(compile(css), stringify);

export const safeQuerySelector = (element: Element | Document, selector: string) => {
  const e = element.querySelector(selector);
  if (e !== null) {
    return e;
  }
  throw new Error(`Element matching selector "${selector}" was not found!`);
};
