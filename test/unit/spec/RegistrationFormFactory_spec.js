/* eslint max-statements: [2, 22]*/
import { internal } from 'okta';
import RegistrationFormFactory from 'v1/util/RegistrationFormFactory';
let { SchemaProperty } = internal.models;

describe('RegistrationFormFactory', function() {
  let testContext;
  describe('string field', function() {
    beforeEach(function() {
      testContext = {};
      const schemaProperty = new SchemaProperty.Model(
        {
          name: 'stringfield',
          title: 'Test Property',
          type: 'string',
          description: 'this is description',
        },
        { parse: true }
      );

      testContext.inputOptions = RegistrationFormFactory.createInputOptions(schemaProperty);
    });

    it('type is text', function() {
      expect(testContext.inputOptions['type']).toEqual('text');
    });

    it('no label', function() {
      expect(testContext.inputOptions['label']).toBe(false);
    });

    it('label-top is true', function() {
      expect(testContext.inputOptions['label-top']).toBe(true);
    });

    it('placeholder is the title', function() {
      expect(testContext.inputOptions['placeholder']).toEqual('Test Property');
    });
  });

  describe('enum field', function() {
    beforeEach(function() {
      const schemaProperty = new SchemaProperty.Model(
        {
          name: 'enumfield',
          type: 'string',
          title: 'Flavor Fruit',
          description: 'flavor fruit',
          enum: ['Apple', 'Banana', 'Cherry'],
        },
        { parse: true }
      );

      testContext.inputOptions = RegistrationFormFactory.createInputOptions(schemaProperty);
    });

    it('label is the title', function() {
      expect(testContext.inputOptions['label']).toEqual('Flavor Fruit');
    });

    it('label-top is not set', function() {
      expect(testContext.inputOptions['label-top']).toBeUndefined();
    });

    it('placeholder is not set', function() {
      expect(testContext.inputOptions['placeholder']).toBeUndefined();
    });
  });

  describe('field name is userName', function() {
    beforeEach(function() {
      const schemaProperty = new SchemaProperty.Model(
        {
          name: 'userName',
          type: 'string',
        },
        { parse: true }
      );

      testContext.inputOptions = RegistrationFormFactory.createInputOptions(schemaProperty);
    });

    it('icon is person-16-gray', function() {
      expect(testContext.inputOptions['params'].icon).toEqual('person-16-gray');
    });
  });

  describe('field name is password', function() {
    beforeEach(function() {
      const schemaProperty = new SchemaProperty.Model(
        {
          name: 'password',
          type: 'string',
        },
        { parse: true }
      );

      testContext.inputOptions = RegistrationFormFactory.createInputOptions(schemaProperty);
    });

    it('type is password', function() {
      expect(testContext.inputOptions['type']).toEqual('password');
    });

    it('icon is remote-lock-16', function() {
      expect(testContext.inputOptions['params'].icon).toEqual('remote-lock-16');
    });
  });

  describe('Get username parts', function() {
    it('gives the right username parts', function() {
      let result = RegistrationFormFactory.getUsernameParts('first-last.name@okta.com');

      expect(result).toEqual(['first', 'last', 'name', 'okta', 'com']);

      result = RegistrationFormFactory.getUsernameParts('first-name@okta.com');
      expect(result).toEqual(['first', 'name', 'okta', 'com']);

      result = RegistrationFormFactory.getUsernameParts('firstname@okta.com');
      expect(result).toEqual(['firstname', 'okta', 'com']);

      result = RegistrationFormFactory.getUsernameParts('first_name@okta.com');
      expect(result).toEqual(['first', 'name', 'okta', 'com']);

      result = RegistrationFormFactory.getUsernameParts('username');
      expect(result).toEqual(['username']);

      result = RegistrationFormFactory.getUsernameParts('user#name@okta.com');
      expect(result).toEqual(['user', 'name', 'okta', 'com']);

      result = RegistrationFormFactory.getUsernameParts('user#name@okta#%com');
      expect(result).toEqual(['user', 'name', 'okta', '%com']);

      result = RegistrationFormFactory.getUsernameParts('#-name@okta.com');
      expect(result).toEqual(['name', 'okta', 'com']);

      result = RegistrationFormFactory.getUsernameParts('first_name-@okta#');
      expect(result).toEqual(['first', 'name', 'okta']);

      result = RegistrationFormFactory.getUsernameParts('a-');
      expect(result.length).toEqual(0);

      result = RegistrationFormFactory.getUsernameParts('#a_');
      expect(result.length).toEqual(0);
    });
  });

  describe('PasswordContainsFormField', function() {
    it('returns false if password does not contain username or no username ', function() {
      expect(RegistrationFormFactory.passwordContainsFormField('administrator1', 'Abcd1234')).toEqual(false);
      expect(RegistrationFormFactory.passwordContainsFormField(null, 'Abcd1234')).toEqual(false);
    });
    it('returns true if password does contain username ', function() {
      expect(RegistrationFormFactory.passwordContainsFormField('abcd@okta.com', 'Abcd1234')).toEqual(true);
      expect(RegistrationFormFactory.passwordContainsFormField('abc', 'abc')).toEqual(true);
      expect(RegistrationFormFactory.passwordContainsFormField('abc', 'abc@okta.com')).toEqual(true);
    });
  });
});
