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

import { Input } from '@okta/okta-auth-js';
import { transformer } from 'src/transformer/field/uischema/options/secret';

describe('"secret" field transformer', () => {
  it('should return uischema object with options.secret === true field inside if formfield.secret === true', () => {
    const formfield: Input = { name: 'testField', secret: true };
    const result = { secret: true };
    expect(transformer(formfield)).toEqual(result);
  });

  it('should return null if formfield not include "secret" field or formfield.secret === false', () => {
    const formfieldSecretFalse: Input = { name: 'testField', secret: false };
    const formfieldNoneSecret: Input = { name: 'testField' };
    const result = null;

    expect(transformer(formfieldSecretFalse)).toEqual(result);
    expect(transformer(formfieldNoneSecret)).toEqual(result);
  });
});
