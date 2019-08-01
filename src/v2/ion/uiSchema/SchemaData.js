
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


const getEmailFactorRequiredSchema = function () {
  return {
    'formHeader': [
      {
        'type': 'factorBeacon',
        'iconClassName': 'mfa-okta-email'
      },
      {
        'type': 'formTitle',
        'key': 'factor.email'
      },
    ],
    'formInputs': [
      {
        'type': 'formSchema',
        'rel': 'email'
      },
      {
        'rel': 'button',
        'type': 'button',
        'className': 'button email-request-button link-button',
        'key': 'mfa.sendEmail'
      }
    ],
    'formFooter': [
      {
        'type': 'submit',
        'key': 'mfa.challenge.verify'
      }
    ]
  };
};


const getPasswordFactorRequiredSchema = function () {
  return {
    'formHeader': [
      {
        'type': 'factorBeacon',
        'iconClassName': 'mfa-okta-password'
      },
      {
        'type': 'formTitle',
        'key': 'factor.password'
      },
    ],
    'formInputs': [
      {
        'type': 'formSchema',
        'rel': 'password'
      }
    ],
    'formFooter': [
      {
        'type': 'submit',
        'key': 'mfa.challenge.verify'
      }
    ],
  };
};

const getSelectFactorSchema = function () {
  return {
    'formHeader': [
      {
        'type': 'formTitle',
        'key': 'enroll.choices.title'
      },
    ],
    'formInputs': [
      {
        'rel': 'select-factor',
        'type': 'view',
        'component': 'FactorEnrollOptions'
      },
    ],
  };
};

const getSchema = function (formName) {
  switch (formName) {
  case 'identify':
    return getIdentifySchema();
  case 'required-factor-email':
    return getEmailFactorRequiredSchema();
  case 'required-factor-password':
    return getPasswordFactorRequiredSchema();
  case 'select-factor':
    return getSelectFactorSchema();
  }
};

module.exports = {
  getSchema
};
