import uiSchemaFactory from 'v2/ion/uiSchemaFactory';

describe('v2/ion/uiSchemaFactory', function () {
  it('returns undefined for invalid form name', () => {
    const result = uiSchemaFactory.createUISchema('invalid');
    expect(result).toBe(undefined);
  });
  it('returns correct schema for identify form', () => {
    const result = uiSchemaFactory.createUISchema('identify');
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
      'footer': [
        {
          'type': 'link',
          'label': 'Need help signing in?',
          'name': 'help',
          'href': '/help/login',
        }
      ]
    });
  });
});
