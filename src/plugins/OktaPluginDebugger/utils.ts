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

export const serializeValue = (val: any, keysToExclude: string[] = []) => {
  if (typeof val === 'string') {
    return val;
  }
  try {
    const plain = typeof val?.toJSON === 'function' ? val.toJSON() : toPlain(val);
    for (const k of keysToExclude) {
      delete plain[k];
    }
    return JSON.stringify(plain, undefined, 2);
  } catch (e) {
    return `Can't serialize to JSON: ${e?.name} ${e?.message}`;
  }
};

const getSerializableKeysForCustomObject = (val: any) => {
  if (val instanceof Window || val instanceof Document) {
    return [];
  }
  const allowedKeys: string[] = [];
  // include all ancestral properties
  let obj = val;
  while (obj && obj?.constructor !== Object) {
    allowedKeys.push(...Object.getOwnPropertyNames(obj));
    obj = Object.getPrototypeOf(obj);
  }
  return allowedKeys;
};

const isObject = (val: any) => {
  return (typeof val === 'object' && val !== null && !Array.isArray(val));
};

const isCustomObject = (val: any) => {
  return isObject(val) && val?.constructor !== Object;
};

// Deeply converts custom objects to plain objects and removes circular references.
// Replaces references to same object with `[ref ${path}]`
//
// Eg. ErrorEvent object will be converted to something like:
// {
//   _class: "ErrorEvent",
//   target: { _class: "Window" },
//   currentTarget: "[ref $.target]",
//   error: {
//     _class: "TypeError", stack: "...", message: "...", name: "TypeError"
//   },
//   ...
// }
export const toPlain = (val: any, objectsMap: Map<any, string> = new Map(), path = '$'): any => {
  if (typeof val === 'object' && val !== null) {
    if (objectsMap.has(val)) {
      return `[ref ${objectsMap.get(val)}]`;
    }
    objectsMap.set(val, path);
  }
  if (isCustomObject(val)) {
    return getSerializableKeysForCustomObject(val)
      .filter(k => {
        let v;
        try {
          v = val[k];
        } catch (_e) {
          // Eg. jsdom can trigger
          // TypeError: 'get detail' called on an object that is not a valid instance of CustomEvent.
        }
        // Remove nullish values and functions
        return v !== undefined && v !== null && typeof v !== 'function';
      })
      .reduce((acc, k) => ({
        ...acc,
        [k]: toPlain(val[k], objectsMap, `${path}.${k}`)
      }), {
        _class: val.constructor.name
      });
  } else if (isObject(val)) {
    return Object.getOwnPropertyNames(val)
      .reduce((acc, k) => ({
        ...acc,
        [k]: toPlain(val[k], objectsMap, `${path}.${k}`)
      }), {});
  } else if (Array.isArray(val)) {
    return val.map((item, i) => toPlain(item, objectsMap, `${path}[${i}]`));
  }
  return val;
};

export const getCurrentTimeStamp = () => {
  return new Date().toISOString();
};
