export default {
  status: 400,
  responseType: 'jrd+json',
  response: {
    errorCode: 'E0000135',
    errorId: 'oae5MJyuqthRBuwY9u5A50SPw',
    errorLink: 'E0000135',
    errorSummary: 'Registration cannot be completed at this time',
    errorCauses: [
      {
        domain: 'end-user',
        errorSummary: 'You specified an invalid email domain',
        location: 'data.userProfile.login',
        locationType: 'body',
        reason: 'INVALID_EMAIL_DOMAIN',
      },
    ],
  },
};
