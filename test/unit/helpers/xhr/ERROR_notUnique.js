export default {
  status: 400,
  responseType: 'jrd+json',
  response: {
    errorCode: 'E0000001',
    errorSummary: 'Api validation failed: null',
    errorLink: 'E0000001',
    errorId: 'oaeXbQp2gytRhijPgA-Rew56g',
    errorCauses: [
      {
        domain: 'registration request',
        errorSummary: 'A user with this Email already exists',
        locationType: 'body',
        location: 'Email',
        reason: 'UNIQUE_CONSTRAINT',
      },
    ],
  },
};
