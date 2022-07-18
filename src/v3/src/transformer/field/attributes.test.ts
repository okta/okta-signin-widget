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

import { transformer } from './attributes';

describe('Attributes transformer', () => {
  it('should return uischema object with options.attributes.autocomplete === "username" if formfield.name === "identifier" is present in ion object', () => {
    const formfield: Input = { name: 'identifier' };

    const result = { attributes: { autocomplete: 'username' } };

    expect(transformer(formfield)).toEqual(result);
  });

  it('should return uischema object with options.attributes.autocomplete === "current-password" if formfield.name === "password" is present in ion object', () => {
    const formfield: Input = { name: 'password' };

    const result = { attributes: { autocomplete: 'current-password' } };

    expect(transformer(formfield)).toEqual(result);
  });

  it('should return uischema object with options.attributes.autocomplete === "current-password" if formfield.name === "newPassword" is present in ion object', () => {
    const formfield: Input = { name: 'newPassword' };

    const result = { attributes: { autocomplete: 'current-password' } };

    expect(transformer(formfield)).toEqual(result);
  });

  it('should return uischema object with options.attributes.autocomplete === "current-password" if formfield.name === "passcode" & formfield.secret === true is present in ion object', () => {
    const formfield: Input = { name: 'credentials.passcode', secret: true };

    const result = { attributes: { autocomplete: 'current-password' } };

    expect(transformer(formfield)).toEqual(result);
  });

  it('should return uischema object with options.attributes.autocomplete === "one-time-code" if formfield.name === "passcode" & secret property doesnt exist in ion object', () => {
    const formfield: Input = { name: 'credentials.passcode' };

    const result = { attributes: { autocomplete: 'one-time-code' } };

    expect(transformer(formfield)).toEqual(result);
  });

  it('should return uischema object with options.attributes.autocomplete === "one-time-code" if formfield.name === "totp" is present in ion object', () => {
    const formfield: Input = { name: 'totp' };

    const result = { attributes: { autocomplete: 'one-time-code' } };

    expect(transformer(formfield)).toEqual(result);
  });

  it('should return uischema object with options.attributes.autocomplete === "tel-national" if formfield.name === "phoneNumber" is present in ion object', () => {
    const formfield: Input = { name: 'phoneNumber' };

    const result = { attributes: { autocomplete: 'tel-national' } };

    expect(transformer(formfield)).toEqual(result);
  });
});
