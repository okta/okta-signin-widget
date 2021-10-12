import { BaseModel } from 'v2/view-builder/internals';

describe('v2/view-builder/internals/BaseModel', function() {
  const createModelAndVerifyPropsAndLocal = ({ uiSchema, optionUiSchemaConfig }, props, local = {}) => {
    const result = BaseModel.create({ uiSchema }, optionUiSchemaConfig);
    expect(result.prototype.props).toEqual(props);
    expect(result.prototype.local).toEqual(
      {
        formName: 'string',
        useRedirect: 'boolean',
        ...local
      }
    );
  };

  it('shall create Model - passcode', function() {
    const uiSchema = [
      {
        name: 'credentials.passcode',
        label: 'One-time verification code',
        secret: true,
        'label-top': true,
        type: 'password',
        params: {
          showPasswordToggle: true,
        },
      },
    ];

    createModelAndVerifyPropsAndLocal(
      { uiSchema },
      {
        'credentials.passcode': {
          type: 'string', required: false, validate: expect.any(Function)
        },
      }
    );
  });

  it('shall create Model - profile enroll', function() {
    const uiSchema = [
      {
        name: 'userProfile.lastName',
        label: 'Last name',
        required: true,
        'label-top': true,
        type: 'text',
      },
      {
        name: 'userProfile.firstName',
        label: 'First name',
        'label-top': true,
        required: true,
        type: 'text',
      },
      {
        name: 'userProfile.email',
        label: 'Email',
        'label-top': true,
        required: true,
        type: 'text',
      },
    ];

    createModelAndVerifyPropsAndLocal(
      { uiSchema },
      {
        'userProfile.lastName': { type: 'string', required: true },
        'userProfile.firstName': { type: 'string', required: true },
        'userProfile.email': { type: 'string', required: true },
      }
    );
  });

  it('shall create Model - identify', function() {
    const uiSchema = [
      {
        name: 'identifier',
        label: 'Username',
        type: 'text',
        'label-top': true,
      },
      {
        name: 'rememberMe',
        label: false,
        type: 'checkbox',
        placeholder: 'Remember Me',
        modelType: 'boolean',
        required: false,
        'label-top': true,
      },
    ];

    createModelAndVerifyPropsAndLocal(
      { uiSchema },
      {
        identifier: { type: 'string', required: false, validate: expect.any(Function) },
        rememberMe: { type: 'boolean', required: false },
      }
    );
  });

  it('shall create Model - enroll phone', function() {
    const uiSchema = [
      {
        name: 'authenticator.id',
        value: 'aid568g3mXgtID0X1SLH',
        mutable: false,
        visible: false,
        required: true,
        'label-top': true,
        type: 'text',
      },
      {
        name: 'authenticator.methodType',
        required: true,
        options: [
          {
            label: 'SMS',
            value: 'sms',
          },
          {
            label: 'VOICE',
            value: 'voice',
          },
        ],
        'label-top': true,
        type: 'radio',
      },
      {
        name: 'authenticator.phoneNumber',
        required: true,
        type: 'text',
        'label-top': true,
      },
    ];

    createModelAndVerifyPropsAndLocal(
      { uiSchema },
      {
        'authenticator.id': { type: 'string', required: true, value: 'aid568g3mXgtID0X1SLH' },
        'authenticator.methodType': { type: 'string', required: true },
        'authenticator.phoneNumber': { type: 'string', required: true },
      }
    );
  });

  it('shall create Model - enroll security question', function() {
    const uiSchema = [
      {
        name: 'sub_schema_local_credentials',
        type: 'radio',
        required: true,
        options: [
          {
            label: 'Choose a security question',
            value: 0,
          },
          {
            label: 'Create my own security question',
            value: 1,
          },
        ],
        'label-top': true,
        optionsUiSchemas: [
          [
            {
              name: 'credentials.questionKey',
              type: 'select',
              required: true,
              label: 'Choose a security question',
              options: {
                'disliked_food': 'What is the food you least liked as a child?',
                'name_of_first_plush_toy': 'What is the name of your first stuffed animal?',
                'favorite_vacation_location': 'Where did you go for your favorite vacation?',
              },
              'label-top': true,
              wide: true,
            },
            {
              name: 'credentials.answer',
              label: 'Answer',
              required: true,
              secret: true,
              'label-top': true,
              type: 'password',
              params: {
                showPasswordToggle: true,
              },
            },
          ],
          [
            {
              name: 'credentials.questionKey',
              required: true,
              value: 'custom',
              mutable: false,
              'label-top': true,
              type: 'text',
            },
            {
              name: 'credentials.question',
              label: 'Create a security question',
              required: true,
              'label-top': true,
              type: 'text',
            },
            {
              name: 'credentials.answer',
              label: 'Answer',
              required: true,
              secret: true,
              'label-top': true,
              type: 'password',
              params: {
                showPasswordToggle: true,
              },
            },
          ],
        ],
        value: '0',
      },
    ];

    // model for option 1
    createModelAndVerifyPropsAndLocal(
      { uiSchema },
      {
        'credentials.questionKey': { type: 'string', required: true },
        'credentials.answer': { type: 'string', required: true },
      },
      {
        'sub_schema_local_credentials': { type: 'string', value: '0', required: true },
      }
    );

    // model for option 2
    createModelAndVerifyPropsAndLocal(
      {
        uiSchema,
        optionUiSchemaConfig: {
          'sub_schema_local_credentials': '1',
        },
      },
      {
        'credentials.questionKey': { type: 'string', required: true, value: 'custom' },
        'credentials.question': { type: 'string', required: true },
        'credentials.answer': { type: 'string', required: true },
      },
      {
        'sub_schema_local_credentials': { type: 'string', value: '1', required: true },
      }
    );
  });

  it('shall create Model - authenticator list', function() {
    const uiSchema = [
      {
        name: 'authenticator',
        type: 'authenticatorSelect',
        required: true,
        'label-top': true,
        modelType: 'object',
        options: [
          {
            label: 'Okta Password',
            value: {
              id: 'autwa6eD9o02iBbtv0g3',
            },
            authenticatorKey: 'okta_password',
          },
          {
            label: 'Okta Phone',
            value: {
              id: 'aid568g3mXgtID0X1SLH',
            },
            authenticatorKey: 'phone_number',
          },
          {
            label: 'Security Key or Biometric Authenticator (FIDO2)',
            value: {
              id: 'aidtheidkwh282hv8g3',
            },
            authenticatorKey: 'webauthn',
          },
          {
            label: 'Okta Security Question',
            value: {
              id: 'aid568g3mXgtID0X1GGG',
            },
            authenticatorKey: 'security_question',
          },
        ],
      },
    ];

    createModelAndVerifyPropsAndLocal(
      { uiSchema },
      {
        authenticator: { type: 'object', required: true },
      }
    );
  });
});
