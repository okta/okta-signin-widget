/* eslint-disable @typescript-eslint/no-unused-vars */
import OktaSignIn, {
  FieldStringWithFormatAndEnum,
  RegistrationSchema,
  RegistrationData,
  RegistrationSchemaCallback,
  RegistrationDataCallback,
  RegistrationErrorCallback
} from '@okta/okta-signin-widget';
import { APIError } from '@okta/okta-auth-js';
import { expectType } from 'tsd';

// Test constructor with registration config


const signIn = new OktaSignIn({
  baseUrl: 'https://{yourOktaDomain}',
  registration: {
    click: () => {
      window.location.href = 'https://acme.com/sign-up';
    },
    parseSchema: (schema: RegistrationSchema, onSuccess: RegistrationSchemaCallback, _onFailure: RegistrationErrorCallback) => {
      schema.profileSchema.properties.address = {
        type: 'string',
        description: 'Street Address',
        default: 'Enter your street address',
        maxLength: 255
      };
      const countryCode: FieldStringWithFormatAndEnum = {
        type: 'country_code',
        enum: ['US', 'CA'],
        oneOf: [
          {title: 'Canada', const: 'CA'},
          {title: 'United States', const: 'US'},
        ]
      };
      schema.profileSchema.properties['country_code'] = countryCode;
      schema.profileSchema.fieldOrder.push('address');
      schema.profileSchema.required.push('country_code');
      onSuccess(schema);
    },
    preSubmit: (postData: RegistrationData, onSuccess: RegistrationDataCallback, onFailure: RegistrationErrorCallback) => {
      const username = <string> postData.username;
      if (username.indexOf('@acme.com') === -1) {
        postData.username += '@acme.com';
      }
      onSuccess(postData);
      const err: APIError = {
        errorSummary: 'API Error',
        errorCauses: [
          {
            domain: 'registration request',
            errorSummary: 'A user with this Email already exists',
            locationType: 'body',
            reason: 'UNIQUE_CONSTRAINT',
            location: 'email',
          }
        ]
      };
      onFailure(err);
    },
    postSubmit: (response, onSuccess, _onFailure) => {
      onSuccess(response);
    }
  },
});
expectType<OktaSignIn>(signIn);
