/* eslint-disable @okta/okta/no-unlocalized-text */
const templateHelper = require('../../../../config/templateHelper');

module.exports = [
  templateHelper({
    path: '/api/v1/registration/form',
    method: 'GET',
    template: JSON.stringify({
      policyId: 'regyb5XILfdDeLzm10g3',
      lastUpdate: 1634687026000,
      profileSchema: {
        properties: {
          firstName: {
            type: 'string',
            title: 'First name',
            minLength: 1,
            maxLength: 50,
            default: 'string'
          },
          lastName: {
            type: 'string',
            title: 'Last name',
            minLength: 1,
            maxLength: 50,
            default: 'string'
          },
          password: {
            type: 'string',
            title: 'Password',
            allOf: [
              {
                description: 'At least 8 character(s)',
                minLength: 8
              },
              {
                description: 'At least 1 number(s)',
                format: '/[\\d]+/'
              },
              {
                description: 'At least 1 lowercase letter(s)',
                format: '/[a-z]+/'
              },
              {
                description: 'At least 1 uppercase letter(s)',
                format: '/[A-Z]+/'
              },
              {
                description: 'Does not contain part of username',
                format: '/^[#/userName]/'
              }
            ],
            default: 'Password'
          },
          email: {
            type: 'email',
            title: 'Email',
            format: 'email',
            default: 'Email'
          }
        },
        required: [
          'email',
          'password',
          'firstName',
          'lastName'
        ],
        fieldOrder: [
          'email',
          'password',
          'firstName',
          'lastName'
        ]
      }
    })
  }),
];
