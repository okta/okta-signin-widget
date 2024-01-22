/* eslint-disable max-statements */
/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint complexity: [2, 13], max-depth: [2, 4] */

import _cloneDeep from 'clone-deep';
import deepMerge from 'deepmerge';
import deepEqual from 'fast-deep-equal';

export function cloneDeep<T>(v: T): T {
  return _cloneDeep(v);
}

export function merge<T>(target: Partial<T>, source: Partial<T> | Record<string, unknown>): T {
  return deepMerge(target, source as Partial<T>);
}

export function debounce(func, wait = 0) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function set(obj, path, v) {
  const keys = path
    .split(/\.|\[/)
    .map((k) => {
      return k[k.length-1] === ']' ? parseInt(k.substring(0, k.length-1)) : k;
    });
  let target = obj;
  for (let i = 0 ; i < keys.length ; i++) {
    const key = keys[i];
    const nextKey = i < keys.length-1 ? keys[i+1] : undefined;
    if (nextKey) {
      if (target[key] === undefined) {
        if (typeof nextKey === 'number') {
          target[key] = [];
        } else {
          target[key] = {};
        }
      }
      target = target[key];
    } else {
      target[key] = v;
    }
  }
  return obj;
}

export function groupBy<T>(arr: T[], iteratee: (T) => string): Record<string, T[]> {
  const obj = {};
  arr.forEach((v) => {
    const group = iteratee(v);
    if (!obj[group]) {
      obj[group] = [];
    }
    obj[group].push(v);
  });
  return obj;
}

export function flow(...transformFns) {
  return (v) => {
    return transformFns.flat(Infinity).reduce((res, transformFn) => {
      return transformFn(res);
    }, v);
  };
}

export function isObject(v: unknown) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function compare(a: unknown, b: unknown) {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
  }
}

export function pick(obj: Record<string, unknown>, keys: string[]) {
  return Object.fromEntries(
    keys
      .filter((k) => obj[k] !== undefined)
      .map((k) => ([k, obj[k]]))
  );
}

export function omit(obj: Record<string, unknown>, keys: string[]) {
  return Object.fromEntries(
    Object.keys(obj)
      .filter((k) => !keys.includes(k))
      .map((k) => ([k, obj[k]]))
  );
}

export function isEmpty(v: unknown) {
  if (isObject(v)) {
    return Object.keys(v).length == 0;
  }
  if (Array.isArray(v) || typeof v === 'string') {
    return v?.length === 0;
  }
  return !v;
}

export function union(...arrs) {
  return arrs.reduce((res, arr) => {
    return [...new Set([...res, ...arr])];
  }, []);
}

export function isEqual(a: unknown, b: unknown) {
  return deepEqual(a, b);
}
