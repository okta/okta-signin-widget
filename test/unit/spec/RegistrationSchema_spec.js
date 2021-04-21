/* eslint max-params:[2, 28], max-statements:[2, 40], camelcase:0, max-len:[2, 180] */
import RegistrationSchema from 'models/RegistrationSchema';
import Settings from 'models/Settings';

describe('RegistrationSchema', () => {
  let testContext;

  const getSettings = () => {
    return new Settings({
      baseUrl: 'http://localhost:3000',
      parseSchema: function(response, onSuccess) {
        return onSuccess(response);
      },
    });
  };

  describe('properties', () => {    
    describe('string field', () => {
  
      beforeEach(() => {
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
        testContext = {};
        testContext.schema = new RegistrationSchema();
        testContext.schema.settings = getSettings();
        testContext.schema.parse(jsonResponse);
      });

      it('only has one property', () => {
        expect(testContext.schema.properties.length).toEqual(1);
      });

      it('has a correct name', () => {
        expect(testContext.schema.properties.first().get('name')).toEqual('stringfield');
      });

      it('is a string type', () => {
        expect(testContext.schema.properties.first().get('type')).toEqual('string');
      });

      it('has a correct description', () => {
        expect(testContext.schema.properties.first().get('description')).toEqual('The description');
      });

      it('has a correct minLength', () => {
        expect(testContext.schema.properties.first().get('minLength')).toEqual(2);
      });

      it('has a correct maxLength', () => {
        expect(testContext.schema.properties.first().get('maxLength')).toEqual(10);
      });

      it('does not have format', () => {
        expect(testContext.schema.properties.first().get('format')).toBeUndefined();
      });
    });

    describe('email field', () => {
      beforeEach(() => {
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
        testContext = {};
        testContext.schema = new RegistrationSchema();
        testContext.schema.settings = getSettings();
        testContext.schema.parse(jsonResponse);
      });

      // eslint-disable-next-line jasmine/no-spec-dupes
      it('is a string type', () => {
        expect(testContext.schema.properties.first().get('type')).toEqual('string');
      });

      it('have a correct format', () => {
        expect(testContext.schema.properties.first().get('format')).toEqual('email');
      });
    });

    describe('enum field', () => {
      beforeEach(() => {
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
        testContext = {};
        testContext.schema = new RegistrationSchema();
        testContext.schema.settings = getSettings();
        testContext.schema.parse(jsonResponse);
      });

      // eslint-disable-next-line jasmine/no-spec-dupes
      it('is a string type', () => {
        expect(testContext.schema.properties.first().get('type')).toEqual('string');
      });

      it('have a correct enum', () => {
        expect(testContext.schema.properties.first().get('enum')).toEqual(['Apple', 'Banana', 'Cherry']);
      });
    });

    describe('required fields', () => {
      beforeEach(() => {
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
        testContext = {};
        testContext.schema = new RegistrationSchema();
        testContext.schema.settings = getSettings();
        testContext.schema.parse(jsonResponse);
      });

      it('has 3 properties', () => {
        expect(testContext.schema.properties.length).toEqual(3);
      });

      it('field1 is required', () => {
        expect(testContext.schema.properties.get('field1').get('required')).toBe(true);
        expect(testContext.schema.properties.createModelProperties()['field1'].required).toBe(true);
      });

      it('field2 is not required', () => {
        expect(testContext.schema.properties.get('field2').get('required')).toBe(false);
        expect(testContext.schema.properties.createModelProperties()['field2'].required).toBe(false);
      });

      it('field3 is required', () => {
        expect(testContext.schema.properties.get('field3').get('required')).toBe(true);
      });

      it('policyId is set', () => {
        expect(testContext.schema.properties.defaultPolicyId).toBe('1234');
      });
    });

    describe('sorting order', () => {
      beforeEach(() => {
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
        testContext = {};
        testContext.schema = new RegistrationSchema();
        testContext.schema.settings = getSettings();
        testContext.schema.parse(jsonResponse);
      });

      it('has 5 properties', () => {
        expect(testContext.schema.properties.length).toEqual(5);
      });

      it('have a correct sort order', () => {
        const order = testContext.schema.properties.pluck('name');

        expect(order).toEqual(['field5', 'field2', 'field6', 'field3', 'field1']);
      });
    });
  });
});
