import {
  compile,
  middleware,
  prefixer,
  serialize,
  stringify,
} from 'stylis';

import stylisLogicalPlugin from '..';

import type { Middleware } from 'stylis';

export const setupSerializer = (plugins: Middleware[] = [
  prefixer,
  stylisLogicalPlugin,
  stringify,
]) => {
  return (css: string) => {
    const compiled = compile(css);

    return serialize(compiled, middleware(plugins));
  }
};