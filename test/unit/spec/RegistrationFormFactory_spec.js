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
        expect(this.inputOptions['label']).toBeFalsy();
      });

      it('label-top is true', function () {
        expect(this.inputOptions['label-top']).toBeTruthy();
      });

      it('placeholder is the description', function () {
        expect(this.inputOptions['placeholder']).toEqual('this is description');
      });

    });

    describe('enum field', function () {
      beforeEach(function () {
        var schemaProperty = new SchemaProperty.Model({
          'name': 'enumfield',
          'type': 'string',
          'description': 'flavor fruit',
          'enum': ['Apple', 'Banana', 'Cherry']
        }, {parse: true});
        this.inputOptions = RegistrationFormFactory.createInputOptions(schemaProperty);
      });

      it('label is the description', function () {
        expect(this.inputOptions['label']).toEqual('flavor fruit');
      });

      it('label-top is not set', function () {
        expect(this.inputOptions['label-top']).toBeUndefined();
      });

      it('placeholder is not set', function () {
        expect(this.inputOptions['placeholder']).toBeUndefined();
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

    });
  });
});
