import {
  compile,
  middleware,
  serialize,
  stringify,
} from 'stylis';

import stylisLogicalPlugin from '..';

import type { Middleware } from 'stylis';

export const setupSerializer = (plugins: Middleware[] = [
  stylisLogicalPlugin({ rootDirElement: 'html' }),
  stringify,
]) => {
  return (css: string) => {
    const compiled = compile(css);

    return serialize(compiled, middleware(plugins));
  }
};

export const minify = (css: string) => {
  return serialize(compile(css), stringify);
};

export const safeQuerySelector = (element: Element | Document, selector: string) => {
  const e = element.querySelector(selector);
  if (e !== null) {
    return e;
  }
  throw new Error(`Element matching selector "${selector}" was not found!`);
};
