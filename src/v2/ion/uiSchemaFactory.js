const uiSchemas = {
  'identify': {
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
        'label': 'Need Help Signing In?',
        'name': 'help',
        'href': '/help/login',
        'actionName': 'redirect',
      }
    ],
  },
  'factor-poll-verification': {
    'formHeader': [
      {
        'type': 'formTitle',
        'key': 'mfa.challenge.verify'
      },
    ],
    'formInputs': [
    ],
  },
  'required-factor-password': {
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
    'footer': [
      {
        'type': 'link',
        'label': 'Forgot Password',
        'name': 'forgot-password',
        'actionName': 'recovery',
      }
    ],
  },
  'required-factor-email': {
    'formHeader': [
      {
        'type': 'formTitle',
        'key': 'mfa.challenge.verify'
      },
    ],
    'formInputs': [
    ],
    'formFooter': [
      {
        'type': 'submit',
        'label': 'Send Email',
      }
    ],
  },
  'otp': {
    'formHeader': [
      {
        'type': 'formTitle',
        'key': 'mfa.challenge.verify'
      },
    ],
    'formInputs': [
      {
        'type': 'formSchema',
        'rel': 'otp'
      },
    ],
    'formFooter': [
      {
        'type': 'submit',
        'key': 'oform.next'
      }
    ],
  },
  'select-factor': {
    'formHeader': [
      {
        'type': 'formTitle',
        'key': 'enroll.choices.title'
      },
    ],
    'formInputs': [
      {
        'rel': 'select-factor',
        'type': 'factorType',
      },
    ],
  },
  'enroll-factor-email': {
    'formHeader': [
      {
        'type': 'formTitle',
        'key': 'mfa.challenge.verify'
      },
    ],
    'formInputs': [
    ],
    'formFooter': [
      {
        'type': 'submit',
        'label': 'Send Email',
      }
    ],
  },
  'enroll-factor-password': {
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
      },
      {
        'type': 'formSchema',
        'rel': 'confirmPassword'
      }
    ],
    'formFooter': [
      {
        'type': 'submit',
        'key': 'mfa.challenge.verify'
      }
    ],
  }
};

const createUISchema = function (formName) {
  if (!uiSchemas.hasOwnProperty(formName)) {
    // TODO: better error handling
    // eslint-disable-next-line no-console
    console.warn('Cannot find uiSchema for form: ', formName);

  }
  return uiSchemas[formName];
};

module.exports = {
  createUISchema,
};
