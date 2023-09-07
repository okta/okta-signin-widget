import {
  compile,
  middleware,
  serialize,
  stringify,
} from 'stylis';

import stylisLogicalPlugin from '..';

import type { Middleware } from 'stylis';

export const setupSerializer = (plugins: Middleware[] = [
  stylisLogicalPlugin,
  stringify,
]) => {
  return (css: string) => {
    const compiled = compile(css);

    return serialize(compiled, middleware(plugins));
  }
};