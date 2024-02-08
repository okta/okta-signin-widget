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

import { getStubFormBag } from 'src/mocks/utils/utils';

import { TransformationOptions } from '../../types';
import { transformUISchema } from './transform';

jest.mock('./createTextElementKeys', () => ({
  createTextElementKeys: () => ({}),
}));
jest.mock('./updateElementKeys', () => ({
  updateElementKeys: () => () => ({}),
}));
jest.mock('./addIdToElements', () => ({
  addIdToElements: () => ({}),
}));
jest.mock('./updateCustomFields', () => ({
  updateCustomFields: () => ({}),
}));
jest.mock('./setFocusOnFirstElement', () => ({
  setFocusOnFirstElement: () => ({}),
}));
jest.mock('./applyAsteriskToFieldElements', () => ({
  applyAsteriskToFieldElements: () => () => ({}),
}));
jest.mock('./updatePasswordDescribedByValue', () => ({
  updatePasswordDescribedByValue: () => ({}),
}));
jest.mock('./overwriteAutocomplete', () => ({
  overwriteAutocomplete: () => () => ({}),
}));
jest.mock('./createIdentifierContainer', () => ({
  createIdentifierContainer: () => () => ({}),
}));

/* eslint-disable global-require */
const mocked = {
  createTextEleKey: require('./createTextElementKeys'),
  updateEleKey: require('./updateElementKeys'),
  addIdToEle: require('./addIdToElements'),
  updateCustomField: require('./updateCustomFields'),
  setFocus: require('./setFocusOnFirstElement'),
  applyAsterisk: require('./applyAsteriskToFieldElements'),
  updatePasswordEle: require('./updatePasswordDescribedByValue'),
  overwriteAutocomplete: require('./overwriteAutocomplete'),
  createIdentifierContainer: require('./createIdentifierContainer'),
};
/* eslint-enable global-require */

describe('UISchema transformer', () => {
  it('follows transformation steps', () => {
    jest.spyOn(mocked.createTextEleKey, 'createTextElementKeys');
    jest.spyOn(mocked.updateEleKey, 'updateElementKeys');
    jest.spyOn(mocked.addIdToEle, 'addIdToElements');
    jest.spyOn(mocked.updateCustomField, 'updateCustomFields');
    jest.spyOn(mocked.setFocus, 'setFocusOnFirstElement');
    jest.spyOn(mocked.applyAsterisk, 'applyAsteriskToFieldElements');
    jest.spyOn(mocked.updatePasswordEle, 'updatePasswordDescribedByValue');
    jest.spyOn(mocked.overwriteAutocomplete, 'overwriteAutocomplete');
    jest.spyOn(mocked.createIdentifierContainer, 'createIdentifierContainer');

    const formBag = getStubFormBag();
    const mockOptions = {
      transaction: {},
      widgetProps: {},
    } as TransformationOptions;
    transformUISchema(mockOptions)(formBag);

    expect(mocked.updateEleKey.updateElementKeys)
      .toHaveBeenCalledBefore(mocked.addIdToEle.addIdToElements);
    expect(mocked.addIdToEle.addIdToElements)
      .toHaveBeenCalledBefore(
        mocked.updatePasswordEle.updatePasswordDescribedByValue,
      );

    expect(mocked.createTextEleKey.createTextElementKeys).toHaveBeenCalled();
    expect(mocked.updateEleKey.updateElementKeys).toHaveBeenCalled();
    expect(mocked.addIdToEle.addIdToElements).toHaveBeenCalled();
    expect(mocked.updateCustomField.updateCustomFields).toHaveBeenCalled();
    expect(mocked.setFocus.setFocusOnFirstElement).toHaveBeenCalled();
    expect(mocked.applyAsterisk.applyAsteriskToFieldElements).toHaveBeenCalled();
    expect(mocked.updatePasswordEle.updatePasswordDescribedByValue).toHaveBeenCalled();
    expect(mocked.overwriteAutocomplete.overwriteAutocomplete).toHaveBeenCalled();
    expect(mocked.createIdentifierContainer.createIdentifierContainer).toHaveBeenCalled();
  });
});
