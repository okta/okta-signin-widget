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

const { optimize } = require('svgo/lib/svgo');
const plugin = require('./addClassNamesByAttr');

const minify = (strs, ...vals) => strs
  .map((s) => s.replace(/(\n|\t| {2,})/g, '')) // strip newlines and tabs
  .map((s, i) => `${s}${i in vals ? vals[i] : ''}`) // insert value
  .join(''); // combine into string

const TARGET_VAL = '#abc123';

describe('svgo plugins: addClassNamesByAttr', () => {
  const fixture = minify`<svg>
    <g fill="${TARGET_VAL}" class="existing">
      <path stroke="${TARGET_VAL}"/>
    </g>
    <defs>
      <filter id="${TARGET_VAL}"/>
    </defs>
  </svg>`;

  it('should export required field', () => {
    expect(typeof plugin.name).toEqual('string');
    expect(typeof plugin.type).toEqual('string');
    expect(typeof plugin.active).toEqual('boolean');
    expect(typeof plugin.description).toEqual('string');
    expect(typeof plugin.params).toEqual('object');
  });

  it('should add classNames if a rule matches', () => {
    const original = `<path stroke="${TARGET_VAL}"/>`;
    const expected = `<path stroke="${TARGET_VAL}" class="myclass"/>`;
    const config = {
      plugins: [{
        ...plugin,
        params: {
          rules: [{
            test: (el) => new RegExp(TARGET_VAL, 'i')
              .test(el.attributes.stroke),
            classNames: ['myclass'],
          }],
        },
      }],
    };
    const { data } = optimize(original, config);
    expect(data).toEqual(expected);
  });

  it('should do nothing if there are no rules', () => {
    const { data } = optimize(fixture, {
      plugins: [plugin],
    });
    expect(data).toBe(fixture);
  });

  describe('validate params', () => {
    it('should throw an error if rules is not an array', () => {
      expect(() => optimize(fixture, {
        plugins: [{
          ...plugin,
          params: {
            rules: 'string',
          },
        }],
      })).toThrow();
    });

    it('should throw an error if a rule is missing test', () => {
      const config = {
        plugins: [{
          ...plugin,
          params: {
            rules: [{
              classNames: ['myclass'],
            }],
          },
        }],
      };
      expect(() => optimize(fixture, config)).toThrow('required');
    });

    it('should throw an error if a rule is missing classNames', () => {
      const config = {
        plugins: [{
          ...plugin,
          params: {
            rules: [{
              test: (el) => new RegExp(TARGET_VAL, 'i')
                .test(el.attributes.stroke),
            }],
          },
        }],
      };
      expect(() => optimize(fixture, config)).toThrow('required');
    });
  });

  it('should preserve existing classes', () => {
    const original = `<g foo="${TARGET_VAL}" class="existing"/>`;
    const expected = `<g foo="${TARGET_VAL}" class="existing my new classes"/>`;
    const config = {
      plugins: [{
        ...plugin,
        params: {
          rules: [{
            test: (el) => new RegExp(TARGET_VAL, 'i')
              .test(el.attributes.foo),
            classNames: 'my new classes',
          }],
        },
      }],
    };
    const { data } = optimize(original, config);
    expect(data).toEqual(expected);
  });
});
