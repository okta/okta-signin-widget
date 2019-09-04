import { Collection } from 'okta';
import FactorEnrollOptions from 'v2/view-builder/components/FactorOptions';
import FormInputFactory from 'v2/view-builder/internals/FormInputFactory';

describe('v2/view-builder/internals/FormInputFactory', function () {
  it('handles text type', function () {
    const opt = {
      type: 'text'
    };
    expect(FormInputFactory.create(opt)).toEqual({
      type: 'text',
      'label-top': true,
    });
    expect(opt).toEqual({
      type: 'text',
    });
  });

  it('handles password type', function () {
    const opt = {
      type: 'password'
    };
    expect(FormInputFactory.create(opt)).toEqual({
      type: 'password',
      'label-top': true,
    });
    expect(opt).toEqual({
      type: 'password',
    });
  });

  it('handles factorType type', function () {
    const opt = {
      type: 'factorType',
      options: [
        {
          'label': 'Password',
          'value': 'password'
        },
        {
          'label': 'E-mail',
          'value': 'email'
        }
      ],
      name: 'factorType'
    };
    const result = FormInputFactory.create(opt);
    expect(result).toEqual({
      View: FactorEnrollOptions,
      options: {
        collection: jasmine.anything(),
        name: 'factorType'
      },
    });
    expect(result.options.collection instanceof Collection).toBe(true);
    expect(result.options.collection.toJSON()).toEqual([
      {
        'label': 'Password',
        'value': 'password',
        iconClassName: 'mfa-okta-password',
        description: ''
      },
      {
        'label': 'Email Authentication',
        'value': 'email',
        iconClassName: 'mfa-okta-email',
        description: ''
      }
    ]);
    expect(opt).toEqual({
      type: 'factorType',
      options: [
        {
          'label': 'Password',
          'value': 'password'
        },
        {
          'label': 'E-mail',
          'value': 'email'
        }
      ],
      name: 'factorType'
    });
  });
});
