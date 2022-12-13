/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

module.exports.name = 'addClassNamesByAttr';
module.exports.type = 'perItem';
module.exports.active = true;
module.exports.description = 'Add class names to elements';

module.exports.params = {
  rules: [],
};

module.exports.fn = (node, params, extra) => {
  // skip subsequent passes when multipass is used
  if (extra.multipassCount && extra.multipassCount > 0) {
    return node;
  }

  // validation
  if (!Array.isArray(params.rules)) {
    throw new Error('expected "rules" param to be an array');
  }

  // prevent partial changes by validating first
  const rules = params.rules.map(({ test, classNames }) => {
    if (!test) {
      throw new Error('rule.test is required');
    }
    if (!classNames) {
      throw new Error('rule.className is required');
    }
    if (typeof test !== 'function') {
      throw new Error('expected test to be a function');
    }
    if (
      typeof classNames !== 'string'
      && (
        !Array.isArray(classNames)
        || classNames.some((cn) => typeof cn !== 'string')
      )
    ) {
      throw new Error('expected rule.classNames to be a string or an array of strings');
    }

    return {
      test,
      classNames,
    };
  });

  // loop through rules
  rules.forEach(({ test, classNames }) => {
    if (test(node)) {
      node.class.add(classNames);
    }
  });
  return node;
};
