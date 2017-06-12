/* eslint max-params:[2, 28], max-statements:[2, 40], camelcase:0, max-len:[2, 180] */
define([
  'okta/underscore',
  'models/RegistrationSchema',
  'helpers/util/Expect'
],
function (_, RegistrationSchema, Expect) {

  Expect.describe('RegistrationSchema', function () {

    Expect.describe('properties', function () {

      Expect.describe('string field', function () {
        beforeEach(function () {
          this.schema = new RegistrationSchema.Schema({
            schema: {
              'properties': {
                'stringfield': {
                  'type': 'string',
                  'description': 'The description',
                  'minLength': 2,
                  'maxLength': 10
                }
              }
            }
          }, {parse:true});
        });

        it('only has one property', function () {
          expect(this.schema.properties.length).toEqual(1);
        });

        it('has a correct name', function () {
          expect(this.schema.properties.first().get('name')).toEqual('stringfield');
        });

        it('is a string type', function () {
          expect(this.schema.properties.first().get('type')).toEqual('string');
        });

        it('has a correct description', function () {
          expect(this.schema.properties.first().get('description')).toEqual('The description');
        });

        it('has a correct minLength', function () {
          expect(this.schema.properties.first().get('minLength')).toEqual(2);
        });

        it('has a correct maxLength', function () {
          expect(this.schema.properties.first().get('maxLength')).toEqual(10);
        });

        it('does not have format', function () {
          expect(this.schema.properties.first().get('format')).toBeUndefined();
        });
      });

      Expect.describe('email field', function () {
        beforeEach(function () {
          this.schema = new RegistrationSchema.Schema({
            schema: {
              'properties': {
                'emailfield': {
                  'type': 'string',
                  'format': 'email'
                }
              }
            }
          }, {parse:true});
        });

        it('is a string type', function () {
          expect(this.schema.properties.first().get('type')).toEqual('string');
        });

        it('have a correct format', function () {
          expect(this.schema.properties.first().get('format')).toEqual('email');
        });
      });

      Expect.describe('enum field', function () {
        beforeEach(function () {
          this.schema = new RegistrationSchema.Schema({
            schema: {
              'properties': {
                'fruit': {
                  'type': 'string',
                  'enum': ['Apple', 'Banana', 'Cherry']
                }
              }
            }
          }, {parse:true});
        });

        it('is a string type', function () {
          expect(this.schema.properties.first().get('type')).toEqual('string');
        });

        it('have a correct enum', function () {
          expect(this.schema.properties.first().get('enum')).toEqual(['Apple', 'Banana', 'Cherry']);
        });
      });

      Expect.describe('require fields', function () {
        beforeEach(function () {
          this.schema = new RegistrationSchema.Schema({
            schema: {
              'properties': {
                'field1': {
                  'type': 'string'
                },
                'field2': {
                  'type': 'string'
                },
                'field3': {
                  'type': 'string'
                }
              },
              'required': ['field3', 'field1'],
            }
          }, {parse:true});
        });

        it('has 3 properties', function () {
          expect(this.schema.properties.length).toEqual(3);
        });

        it('field1 is required', function () {
          expect(this.schema.properties.get('field1').get('required')).toBeTruthy();
          expect(this.schema.properties.createModelProperties()['field1'].required).toBeTruthy();
        });

        it('field2 is not required', function () {
          expect(this.schema.properties.get('field2').get('required')).toBeFalsy();
          expect(this.schema.properties.createModelProperties()['field2'].required).toBeFalsy();
        });

        it('field3 is required', function () {
          expect(this.schema.properties.get('field3').get('required')).toBeTruthy();
        });
      });

      Expect.describe('sorting order', function () {
        beforeEach(function () {
          this.schema = new RegistrationSchema.Schema({
            schema: {
              'properties': {
                'field3': {
                  'type': 'string'
                },
                'field6': {
                  'type': 'string'
                },
                'field2': {
                  'type': 'string'
                },
                'field1': {
                  'type': 'string'
                },
                'field5': {
                  'type': 'string'
                }
              },
              'fieldOrder': ['field5', 'field2', 'field6', 'field3', 'field1'],
            }
          }, {parse:true});
        });

        it('has 5 properties', function () {
          expect(this.schema.properties.length).toEqual(5);
        });

        it('have a correct sort order', function () {
          var order = this.schema.properties.pluck('name');
          expect(order).toEqual(['field5', 'field2', 'field6', 'field3', 'field1']);
        });
      });
    });

    Expect.describe('passwordComplexity', function () {

      var expectedDefaultPasswordComplexity = function(passwordComplexity) {
        expect(passwordComplexity.get('minLength')).toEqual(8);
        expect(passwordComplexity.get('minLowerCase')).toEqual(1);
        expect(passwordComplexity.get('minUpperCase')).toEqual(1);
        expect(passwordComplexity.get('minNumber')).toEqual(1);
        expect(passwordComplexity.get('minSymbol')).toEqual(1);
        expect(passwordComplexity.get('excludeUsername')).toBeTruthy();
      };

      Expect.describe('no password complexity', function () {
        beforeEach(function () {
          this.schema = new RegistrationSchema.Schema({
            schema: {}
          }, {parse:true});
        });

        it('to be defined', function () {
          expect(this.schema.passwordComplexity).toBeDefined();
        });

        it('has default values', function () {
          expectedDefaultPasswordComplexity(this.schema.passwordComplexity);
        });
      });

      Expect.describe('empty password complexity', function () {
        beforeEach(function () {
          this.schema = new RegistrationSchema.Schema({
            schema: {},
            'passwordComplexity': {}
          }, {parse:true});
        });

        it('to be defined', function () {
          expect(this.schema.passwordComplexity).toBeDefined();
        });

        it('has default values', function () {
          expectedDefaultPasswordComplexity(this.schema.passwordComplexity);
        });
      });

      Expect.describe('custom password complexity', function () {
        beforeEach(function () {
          this.schema = new RegistrationSchema.Schema({
            schema: {},
            'passwordComplexity': {
              'minLength': 1,
              'minLowerCase': 2,
              'minUpperCase': 3,
              'minNumber': 4,
              'minSymbol': 0,
              'excludeUsername': false
            }
          }, {parse:true});
        });

        it('minLength has a correct value', function () {
          expect(this.schema.passwordComplexity.get('minLength')).toEqual(1);
        });

        it('minLowerCase has a correct value', function () {
          expect(this.schema.passwordComplexity.get('minLowerCase')).toEqual(2);
        });

        it('minUpperCase has a correct value', function () {
          expect(this.schema.passwordComplexity.get('minUpperCase')).toEqual(3);
        });

        it('minNumber has a correct value', function () {
          expect(this.schema.passwordComplexity.get('minNumber')).toEqual(4);
        });

        it('minSymbol has a correct value', function () {
          expect(this.schema.passwordComplexity.get('minSymbol')).toEqual(0);
        });

        it('excludeUsername has a correct value', function () {
          expect(this.schema.passwordComplexity.get('excludeUsername')).toBeFalsy();
        });
      });

      Expect.describe('disable all complexities', function () {
        beforeEach(function () {
          this.schema = new RegistrationSchema.Schema({
            schema: {},
            'passwordComplexity': {
              'minLength': 0,
              'minLowerCase': 0,
              'minUpperCase': 0,
              'minNumber': 0,
              'minSymbol': 0,
              'excludeUsername': false
            }
          }, {parse:true});
        });

        it('enabledComplexities is empty', function () {
          expect(this.schema.passwordComplexity.enabledComplexities).toEqual([]);
        });
      });

      Expect.describe('enable all complexities', function () {
        beforeEach(function () {
          this.schema = new RegistrationSchema.Schema({
            schema: {},
            'passwordComplexity': {
              'minLength': 10,
              'minLowerCase': 2,
              'minUpperCase': 3,
              'minNumber': 4,
              'minSymbol': 5,
              'excludeUsername': true
            }
          }, {parse:true});
        });

        it('enabledComplexities has all complexities', function () {
          expect(this.schema.passwordComplexity.enabledComplexities).toContain('minLength');
          expect(this.schema.passwordComplexity.enabledComplexities).toContain('minLowerCase');
          expect(this.schema.passwordComplexity.enabledComplexities).toContain('minUpperCase');
          expect(this.schema.passwordComplexity.enabledComplexities).toContain('minNumber');
          expect(this.schema.passwordComplexity.enabledComplexities).toContain('minSymbol');
          expect(this.schema.passwordComplexity.enabledComplexities).toContain('excludeUsername');
          expect(this.schema.passwordComplexity.enabledComplexities.length).toEqual(6);
        });
      });

    });
  });
});