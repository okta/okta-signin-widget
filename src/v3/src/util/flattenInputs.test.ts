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

import { flattenInputs } from './flattenInputs';

describe('flattenInputs', () => {
  it('returns original value in array for single level input', () => {
    const input = {
      name: 'fake-name',
      label: 'fake-label',
    };
    const res = flattenInputs(input);
    expect(res).toEqual([{
      name: 'fake-name',
      label: 'fake-label',
    }]);
  });

  it('flattens nested field in input.value with concating name with dot notation', () => {
    const input = {
      name: 'name1',
      value: [{
        name: 'name2',
        value: [{
          name: 'name3',
          value: 'fake-value-1',
        }],
      }, {
        name: 'name4',
        value: 'fake-value-2',
      }],
    };
    const res = flattenInputs(input);
    expect(res).toEqual([{
      name: 'name1.name2.name3',
      value: 'fake-value-1',
    }, {
      name: 'name1.name4',
      value: 'fake-value-2',
    }]);
  });

  it('includes all fields from the deepest value', () => {
    const input = {
      name: 'name1',
      qux: 'qux',
      value: [{
        name: 'name2',
        value: [{
          name: 'name3',
          value: 'fake-value-1',
          foo: 'foo',
          bar: 'bar',
        }],
      }, {
        name: 'name4',
        value: 'fake-value-2',
        baz: 'baz',
      }],
    };
    const res = flattenInputs(input);
    expect(res).toEqual([{
      name: 'name1.name2.name3',
      value: 'fake-value-1',
      foo: 'foo',
      bar: 'bar',
    }, {
      name: 'name1.name4',
      value: 'fake-value-2',
      baz: 'baz',
    }]);
  });

  describe('include required field', () => {
    it('uses child level required field directly when root level required is not defined', () => {
      const input1 = {
        name: 'name1',
        value: [{
          name: 'name2',
          value: [{
            name: 'name3',
            value: 'fake-value-1',
            required: false,
          }],
        }],
      };
      const res1 = flattenInputs(input1);
      expect(res1).toEqual([{
        name: 'name1.name2.name3',
        value: 'fake-value-1',
        required: false,
      }]);

      const input2 = {
        name: 'name1',
        value: [{
          name: 'name2',
          value: [{
            name: 'name3',
            value: 'fake-value-1',
            required: true,
          }],
        }],
      };
      const res2 = flattenInputs(input2);
      expect(res2).toEqual([{
        name: 'name1.name2.name3',
        value: 'fake-value-1',
        required: true,
      }]);
    });

    it('uses child level required field directly when root level required is false', () => {
      const input1 = {
        name: 'name1',
        required: false,
        value: [{
          name: 'name2',
          value: [{
            name: 'name3',
            value: 'fake-value-1',
            required: true,
          }],
        }],
      };
      const res1 = flattenInputs(input1);
      expect(res1).toEqual([{
        name: 'name1.name2.name3',
        value: 'fake-value-1',
        required: true,
      }]);

      const input2 = {
        name: 'name1',
        required: false,
        value: [{
          name: 'name2',
          value: [{
            name: 'name3',
            value: 'fake-value-1',
            required: false,
          }],
        }],
      };
      const res2 = flattenInputs(input2);
      expect(res2).toEqual([{
        name: 'name1.name2.name3',
        value: 'fake-value-1',
        required: false,
      }]);
    });

    it('uses root level required when child level required is undefined', () => {
      const input1 = {
        name: 'name1',
        required: false,
        value: [{
          name: 'name2',
          value: [{
            name: 'name3',
            value: 'fake-value-1',
          }],
        }],
      };
      const res1 = flattenInputs(input1);
      expect(res1).toEqual([{
        name: 'name1.name2.name3',
        value: 'fake-value-1',
        required: false,
      }]);

      const input2 = {
        name: 'name1',
        required: true,
        value: [{
          name: 'name2',
          value: [{
            name: 'name3',
            value: 'fake-value-1',
          }],
        }],
      };
      const res2 = flattenInputs(input2);
      expect(res2).toEqual([{
        name: 'name1.name2.name3',
        value: 'fake-value-1',
        required: true,
      }]);
    });

    it('uses child level required when root level required is true', () => {
      const input1 = {
        name: 'name1',
        required: true,
        value: [{
          name: 'name2',
          value: [{
            name: 'name3',
            value: 'fake-value-1',
            required: true,
          }],
        }],
      };
      const res1 = flattenInputs(input1);
      expect(res1).toEqual([{
        name: 'name1.name2.name3',
        value: 'fake-value-1',
        required: true,
      }]);

      const input2 = {
        name: 'name1',
        required: true,
        value: [{
          name: 'name2',
          value: [{
            name: 'name3',
            value: 'fake-value-1',
            required: false,
          }],
        }],
      };
      const res2 = flattenInputs(input2);
      expect(res2).toEqual([{
        name: 'name1.name2.name3',
        value: 'fake-value-1',
        required: false,
      }]);
    });
  });
});
