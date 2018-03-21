/* eslint max-statements: [2, 22]*/
define([
  'shared/models/SchemaProperty',
  'util/RegistrationFormFactory'
],
function (SchemaProperty, RegistrationFormFactory) {
  describe('RegistrationFormFactory', function () {
    describe('string field', function () {
      beforeEach(function () {
        var schemaProperty = new SchemaProperty.Model({
          'name': 'stringfield',
          'title': 'Test Property',
          'type': 'string',
          'description': 'this is description'
        }, {parse: true});
        this.inputOptions = RegistrationFormFactory.createInputOptions(schemaProperty);
      });

      it('type is text', function () {
        expect(this.inputOptions['type']).toEqual('text');
      });

      it('no label', function () {
        expect(this.inputOptions['label']).toBe(false);
      });

      it('label-top is true', function () {
        expect(this.inputOptions['label-top']).toBe(true);
      });

      it('placeholder is the title', function () {
        expect(this.inputOptions['placeholder']).toEqual('Test Property');
      });

    });

    describe('enum field', function () {
      beforeEach(function () {
        var schemaProperty = new SchemaProperty.Model({
          'name': 'enumfield',
          'type': 'string',
          'title': 'Flavor Fruit',
          'description': 'flavor fruit',
          'enum': ['Apple', 'Banana', 'Cherry']
        }, {parse: true});
        this.inputOptions = RegistrationFormFactory.createInputOptions(schemaProperty);
      });

      it('label is the title', function () {
        expect(this.inputOptions['label']).toEqual('Flavor Fruit');
      });

      it('label-top is not set', function () {
        expect(this.inputOptions['label-top']).toBeUndefined();
      });

      it('placeholder is not set', function () {
        expect(this.inputOptions['placeholder']).toBeUndefined();
      });

    });

    describe('field name is userName', function () {
      beforeEach(function () {
        var schemaProperty = new SchemaProperty.Model({
          'name': 'userName',
          'type': 'string',
        }, {parse: true});
        this.inputOptions = RegistrationFormFactory.createInputOptions(schemaProperty);
      });

      it('icon is person-16-gray', function () {
        expect(this.inputOptions['params'].icon).toEqual('person-16-gray');
      });
    });

    describe('field name is password', function () {
      beforeEach(function () {
        var schemaProperty = new SchemaProperty.Model({
          'name': 'password',
          'type': 'string',
        }, {parse: true});
        this.inputOptions = RegistrationFormFactory.createInputOptions(schemaProperty);
      });

      it('type is password', function () {
        expect(this.inputOptions['type']).toEqual('password');
      });

      it('icon is remote-lock-16', function () {
        expect(this.inputOptions['params'].icon).toEqual('remote-lock-16');
      });
    });

    describe('Get username parts', function () {
      it('gives the right username parts', function () {
        var result = RegistrationFormFactory.getUsernameParts('first-last.name@okta.com');
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
        expect(result).toEqual(['user', 'name', 'okta',  'com']);

        result = RegistrationFormFactory.getUsernameParts('user#name@okta#%com');
        expect(result).toEqual(['user', 'name', 'okta',  '%com']);

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

    describe('PasswordContainsUserName', function () {
      it('returns false if password does not contain username or no username ', function () {
        expect(RegistrationFormFactory.passwordContainsUserName('administrator1', 'Abcd1234')).toEqual(false);
        expect(RegistrationFormFactory.passwordContainsUserName(null, 'Abcd1234')).toEqual(false);
      });
      it('returns true if password does contain username ', function () {
        expect(RegistrationFormFactory.passwordContainsUserName('abcd@okta.com', 'Abcd1234')).toEqual(true);
        expect(RegistrationFormFactory.passwordContainsUserName('abc', 'abc')).toEqual(true);
        expect(RegistrationFormFactory.passwordContainsUserName('abc', 'abc@okta.com')).toEqual(true);
      });
    });

  });
});