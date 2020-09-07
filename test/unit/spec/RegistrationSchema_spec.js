/* eslint max-params:[2, 28], max-statements:[2, 40], camelcase:0, max-len:[2, 180] */
import RegistrationSchema from 'models/RegistrationSchema';

describe('RegistrationSchema', function () {
  describe('properties', function () {
    describe('string field', function () {
      beforeEach(function () {
        const jsonResponse = {
          profileSchema: {
            properties: {
              stringfield: {
                type: 'string',
                description: 'The description',
                minLength: 2,
                maxLength: 10,
              },
            },
          },
        };

        this.schema = new RegistrationSchema();
        this.schema.settings = {
          parseSchema: function (response, onSuccess) {
            return onSuccess(response);
          },
        };
        this.schema.parse(jsonResponse);
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

    describe('email field', function () {
      beforeEach(function () {
        const jsonResponse = {
          profileSchema: {
            properties: {
              emailfield: {
                type: 'string',
                format: 'email',
              },
            },
          },
        };

        this.schema = new RegistrationSchema();
        this.schema.settings = {
          parseSchema: function (response, onSuccess) {
            return onSuccess(response);
          },
        };
        this.schema.parse(jsonResponse);
      });

      // eslint-disable-next-line jasmine/no-spec-dupes
      it('is a string type', function () {
        expect(this.schema.properties.first().get('type')).toEqual('string');
      });

      it('have a correct format', function () {
        expect(this.schema.properties.first().get('format')).toEqual('email');
      });
    });

    describe('enum field', function () {
      beforeEach(function () {
        const jsonResponse = {
          profileSchema: {
            properties: {
              fruit: {
                type: 'string',
                enum: ['Apple', 'Banana', 'Cherry'],
              },
            },
          },
        };

        this.schema = new RegistrationSchema();
        this.schema.settings = {
          parseSchema: function (response, onSuccess) {
            return onSuccess(response);
          },
        };
        this.schema.parse(jsonResponse);
      });

      // eslint-disable-next-line jasmine/no-spec-dupes
      it('is a string type', function () {
        expect(this.schema.properties.first().get('type')).toEqual('string');
      });

      it('have a correct enum', function () {
        expect(this.schema.properties.first().get('enum')).toEqual(['Apple', 'Banana', 'Cherry']);
      });
    });

    describe('required fields', function () {
      beforeEach(function () {
        const jsonResponse = {
          policyId: '1234',
          profileSchema: {
            properties: {
              field1: {
                type: 'string',
              },
              field2: {
                type: 'string',
              },
              field3: {
                type: 'string',
              },
            },
            required: ['field3', 'field1'],
          },
        };

        this.schema = new RegistrationSchema();
        this.schema.settings = {
          parseSchema: function (response, onSuccess) {
            return onSuccess(response);
          },
        };
        this.schema.parse(jsonResponse);
      });

      it('has 3 properties', function () {
        expect(this.schema.properties.length).toEqual(3);
      });

      it('field1 is required', function () {
        expect(this.schema.properties.get('field1').get('required')).toBe(true);
        expect(this.schema.properties.createModelProperties()['field1'].required).toBe(true);
      });

      it('field2 is not required', function () {
        expect(this.schema.properties.get('field2').get('required')).toBe(false);
        expect(this.schema.properties.createModelProperties()['field2'].required).toBe(false);
      });

      it('field3 is required', function () {
        expect(this.schema.properties.get('field3').get('required')).toBe(true);
      });

      it('policyId is set', function () {
        expect(this.schema.properties.defaultPolicyId).toBe('1234');
      });
    });

    describe('sorting order', function () {
      beforeEach(function () {
        const jsonResponse = {
          profileSchema: {
            properties: {
              field3: {
                type: 'string',
              },
              field6: {
                type: 'string',
              },
              field2: {
                type: 'string',
              },
              field1: {
                type: 'string',
              },
              field5: {
                type: 'string',
              },
            },
            fieldOrder: ['field5', 'field2', 'field6', 'field3', 'field1'],
          },
        };

        this.schema = new RegistrationSchema();
        this.schema.settings = {
          parseSchema: function (response, onSuccess) {
            return onSuccess(response);
          },
        };
        this.schema.parse(jsonResponse);
      });

      it('has 5 properties', function () {
        expect(this.schema.properties.length).toEqual(5);
      });

      it('have a correct sort order', function () {
        const order = this.schema.properties.pluck('name');

        expect(order).toEqual(['field5', 'field2', 'field6', 'field3', 'field1']);
      });
    });
  });
});
