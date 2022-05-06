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

import { transformer } from 'src/transformer/field/uischema/label';
import { IonFormField } from 'src/types/ion';

describe('"label" field transformer', () => {
  it('should copy label value', () => {
    const formfield: IonFormField = { name: 'testField', label: 'label' };
    const result = 'label';
    expect(transformer(formfield)).toEqual(result);
  });

  it('should return IonFormField name if label not present', () => {
    const formfield: IonFormField = { name: 'testField' };
    const result = 'testField';

    expect(transformer(formfield)).toEqual(result);
  });
});
