/* eslint max-statements: [2, 22]*/
import { internal } from '@okta/courage';
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

      expect(result).toEqual(['first', 'last', 'name', 'okta']);

      result = RegistrationFormFactory.getUsernameParts('first-name@okta.com');
      expect(result).toEqual(['first', 'name', 'okta']);

      result = RegistrationFormFactory.getUsernameParts('firstname@okta.com');
      expect(result).toEqual(['firstname', 'okta']);

      result = RegistrationFormFactory.getUsernameParts('first_name@okta.com');
      expect(result).toEqual(['first', 'name', 'okta']);

      result = RegistrationFormFactory.getUsernameParts('username');
      expect(result).toEqual(['username']);

      result = RegistrationFormFactory.getUsernameParts('user#name@okta.com');
      expect(result).toEqual(['user', 'name', 'okta']);

      result = RegistrationFormFactory.getUsernameParts('user#name@okta#%com');
      expect(result).toEqual(['user', 'name', 'okta', '%com']);

      result = RegistrationFormFactory.getUsernameParts('#-name@okta.com');
      expect(result).toEqual(['name', 'okta']);

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
      expect(RegistrationFormFactory.passwordContainsFormField('abcd@okta.com', 'Welcome123')).toEqual(false);
      expect(RegistrationFormFactory.passwordContainsFormField('abc', 'abc')).toEqual(false);
    });
    it('returns true if password does contain username ', function() {
      expect(RegistrationFormFactory.passwordContainsFormField('abcd@okta.com', 'Abcd1234')).toEqual(true);
      expect(RegistrationFormFactory.passwordContainsFormField('abcd', 'abcd@okta.com')).toEqual(true);
    });
  });

  // New tests for checkSubSchema logic
  describe('checkSubSchema', function() {
    const { checkSubSchema } = RegistrationFormFactory;
    function makeSubSchema(cfg) {
      return { get: (k) => cfg[k] }; // minimal interface
    }
    function makeModel(data) {
      return {
        get: (k) => data[k],
        has: (k) => Object.prototype.hasOwnProperty.call(data, k)
      };
    }

    describe('special format userName', function() {
      const format = '^[#/userName]';
      it('returns false when password contains a username part', function() {
        const sub = makeSubSchema({ format });
        const model = makeModel({ userName: 'abcd@example.com' });
        // password contains "Abcd" (case-insensitive via passwordContainsFormField)
        expect(checkSubSchema(sub, 'MyAbcdPassword1', model)).toBe(false);
      });

      it('falls back to email when userName absent', function() {
        const sub = makeSubSchema({ format });
        const model = makeModel({ email: 'user@example.com' });
        expect(checkSubSchema(sub, 'userPASS12', model)).toBe(false); // contains user
      });

      it('returns true when password does not contain any username parts', function() {
        const sub = makeSubSchema({ format });
        const model = makeModel({ userName: 'longusername@example.com' });
        expect(checkSubSchema(sub, 'NoOverlap123!', model)).toBe(true);
      });
    });

    describe('special format firstName', function() {
      const format = '^[#/firstName]';
      it('returns false when password contains firstName substring (case-sensitive)', function() {
        const sub = makeSubSchema({ format });
        const model = makeModel({ firstName: 'John' });
        expect(checkSubSchema(sub, 'MyJohnPassword', model)).toBe(false);
      });

      it('returns true when password does not contain firstName', function() {
        const sub = makeSubSchema({ format });
        const model = makeModel({ firstName: 'John' });
        expect(checkSubSchema(sub, 'SecurePwd123', model)).toBe(true);
      });

      it('returns true when firstName is undefined', function() {
        const sub = makeSubSchema({ format });
        const model = makeModel({});
        expect(checkSubSchema(sub, 'AnyPassword123', model)).toBe(true);
      });

      it('returns true when firstName is empty string', function() {
        const sub = makeSubSchema({ format });
        const model = makeModel({ firstName: '' });
        expect(checkSubSchema(sub, 'AnyPassword123', model)).toBe(true);
      });
    });

    describe('special format lastName', function() {
      const format = '^[#/lastName]';
      it('returns false when password contains lastName', function() {
        const sub = makeSubSchema({ format });
        const model = makeModel({ lastName: 'Smith' });
        expect(checkSubSchema(sub, 'xSmithy123', model)).toBe(false);
      });

      it('returns true when password does not contain lastName', function() {
        const sub = makeSubSchema({ format });
        const model = makeModel({ lastName: 'Smith' });
        expect(checkSubSchema(sub, 'Different123', model)).toBe(true);
      });
      it('returns true when lastName is undefined', function() {
        const sub = makeSubSchema({ format });
        const model = makeModel({});
        expect(checkSubSchema(sub, 'AnyPassword123', model)).toBe(true);
      });

      it('returns true when firstName is empty string', function() {
        const sub = makeSubSchema({ format });
        const model = makeModel({ lastName: '' });
        expect(checkSubSchema(sub, 'AnyPassword123', model)).toBe(true);
      });
    });
  });
});
