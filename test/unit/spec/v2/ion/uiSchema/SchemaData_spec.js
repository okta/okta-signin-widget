import SchemaData from 'v2/ion/uiSchema/SchemaData';

describe('v2/ion/uiSchema/SchemaData', function () {
  it('returns undefined for invalid form name', () => {
    const result = SchemaData.getSchema('invalid');
    expect(result).toBe(undefined);
  });
  it('returns correct schema for identify form', () => {
    const result = SchemaData.getSchema('identify');
    expect(result).toEqual({
      'formHeader': [
        {
          'type': 'formTitle',
          'key': 'primaryauth.title'
        },
      ],
      'formInputs': [
        {
          'type': 'formSchema',
          'rel': 'identifier'
        },
      ],
      'formFooter': [
        {
          'type': 'submit',
          'key': 'oform.next'
        }
      ],
    });
  });
});
