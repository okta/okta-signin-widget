
const getIdentifySchema = function () {
  return {
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
  };
};

const getSchema = function (formName) {
  if (formName === 'identify') {
    return getIdentifySchema();
  }
};

module.exports = {
  getSchema
};
