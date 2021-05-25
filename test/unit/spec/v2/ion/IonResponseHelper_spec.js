import { _ } from 'okta';
import IonResponseHelper from 'v2/ion/IonResponseHelper';
import Bundles from 'util/Bundles';

describe('v2/ion/IonResponseHelper', function() {
  let originalLoginBundle;

  beforeAll(() => {
    originalLoginBundle = Bundles.login;
    Bundles.login = _.mapObject(
      {
        'answer.too.short': 'answer must be 4+ chars',
        'bar.error': 'hello bar error',
      },
      value => `ut override - ${value}`
    );
  });
  afterAll(() => {
    Bundles.login = originalLoginBundle;
    originalLoginBundle = null;
  });

  describe('converts top level messages to global error', () => {
    it('no messages', () => {
      const resp = {};
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [],
          errorSummary: '',
          errorSummaryKeys: [],
        },
      });
    });

    it('single message', () => {
      const resp = {
        messages: {
          value: [
            {
              class: 'ERROR',
              i18n: {
                key: 'foo.error',
                params: [],
              },
              message: 'Internal error foo',
            },
          ],
        },
      };
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [],
          errorSummary: 'Internal error foo',
          errorSummaryKeys: ['foo.error'],
        },
      });
    });

    it('multiple values', () => {
      const resp = {
        messages: {
          value: [
            {
              class: 'ERROR',
              i18n: {
                key: 'foo.error',
                params: [],
              },
              message: 'Internal error foo',
            },
            {
              class: 'ERROR',
              i18n: {
                key: 'bar.error',
                params: [],
              },
              message: 'bar error',
            },
          ],
        },
      };
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [],
          errorSummary: 'Internal error foo. ut override - hello bar error',
          errorSummaryKeys: ['foo.error', 'bar.error'],
        },
      });
    });
  });

  describe('converts field level messages to error causes', () => {
    it('no remediation', () => {
      const resp = {
        remediation: {
          value: [],
        },
      };
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [],
          errorSummary: '',
          errorSummaryKeys: [],
        },
      });
    });

    it('no fields messages', () => {
      const resp = {
        remediation: {
          value: [
            {
              name: 'test',
              value: [
                {
                  label: 'Login Name',
                  name: 'userName',
                },
              ],
            },
          ],
        },
      };
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [],
          errorSummary: '',
          errorSummaryKeys: [],
        },
      });
    });

    it('has fields messages', () => {
      const resp = {
        remediation: {
          value: [
            {
              name: 'test',
              value: [
                {
                  label: 'Login Name',
                  name: 'userName',
                  messages: {
                    value: [
                      {
                        class: 'ERROR',
                        i18n: {
                          key: 'bar.error',
                          params: [],
                        },
                        message: 'bar error',
                      },
                    ],
                  },
                },
                {
                  label: 'Password',
                  name: 'password',
                  messages: {
                    value: [
                      {
                        class: 'ERROR',
                        i18n: {
                          key: 'foo1.error',
                          params: [],
                        },
                        message: 'foo1 error',
                      },
                      {
                        class: 'ERROR',
                        i18n: {
                          key: 'foo2.error',
                          params: [],
                        },
                        message: 'foo2 error',
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      };
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [
            {
              property: 'userName',
              errorKey: ['bar.error'],
              errorSummary: ['ut override - hello bar error'],
            },
            {
              property: 'password',
              errorKey: ['foo1.error', 'foo2.error'],
              errorSummary: ['foo1 error', 'foo2 error'],
            },
          ],
          errorSummary: '',
          errorSummaryKeys: [],
        },
      });
    });

    it('has `form` fields messages', () => {
      const resp = {
        remediation: {
          value: [
            {
              name: 'test-form',
              value: [
                {
                  name: 'credentials',
                  form: {
                    value: [
                      {
                        label: 'Login Name',
                        name: 'userName',
                        messages: {
                          value: [
                            {
                              class: 'ERROR',
                              i18n: {
                                key: 'bar.error',
                                params: [],
                              },
                              message: 'bar error',
                            },
                          ],
                        },
                      },
                      {
                        label: 'Password',
                        name: 'password',
                        messages: {
                          value: [
                            {
                              class: 'ERROR',
                              i18n: {
                                key: 'foo.error',
                                params: [],
                              },
                              message: 'foo error',
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      };
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [
            {
              property: 'credentials.userName',
              errorKey: ['bar.error'],
              errorSummary: ['ut override - hello bar error'],
            },
            {
              property: 'credentials.password',
              errorKey: ['foo.error'],
              errorSummary: ['foo error'],
            },
          ],
          errorSummary: '',
          errorSummaryKeys: [],
        },
      });
    });

    it('returns array with empty string if key not found in messages object', () => {
      const resp = {
        remediation: {
          value: [
            {
              name: 'test-form',
              value: [
                {
                  name: 'credentials',
                  form: {
                    value: [
                      {
                        label: 'Login Name',
                        name: 'userName',
                        messages: {
                          value: [
                            { // no i18n object here.
                              class: 'ERROR',
                              message: 'bar error',
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      };
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [
            {
              property: 'credentials.userName',
              errorKey: [''],
              errorSummary: ['bar error'],
            },
          ],
          errorSummary: '',
          errorSummaryKeys: [],
        },
      });
    });

    it('has `options` fields messages', () => {
      const resp = {
        remediation: {
          value: [
            {
              name: 'test-form',
              value: [
                {
                  name: 'authenticator',
                  options: [
                    {
                      label: 'select a question',
                      value: {
                        form: {
                          value: [
                            {
                              label: 'choose a question',
                              name: 'questionKey',
                              options: {
                                foo: 'Foo',
                                bar: 'Bar',
                              },
                            },
                            {
                              label: 'Answer',
                              name: 'answer',
                              messages: {
                                value: [
                                  {
                                    class: 'ERROR',
                                    i18n: {
                                      key: 'answer.is.short',
                                      params: [],
                                    },
                                    message: 'security question answer is too short',
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    },
                    {
                      label: 'create your own question',
                      value: {
                        form: {
                          value: [
                            {
                              name: 'questionKey',
                              value: 'custom',
                            },
                            {
                              label: 'create you own question',
                              name: 'question',
                            },
                            {
                              label: 'Answer',
                              name: 'answer',
                              messages: {
                                value: [
                                  {
                                    class: 'ERROR',
                                    i18n: {
                                      key: 'answer.is.short',
                                      params: [],
                                    },
                                    message: 'security question answer is too short',
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [
            {
              property: 'authenticator.answer',
              errorKey: ['answer.is.short'],
              errorSummary: ['security question answer is too short'],
            },
          ],
          errorSummary: '',
          errorSummaryKeys: [],
        },
      });
    });

    it('has `options` fields messages with i18n override', () => {
      const resp = {
        remediation: {
          value: [
            {
              name: 'test-form',
              value: [
                {
                  name: 'authenticator',
                  options: [
                    {
                      label: 'select a question',
                      value: {
                        form: {
                          value: [
                            {
                              label: 'choose a question',
                              name: 'questionKey',
                              options: {
                                foo: 'Foo',
                                bar: 'Bar',
                              },
                            },
                            {
                              label: 'Answer',
                              name: 'answer',
                              messages: {
                                value: [
                                  {
                                    class: 'ERROR',
                                    i18n: {
                                      key: 'answer.too.short',
                                      params: [],
                                    },
                                    message: 'security question answer is too short',
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    },
                    {
                      label: 'create your own question',
                      value: {
                        form: {
                          value: [
                            {
                              name: 'questionKey',
                              value: 'custom',
                            },
                            {
                              label: 'create you own question',
                              name: 'question',
                            },
                            {
                              label: 'Answer',
                              name: 'answer',
                              messages: {
                                value: [
                                  {
                                    class: 'ERROR',
                                    i18n: {
                                      key: 'answer.too.short',
                                      params: [],
                                    },
                                    message: 'security question answer is too short',
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };
      expect(IonResponseHelper.convertFormErrors(resp)).toEqual({
        responseJSON: {
          errorCauses: [
            {
              property: 'authenticator.answer',
              errorKey: ['answer.too.short'],
              errorSummary: ['ut override - answer must be 4+ chars'],
            },
          ],
          errorSummary: '',
          errorSummaryKeys: [],
        },
      });
    });
  });
});
