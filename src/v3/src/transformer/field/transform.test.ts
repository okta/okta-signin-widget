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

import { Input, NextStep } from '@okta/okta-auth-js';

import { getStubFormBag } from '../../mocks/utils/utils';
import { FormBag, WidgetProps } from '../../types';
import { transformStepInputs } from './transform';

describe('transformStepInputs', () => {
  let formBag: FormBag;
  let widgetProps: WidgetProps;

  beforeEach(() => {
    formBag = getStubFormBag();
    widgetProps = {} as WidgetProps;
  });

  describe('string field initialization', () => {
    it('should initialize string fields with empty string when no value is present', () => {
      const step: NextStep = {
        name: 'identify',
        inputs: [
          {
            name: 'identifier',
            type: 'string',
            required: true,
            visible: true,
            mutable: true,
          } as Input,
        ],
      };

      const result = transformStepInputs(formBag, widgetProps, step);

      expect(result.data['identifier']).toBe('');
    });

    it('should initialize string fields with existing value when present', () => {
      const step: NextStep = {
        name: 'identify',
        inputs: [
          {
            name: 'identifier',
            type: 'string',
            value: 'test@example.com',
            required: true,
            visible: true,
            mutable: true,
          } as Input,
        ],
      };

      const result = transformStepInputs(formBag, widgetProps, step);

      expect(result.data['identifier']).toBe('test@example.com');
    });

    it('should always initialize credentials.passcode with empty string regardless of existing value', () => {
      const step: NextStep = {
        name: 'challenge-authenticator',
        inputs: [
          {
            name: 'credentials.passcode',
            // type might not always be set, so test without it
            value: 'old-password',
            required: true,
            visible: true,
            mutable: true,
          } as Input,
        ],
      };

      const result = transformStepInputs(formBag, widgetProps, step);

      expect(result.data['credentials.passcode']).toBe('');
    });

    it('should initialize multiple string fields correctly', () => {
      const step: NextStep = {
        name: 'enroll-profile',
        inputs: [
          {
            name: 'userProfile.firstName',
            type: 'string',
            value: 'John',
            required: true,
            visible: true,
            mutable: true,
          } as Input,
          {
            name: 'userProfile.lastName',
            type: 'string',
            required: true,
            visible: true,
            mutable: true,
          } as Input,
          {
            name: 'credentials.passcode',
            // type might not always be set, test without explicit type
            value: 'should-be-cleared',
            required: true,
            visible: true,
            mutable: true,
          } as Input,
        ],
      };

      const result = transformStepInputs(formBag, widgetProps, step);

      expect(result.data['userProfile.firstName']).toBe('John');
      expect(result.data['userProfile.lastName']).toBe('');
      expect(result.data['credentials.passcode']).toBe('');
    });
  });

  describe('boolean field initialization', () => {
    it('should initialize required boolean fields with false when value is not true', () => {
      const step: NextStep = {
        name: 'consent',
        inputs: [
          {
            name: 'consent',
            type: 'boolean',
            required: true,
            visible: true,
            mutable: true,
          } as Input,
        ],
      };

      const result = transformStepInputs(formBag, widgetProps, step);

      expect(result.data['consent']).toBe(false);
    });

    it('should initialize required boolean fields with true when value is true', () => {
      const step: NextStep = {
        name: 'consent',
        inputs: [
          {
            name: 'consent',
            type: 'boolean',
            value: true as unknown,
            required: true,
            visible: true,
            mutable: true,
          } as Input,
        ],
      };

      const result = transformStepInputs(formBag, widgetProps, step);

      expect(result.data['consent']).toBe(true);
    });
  });

  describe('field visibility and mutability', () => {
    it('should not add invisible fields to the form', () => {
      const step: NextStep = {
        name: 'test',
        inputs: [
          {
            name: 'hiddenField',
            type: 'string',
            visible: false,
            mutable: true,
          } as Input,
        ],
      };

      const result = transformStepInputs(formBag, widgetProps, step);

      expect(result.data['hiddenField']).toBeUndefined();
      expect(result.uischema.elements.length).toBe(0);
    });

    it('should add visible and mutable fields to the form', () => {
      const step: NextStep = {
        name: 'test',
        inputs: [
          {
            name: 'visibleField',
            type: 'string',
            visible: true,
            mutable: true,
          } as Input,
        ],
      };

      const result = transformStepInputs(formBag, widgetProps, step);

      expect(result.data['visibleField']).toBe('');
      expect(result.uischema.elements.length).toBe(1);
    });
  });

  describe('mixed field types', () => {
    it('should handle a mix of string and boolean fields', () => {
      const step: NextStep = {
        name: 'mixed',
        inputs: [
          {
            name: 'username',
            type: 'string',
            value: 'testuser',
            required: true,
            visible: true,
            mutable: true,
          } as Input,
          {
            name: 'rememberMe',
            type: 'boolean',
            value: true as unknown,
            required: true, // Only required boolean fields are initialized
            visible: true,
            mutable: true,
          } as Input,
          {
            name: 'password',
            type: 'string',
            required: true,
            visible: true,
            mutable: true,
          } as Input,
        ],
      };

      const result = transformStepInputs(formBag, widgetProps, step);

      expect(result.data['username']).toBe('testuser');
      expect(result.data['rememberMe']).toBe(true);
      expect(result.data['password']).toBe('');
    });
  });

  describe('edge cases', () => {
    it('should return formbag unchanged when step is undefined', () => {
      const result = transformStepInputs(formBag, widgetProps, undefined);

      expect(result).toBe(formBag);
      expect(result.data).toEqual({});
    });

    it('should handle step with no inputs', () => {
      const step: NextStep = {
        name: 'empty-step',
        inputs: [],
      };

      const result = transformStepInputs(formBag, widgetProps, step);

      expect(result.data).toEqual({});
      expect(result.uischema.elements.length).toBe(0);
    });

    it('should handle null values for string fields', () => {
      const step: NextStep = {
        name: 'test',
        inputs: [
          {
            name: 'nullField',
            type: 'string',
            value: null as unknown,
            required: false,
            visible: true,
            mutable: true,
          } as Input,
        ],
      };

      const result = transformStepInputs(formBag, widgetProps, step);

      expect(result.data['nullField']).toBe('');
    });
  });
});
