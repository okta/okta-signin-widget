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

import { TransformationOptions } from '../types';
import { transformIdxTransaction } from './main';

jest.mock('./field', () => ({
  transformFields: () => () => ({}),
}));
jest.mock('./button', () => ({
  transformButtons: () => () => ({}),
}));
jest.mock('./layout', () => ({
  transformLayout: () => () => ({}),
}));
jest.mock('./i18n', () => ({
  transformI18n: () => () => ({}),
}));
jest.mock('./dataSchema', () => ({
  transformDataSchema: () => ({}),
}));
jest.mock('./testAttribute', () => ({
  transformTestAttribute: () => ({}),
}));

/* eslint-disable global-require */
const mocked = {
  field: require('./field'),
  button: require('./button'),
  layout: require('./layout'),
  i18n: require('./i18n'),
  dataSchema: require('./dataSchema'),
  testAttribute: require('./testAttribute'),
};
/* eslint-enable global-require */

describe('main transformer', () => {
  it('follows transformation steps', () => {
    jest.spyOn(mocked.field, 'transformFields');
    jest.spyOn(mocked.button, 'transformButtons');
    jest.spyOn(mocked.layout, 'transformLayout');
    jest.spyOn(mocked.i18n, 'transformI18n');
    jest.spyOn(mocked.dataSchema, 'transformDataSchema');
    jest.spyOn(mocked.testAttribute, 'transformTestAttribute');

    const mockOptions = {
      transaction: {},
    } as TransformationOptions;
    transformIdxTransaction(mockOptions);
    expect(mocked.field.transformFields).toHaveBeenCalledBefore(mocked.layout.transformLayout);
    // FIXME: custom layout should pick elements from translated buttons
    // expect(mocked.button.transformButtons).toHaveBeenCalledBefore(mocked.layout.transformLayout);
    expect(mocked.layout.transformLayout).toHaveBeenCalledBefore(mocked.i18n.transformI18n);
    expect(mocked.layout.transformLayout).toHaveBeenCalledBefore(
      mocked.dataSchema.transformDataSchema,
    );
    expect(mocked.layout.transformLayout).toHaveBeenCalledBefore(
      mocked.testAttribute.transformTestAttribute,
    );
  });
});
