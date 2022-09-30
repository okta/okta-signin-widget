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

import { IdxStatus, IdxTransaction } from '@okta/okta-auth-js';

import { getStubFormBag, getStubTransaction } from '../../mocks/utils/utils';
import { transformEmailMagicLinkOTPOnly } from './transformEmailMagicLinkOTPOnlyElements';

describe('Email Magic Link OTP Only Transformer Tests', () => {
  let transaction: IdxTransaction;
  const formBag = getStubFormBag();
  const mockOTP = '123456';
  const mockAppName = 'My test app';

  beforeEach(() => {
    formBag.uischema.elements = [];
    transaction = getStubTransaction(IdxStatus.TERMINAL);
    transaction.messages = [];
    transaction.context = {
      app: {
        type: 'object',
        value: { label: mockAppName },
      },
      // @ts-ignore TODO: OKTA-504300 'client' does not exist on IdxContext interface
      client: {
        type: 'object',
        value: {
          browser: 'FIREFOX',
          os: 'iOS',
          location: {
            country: 'Canada',
            countryISO: 'CA',
            city: 'Toronto',
            postal: 'M9M',
            latitude: 12.3456,
            longitude: -98.7654,
            state: 'Ontario',
          },
        },
      },
      currentAuthenticator: {
        // @ts-ignore TODO: OKTA-504299 otp missing from contextualData interface
        value: { contextualData: { otp: mockOTP } },
      },
      intent: 'AUTHENTICATION',
    };
  });

  it('should add default instructions, otp and warning text when client, app, and intent data'
    + ' are missing from context', () => {
    transaction.context = {
      currentAuthenticator: {
        // @ts-ignore TODO: OKTA-504299 otp missing from contextualData interface
        value: { contextualData: { otp: mockOTP } },
      },
    };
    const updatedFormBag = transformEmailMagicLinkOTPOnly(transaction, formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add sign-in instructions (with auth intent), otp and warning text'
    + ' when client & app data are missing from context', () => {
    transaction.context = {
      currentAuthenticator: {
        // @ts-ignore TODO: OKTA-504299 otp missing from contextualData interface
        value: { contextualData: { otp: mockOTP } },
      },
      intent: 'AUTHENTICATION',
    };
    const updatedFormBag = transformEmailMagicLinkOTPOnly(transaction, formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add sign up instructions (with enroll intent), otp and warning text'
    + ' when client & app data are missing from context', () => {
    transaction.context = {
      currentAuthenticator: {
        // @ts-ignore TODO: OKTA-504299 otp missing from contextualData interface
        value: { contextualData: { otp: mockOTP } },
      },
      intent: 'ENROLLMENT',
    };
    const updatedFormBag = transformEmailMagicLinkOTPOnly(transaction, formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add password reset instructions (with recovery intent), otp and warning text'
    + ' when client & app dataare missing from context', () => {
    transaction.context = {
      currentAuthenticator: {
        // @ts-ignore TODO: OKTA-504299 otp missing from contextualData interface
        value: { contextualData: { otp: mockOTP } },
      },
      intent: 'RECOVERY',
    };
    const updatedFormBag = transformEmailMagicLinkOTPOnly(transaction, formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add unlock acct instructions (with unlock intent), otp and warning text'
    + ' when client & app dataare missing from context', () => {
    transaction.context = {
      currentAuthenticator: {
        // @ts-ignore TODO: OKTA-504299 otp missing from contextualData interface
        value: { contextualData: { otp: mockOTP } },
      },
      intent: 'UNLOCK_ACCOUNT',
    };
    const updatedFormBag = transformEmailMagicLinkOTPOnly(transaction, formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add sign-in instructions, otp, warning and app info only'
    + ' when client data is missing from context', () => {
    transaction.context = {
      currentAuthenticator: {
        // @ts-ignore TODO: OKTA-504299 otp missing from contextualData interface
        value: { contextualData: { otp: mockOTP } },
      },
      app: {
        type: 'object',
        value: { label: mockAppName },
      },
      intent: 'AUTHENTICATION',
    };
    const updatedFormBag = transformEmailMagicLinkOTPOnly(transaction, formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add sign-in instructions, otp, warning, app info, and browser info'
    + ' when all data exists except for location in context', () => {
    transaction.context = {
      currentAuthenticator: {
        // @ts-ignore TODO: OKTA-504299 otp missing from contextualData interface
        value: { contextualData: { otp: mockOTP } },
      },
      app: {
        type: 'object',
        value: { label: mockAppName },
      },
      client: {
        type: 'object',
        value: {
          browser: 'FIREFOX',
          os: 'iOS',
        },
      },
      intent: 'AUTHENTICATION',
    };
    const updatedFormBag = transformEmailMagicLinkOTPOnly(transaction, formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(6);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add sign-in instructions, otp, warning, app info, and browser info'
    + ' and partial location when all data exists except for state in context', () => {
    transaction.context = {
      currentAuthenticator: {
        // @ts-ignore TODO: OKTA-504299 otp missing from contextualData interface
        value: { contextualData: { otp: mockOTP } },
      },
      app: {
        type: 'object',
        value: { label: mockAppName },
      },
      // @ts-ignore TODO: OKTA-504300 'client' does not exist on IdxContext interface
      client: {
        type: 'object',
        value: {
          browser: 'FIREFOX',
          os: 'iOS',
          location: {
            country: 'Canada',
            countryISO: 'CA',
            city: 'Toronto',
            postal: 'M9M',
            latitude: 12.3456,
            longitude: -98.7654,
          },
        },
      },
      intent: 'AUTHENTICATION',
    };
    const updatedFormBag = transformEmailMagicLinkOTPOnly(transaction, formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect(updatedFormBag).toMatchSnapshot();
  });

  it('should add sign-in instructions, otp, warning, app info, browser info, and location'
    + ' when all expected data exists in context', () => {
    const updatedFormBag = transformEmailMagicLinkOTPOnly(transaction, formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect(updatedFormBag).toMatchSnapshot();
  });
});
