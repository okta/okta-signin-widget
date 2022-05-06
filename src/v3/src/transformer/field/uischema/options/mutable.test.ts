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

import { transformer } from 'src/transformer/field/uischema/options/mutable';
import { IonFormField } from 'src/types/ion';

describe('mutable transformer', () => {
  it('should return uischema object with options.readonly === true if formfield.mutable === false is present in ion object', () => {
    const formfield: IonFormField = { name: 'testField', mutable: false };

    const result = { readonly: true };

    expect(transformer(formfield)).toEqual(result);
  });

  it('should return uischema object with options.readonly === false if formfield.mutable === true is present in ion object', () => {
    const formfield: IonFormField = { name: 'testField', mutable: true };
    const result = { readonly: false };

    expect(transformer(formfield)).toEqual(result);
  });

  it('should return null if formfield does not include "mutable" field', () => {
    const formfieldHasNotMutable: IonFormField = { name: 'testField' };
    const result = null;

    expect(transformer(formfieldHasNotMutable)).toEqual(result);
  });
});
