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

import { APIError, Input } from '@okta/okta-auth-js';

import { RegistrationElementSchema } from '../../types';
import { convertIdxInputsToRegistrationSchema, convertRegistrationSchemaToIdxInputs, triggerRegistrationErrorMessages } from './registrationUtils';

describe('idx/registrationUtils', () => {
  describe('convertIdxInputsToRegistrationSchema', () => {
    it('should not perform conversion of Idx Inputs into Registration schema elements when input array is empty', () => {
      expect(convertIdxInputsToRegistrationSchema([])).toEqual([]);
    });

    it('should convert array of Idx Input objects into an array of Registration schema objects', () => {
      const inputs: Input[] = [
        {
          name: 'userProfile',
          value: [
            { name: 'firstName', label: 'First name', required: true },
            { name: 'lastName', label: 'Last name', required: true },
            { name: 'email', label: 'Email', required: true },
          ],
        },
        {
          name: 'credentials',
          value: [{
            name: 'passcode',
            label: 'Password',
            required: false,
            secret: true,
          }],
        },
      ];
      const schemaElements: RegistrationElementSchema[] = convertIdxInputsToRegistrationSchema(
        inputs,
      );

      expect(schemaElements.length).toBe(4);
      expect(schemaElements).toMatchSnapshot();
      expect(schemaElements[0].name).toBe('userProfile.firstName');
      expect(schemaElements[1].name).toBe('userProfile.lastName');
      expect(schemaElements[2].name).toBe('userProfile.email');
      expect(schemaElements[3].name).toBe('credentials.passcode');
    });
  });

  describe('convertRegistrationSchemaToIdxInputs', () => {
    it('should update Idx Inputs array with modified registration schema elements when adding new field and updating existing', () => {
      const inputs: Input[] = [
        {
          name: 'userProfile',
          value: [
            { name: 'firstName', label: 'First name', required: true },
            { name: 'lastName', label: 'Last name', required: true },
            { name: 'email', label: 'Email', required: true },
          ],
        },
        {
          name: 'credentials',
          value: [{
            name: 'passcode',
            label: 'Password',
            required: false,
            secret: true,
          }],
        },
      ];
      const schema: RegistrationElementSchema[] = [
        {
          name: 'userProfile.firstName',
          label: 'Given name',
          required: false,
          'label-top': true,
          'data-se': 'userProfile.firstName',
          wide: true,
        },
        {
          name: 'userProfile.lastName',
          label: 'Family name',
          required: false,
          'label-top': true,
          'data-se': 'userProfile.lastName',
          wide: true,
        },
        {
          name: 'userProfile.email',
          label: 'Company login',
          required: false,
          'label-top': true,
          'data-se': 'userProfile.email',
          wide: true,
        },
        {
          name: 'userProfile.favoriteCar',
          label: 'Favorite car',
          required: true,
          'label-top': true,
          'data-se': 'userProfile.favoriteCar',
          wide: true,
        },
        {
          name: 'credentials.passcode',
          label: 'Password',
          required: true,
          'label-top': true,
          'data-se': 'credentials.passcode',
          wide: true,
        },
      ];

      convertRegistrationSchemaToIdxInputs(schema, inputs);

      expect(inputs.length).toBe(2);
      expect((inputs[0].value as Input[]).length).toBe(4);
      expect((inputs[1].value as Input[]).length).toBe(1);
      expect(inputs).toMatchSnapshot();
      expect((inputs[0].value as Input[])[0].name).toBe('firstName');
      expect((inputs[0].value as Input[])[1].name).toBe('lastName');
      expect((inputs[0].value as Input[])[2].name).toBe('email');
      expect((inputs[0].value as Input[])[3].name).toBe('favoriteCar');
    });
  });

  describe('triggerRegistrationErrorMessages', () => {
    it('should trigger custom global registration error message when triggering error with errorSummary', () => {
      const mockSetMessageFn = jest.fn();
      const inputs: Input[] = [
        {
          name: 'userProfile',
          value: [
            { name: 'firstName', label: 'First name', required: true },
            { name: 'lastName', label: 'Last name', required: true },
            { name: 'email', label: 'Email', required: true },
          ],
        },
        {
          name: 'credentials',
          value: [{
            name: 'passcode',
            label: 'Password',
            required: false,
            secret: true,
          }],
        },
      ];
      triggerRegistrationErrorMessages({ errorSummary: 'This is a custom global error message' }, inputs, mockSetMessageFn);

      expect(mockSetMessageFn).toHaveBeenCalledWith({
        class: 'ERROR',
        i18n: { key: '' },
        message: 'This is a custom global error message',
      });
    });

    it('should trigger field level registration error messages when triggering error with errorCauses', () => {
      const mockSetMessageFn = jest.fn();
      const inputs: Input[] = [
        {
          name: 'userProfile',
          value: [
            { name: 'firstName', label: 'First name', required: true },
            { name: 'lastName', label: 'Last name', required: true },
            { name: 'email', label: 'Email', required: true },
          ],
        },
        {
          name: 'credentials',
          value: [{
            name: 'passcode',
            label: 'Password',
            required: false,
            secret: true,
          }],
        },
      ];
      triggerRegistrationErrorMessages(
        // @ts-expect-error property is expected in SIW but not defined in auth-js type
        { errorCauses: [{ property: 'userProfile.lastName', errorSummary: 'Custom field level error' }] },
        inputs,
        mockSetMessageFn,
      );

      // @ts-expect-error OKTA-539834 - messages missing from type
      expect((inputs[0].value as Input[])[1].messages?.value).toEqual([{
        class: 'ERROR', message: 'Custom field level error',
      }]);
      expect(mockSetMessageFn).toHaveBeenCalledWith({
        class: 'ERROR',
        i18n: { key: '' },
        message: 'oform.errorbanner.title',
      });
    });

    it('should trigger default global registration error message when triggering error without errorSummary', () => {
      const mockSetMessageFn = jest.fn();
      const inputs: Input[] = [
        {
          name: 'userProfile',
          value: [
            { name: 'firstName', label: 'First name', required: true },
            { name: 'lastName', label: 'Last name', required: true },
            { name: 'email', label: 'Email', required: true },
          ],
        },
        {
          name: 'credentials',
          value: [{
            name: 'passcode',
            label: 'Password',
            required: false,
            secret: true,
          }],
        },
      ];
      triggerRegistrationErrorMessages({ errorCode: 'E0047' } as APIError, inputs, mockSetMessageFn);

      expect(mockSetMessageFn).toHaveBeenCalledWith({
        class: 'ERROR',
        i18n: { key: '' },
        message: 'oform.errorbanner.title',
      });
    });
  });
});
