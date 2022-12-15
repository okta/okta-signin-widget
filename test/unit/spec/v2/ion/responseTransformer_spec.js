import 'jasmine-ajax';
import Settings from 'models/Settings';
import transformResponse from 'v2/ion/responseTransformer';

import MockUtil from '../../../helpers/v2/MockUtil';
import XHRAuthenticatorRequiredEmail
  from '../../../../../playground/mocks/data/idp/idx/authenticator-verification-email.json';
import XHRErrorIdentifyAccessDenied
  from '../../../../../playground/mocks/data/idp/idx/error-identify-access-denied.json';
import XHRServerSafeMode
  from '../../../../../playground/mocks/data/idp/idx/safe-mode-optional-enrollment.json';
import XHRSuccess from '../../../../../playground/mocks/data/idp/idx/success.json';
import XHRSuccessWithAppUser from '../../../../../playground/mocks/data/idp/idx/success-with-app-user.json';
import XHRIdentify from '../../../../../playground/mocks/data/idp/idx/identify.json';
import XHRIdentifyWithThirdPartyIdps
  from '../../../../../playground/mocks/data/idp/idx/identify-with-third-party-idps.json';
import XHRIdentifyButUnknownUser from '../../../../../playground/mocks/data/idp/idx/identify-unknown-user.json';

describe('v2/ion/responseTransformer', function() {
  let idps = [
    {
      type: 'FACEBOOK',
      id: 'facebook-123',
    },
    {
      type: 'LINKEDIN',
      id: 'linkedin-123',
    },
    {
      type: 'MICROSOFT',
      id: 'microsoft-123',
    },
    {
      type: 'GOOGLE',
      id: 'google-123',
    },
    {
      type: 'APPLE',
      id: 'apple-123',
    },
    {
      id: 'generic-oidc-123',
      text: 'Login with Joe',
      className: 'with-joe',
    },
  ];

  let testContext;

  beforeEach(() => {
    testContext = {
      settings: new Settings({
        baseUrl: 'http://localhost:3000',
      }),
    };
  });

  it('returns result when invokes with invalid resp', () => {
    expect(transformResponse(testContext.settings)).toBeNull();
    expect(transformResponse(testContext.settings, 'hello')).toBeNull();
  });

  it('converts required authenticator email idx object', done => {
    const mock = XHRAuthenticatorRequiredEmail;
    MockUtil.mockIntrospect(done, mock, idxResp => {
      // transformed object with flattened firstlevel objects, idx and remediations array
      const result = transformResponse(testContext.settings, idxResp);

      // Check top-level obhects
      expect(result.app).toEqual(mock.app.value);
      expect(result.user).toEqual(mock.user.value);
      expect(result.currentAuthenticatorEnrollment).toEqual(mock.currentAuthenticatorEnrollment.value);
      expect(result.authenticatorEnrollments).toEqual({
        ...mock.authenticatorEnrollments,
        type: undefined, // type is removed by transformer
      });
      
      expect(result.idx).toEqual(idxResp); // raw IDX response is also added at top-level

      // Authenticator is wired up to remediations
      expect(result.remediations.length).toBe(mock.remediation.value.length);
      const challengeAuthenticatorRemediation = result.remediations[0];
      expect(challengeAuthenticatorRemediation).toEqual({
        ...mock.remediation.value[0],
        action: expect.any(Function), // action function is added
        relatesTo: mock.currentAuthenticatorEnrollment // authenticator is wired up
      });
      const selectAuthenticatorRemediation = result.remediations[1];
      expect(selectAuthenticatorRemediation).toEqual({
        ...mock.remediation.value[1],
        action: expect.any(Function), // action function is added
        value: [{
          ...mock.remediation.value[1].value[0],
          options: [{
            ...mock.remediation.value[1].value[0].options[0],
            relatesTo: mock.authenticatorEnrollments.value[0] // authenticator is wired up
          }]
        }, {
          ...mock.remediation.value[1].value[1] // stateHandle
        }]
      });
      const stateHandleRemediation = result.remediations[2];
      expect(stateHandleRemediation).toEqual(mock.remediation.value[2]);
    });
  });

  it('converts identify but unknown user', done => {
    MockUtil.mockIntrospect(done, XHRIdentifyButUnknownUser, idxResp => {
      const result = transformResponse(testContext.settings, idxResp);
      expect(result).toEqual({
        remediations: [
          {
            action: expect.any(Function),
            name: 'identify',
            rel: ['create-form'],
            accepts: 'application/vnd.okta.v1+json',
            href: 'http://localhost:3000/idp/idx/identify',
            method: 'POST',
            value: [
              {
                name: 'identifier',
                label: 'Username',
              },
              {
                name: 'stateHandle',
                required: true,
                value: '02tZJpxD03j1a3qaPcSsi16yDtqMZgfetf8OvWOepP',
                visible: false,
                mutable: false,
              },
            ],
          },
          {
            action: expect.any(Function),
            name: 'select-enroll-profile',
            href: 'http://localhost:3000/idp/idx/enroll',
            method: 'POST',
            rel: ['create-form'],
            accepts: 'application/vnd.okta.v1+json',
            value: [
              {
                name: 'stateHandle',
                required: true,
                value: '02tZJpxD03j1a3qaPcSsi16yDtqMZgfetf8OvWOepP',
                visible: false,
                mutable: false,
              },
            ],
          },
        ],
        messages: {
          value: [
            {
              message: 'Authentication failed',
              i18n: {
                key: 'errors.E0000004',
              },
              class: 'ERROR',
            },
          ],
        },
        idx: idxResp,
      });
    });
  });

  it('converts ion response that only has messages', done => {
    MockUtil.mockIntrospect(done, XHRErrorIdentifyAccessDenied, idxResp => {
      const result = transformResponse(testContext.settings, idxResp);
      expect(result).toEqual({
        remediations: [
          {
            name: 'terminal',
            value: [],
          },
        ],
        messages: {
          value: [
            {
              message: 'You do not have permission to perform the requested action.',
              i18n: {
                key: 'security.access_denied',
              },
              class: 'ERROR',
            },
          ],
        },
        idx: idxResp,
      });
    });
  });

  it('converts ion response that only has skip remediation form', done => {
    MockUtil.mockIntrospect(done, XHRServerSafeMode, idxResp => {
      const result = transformResponse(testContext.settings, idxResp);
      expect(result).toEqual({
        remediations: [
          {
            name: 'terminal',
            value: [],
          },
          {
            action: expect.any(Function),
            rel: ['create-form'],
            name: 'skip',
            href: 'http://localhost:3000/idp/idx/skip',
            method: 'POST',
            value: [
              {
                name: 'stateHandle',
                required: true,
                value: '02-20rHvS_j-Wq-odoJpMO33YcBwaL50217Nm9hysZ',
                visible: false,
                mutable: false
              }
            ],
            accepts:'application/ion+json; okta-version=1.0.0'
          }
        ],
        messages: {
          value: [
            {
              message: 'Set up is temporarily unavailable due to server maintenance. Try again later.',
              i18n: {
                key: 'idx.error.server.safe.mode.enrollment.unavailable',
              },
              class: 'ERROR',
            },
          ],
        },
        idx: idxResp,
      });
    });
  });

  it('converts success ion response', done => {
    MockUtil.mockIntrospect(done, XHRSuccess, idxResp => {
      const result = transformResponse(testContext.settings, idxResp);
      expect(result).toEqual({
        remediations: [
          {
            name: 'success-redirect',
            href: 'http://localhost:3000/app/UserHome?stateToken=mockedStateToken123',
            value: [],
          },
        ],
        user: {
          id: '00ub0ttoyz062NeVa0g4',
          identifier: 'testUser@okta.com',
        },
        idx: idxResp,
      });
    });
  });

  it('converts success ion response with app and user', done => {
    MockUtil.mockIntrospect(done, XHRSuccessWithAppUser, idxResp => {
      const result = transformResponse(testContext.settings, idxResp);
      expect(result).toEqual({
        app: { name: 'saasure', label: 'Okta Administration', id: '0oa1heimi0IDMJoo90g4' },
        remediations: [
          {
            name: 'success-redirect',
            href: 'http://localhost:3000/app/UserHome?stateToken=mockedStateToken123',
            value: [],
          },
        ],
        user: {
          id: '00ub0ttoyz062NeVa0g4',
          identifier: 'testUser@okta.com',
        },
        idx: idxResp,
      });
    });
  });

  it('converts identify ion response', done => {
    // unset default idps from config
    // and there is another test when idps is set.
    testContext.settings.set('idps', []);

    MockUtil.mockIntrospect(done, XHRIdentify, idxResp => {
      const result = transformResponse(testContext.settings, idxResp);
      expect(result).toEqual({
        remediations: [
          Object.assign({ action: expect.any(Function) }, XHRIdentify.remediation.value[0]),
          Object.assign({ action: expect.any(Function) }, XHRIdentify.remediation.value[1]),
        ],
        idx: idxResp,
      });
    });
  });

  it('converts identify ion response with setting.idps', done => {
    testContext.settings.set('idps', idps);
    MockUtil.mockIntrospect(done, XHRIdentify, idxResp => {
      const result = transformResponse(testContext.settings, idxResp);
      expect(result).toEqual({
        remediations: [
          {
            rel: ['create-form'],
            name: 'identify',
            method: 'POST',
            accepts: 'application/vnd.okta.v1+json',
            action: expect.any(Function),
            href: 'http://localhost:3000/idp/idx/identify',
            value: [
              { name: 'identifier', label: 'Username' },
              { name: 'rememberMe', label: 'Remember Me', type: 'boolean' },
              {
                name: 'stateHandle',
                visible: false,
                mutable: false,
                required: true,
                value: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..4z7WWUdd0LzIJLxz.GmOyeMJ5XtS7kZipFanQxaMd2rblpEeaWv8U5IfaJv5F2V1otwft4q1tVo3yqbedhBjN-nO5qk6qR-0Op34lmecwwmHeRyzYbhrFiLZaR88nhCFMblP8Bo5d3Opl5gkX02e0FQL-Osorxvml0XYbuO7GdTH5EkIv0Q7h0Dq7L__h_uFLies8AkJZWIDQh25RlqcEjToHCvVW31A_NJJ1Vf5c8GFuyb9LsJ9kUpZikpK6C72GPrU_LGrIW8VBT4l24dDEre4J8XvTNO7fdVDiq-H7BEeIjaY06q1zqlVLWwqOHoKpGNQ0NMhBIXB0ZZC57Me9pFI5GLIUwRDUIm1vw3t_mHJDVIcCJe9kmt29tTccZ8Zo0N3q5bSiwMoNHPLxZSOrbx-bf4fniorNH5ypJnke7pc2Q3DFmqfPrB7CE1REjAyCKBHYDAfVexYCkMfCl0E8oMFJinnLbynb7Bqvbp_DqL8h0pNIoXUF4KTTsuKQg8yCCqBhkajxlvh9G7L3Sf76o4B2itB7ldeqXzAE9H60yqhIKEZPNOHUgRC2SkWkWlH6NIaNWQ2Bi2CjnL9YvUuQmO-dpf08KeCgwfVmT4GBTGfTkXwy3pBitacCqEREen2j2iUH9mhi2LOOFaGLh0TXslcBgkGuht6P7gyH2JN6yFInQyIp33xQsqYg7nqOZG1LCrQSqoviTfI72-AC6b7tju8YEn1P0nXGbSzlCztSXl2pa95tr4L5pyX8fNydKYMTLeHEnmNtXlRB6wQYP1ljf4Tzgus7O0etyJs75znsXHZ42znxlEKGhTo3ucFe3CI-vsHF1FDDj2DVeWl21zVOTehTbBaemoD1ekD5F8OHS7SrK9Bw7PTa-lpyls1OxvE_Wsco4_eGbax_DoPm6DbCwj8hWzb5wLEs6TClZKoUJeV1MSVB3OgGBZ3AGzhwfeG0sGi5DnUpAeKqgP6IN8kziNRDmW3YE0qIY2mLs7nI438RTu__6bg1E6SH1QHMNucNbmoDR6VDIUmlYc0xEpygH6PBVqiPD64MnD73_D9IinVNzqW7KQzAvuFFQW_LGDfjuh1D-oTs1gi1wWDylibjxdJabveoJ10NHgeb6SaYHg.kf5iTnjNKsKqhz0iE5K_Yw',
              },
            ],
          },
          {
            rel: ['create-form'],
            name: 'select-enroll-profile',
            href: 'http://localhost:3000/idp/idx/enroll',
            method: 'POST',
            action: expect.any(Function),
            accepts: 'application/vnd.okta.v1+json',
            value: [
              {
                name: 'stateHandle',
                visible: false,
                mutable: false,
                required: true,
                value: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..4z7WWUdd0LzIJLxz.GmOyeMJ5XtS7kZipFanQxaMd2rblpEeaWv8U5IfaJv5F2V1otwft4q1tVo3yqbedhBjN-nO5qk6qR-0Op34lmecwwmHeRyzYbhrFiLZaR88nhCFMblP8Bo5d3Opl5gkX02e0FQL-Osorxvml0XYbuO7GdTH5EkIv0Q7h0Dq7L__h_uFLies8AkJZWIDQh25RlqcEjToHCvVW31A_NJJ1Vf5c8GFuyb9LsJ9kUpZikpK6C72GPrU_LGrIW8VBT4l24dDEre4J8XvTNO7fdVDiq-H7BEeIjaY06q1zqlVLWwqOHoKpGNQ0NMhBIXB0ZZC57Me9pFI5GLIUwRDUIm1vw3t_mHJDVIcCJe9kmt29tTccZ8Zo0N3q5bSiwMoNHPLxZSOrbx-bf4fniorNH5ypJnke7pc2Q3DFmqfPrB7CE1REjAyCKBHYDAfVexYCkMfCl0E8oMFJinnLbynb7Bqvbp_DqL8h0pNIoXUF4KTTsuKQg8yCCqBhkajxlvh9G7L3Sf76o4B2itB7ldeqXzAE9H60yqhIKEZPNOHUgRC2SkWkWlH6NIaNWQ2Bi2CjnL9YvUuQmO-dpf08KeCgwfVmT4GBTGfTkXwy3pBitacCqEREen2j2iUH9mhi2LOOFaGLh0TXslcBgkGuht6P7gyH2JN6yFInQyIp33xQsqYg7nqOZG1LCrQSqoviTfI72-AC6b7tju8YEn1P0nXGbSzlCztSXl2pa95tr4L5pyX8fNydKYMTLeHEnmNtXlRB6wQYP1ljf4Tzgus7O0etyJs75znsXHZ42znxlEKGhTo3ucFe3CI-vsHF1FDDj2DVeWl21zVOTehTbBaemoD1ekD5F8OHS7SrK9Bw7PTa-lpyls1OxvE_Wsco4_eGbax_DoPm6DbCwj8hWzb5wLEs6TClZKoUJeV1MSVB3OgGBZ3AGzhwfeG0sGi5DnUpAeKqgP6IN8kziNRDmW3YE0qIY2mLs7nI438RTu__6bg1E6SH1QHMNucNbmoDR6VDIUmlYc0xEpygH6PBVqiPD64MnD73_D9IinVNzqW7KQzAvuFFQW_LGDfjuh1D-oTs1gi1wWDylibjxdJabveoJ10NHgeb6SaYHg.kf5iTnjNKsKqhz0iE5K_Yw',
              },
            ],
          },
          {
            name: 'redirect-idp',
            type: 'FACEBOOK',
            idp: { id: 'facebook-123', name: undefined },
            href: 'http://localhost:3000/sso/idps/facebook-123?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..4z7WWUdd0LzIJLxz.GmOyeMJ5XtS7kZipFanQxaMd2rblpEeaWv8U5IfaJv5F2V1otwft4q1tVo3yqbedhBjN-nO5qk6qR-0Op34lmecwwmHeRyzYbhrFiLZaR88nhCFMblP8Bo5d3Opl5gkX02e0FQL-Osorxvml0XYbuO7GdTH5EkIv0Q7h0Dq7L__h_uFLies8AkJZWIDQh25RlqcEjToHCvVW31A_NJJ1Vf5c8GFuyb9LsJ9kUpZikpK6C72GPrU_LGrIW8VBT4l24dDEre4J8XvTNO7fdVDiq-H7BEeIjaY06q1zqlVLWwqOHoKpGNQ0NMhBIXB0ZZC57Me9pFI5GLIUwRDUIm1vw3t_mHJDVIcCJe9kmt29tTccZ8Zo0N3q5bSiwMoNHPLxZSOrbx-bf4fniorNH5ypJnke7pc2Q3DFmqfPrB7CE1REjAyCKBHYDAfVexYCkMfCl0E8oMFJinnLbynb7Bqvbp_DqL8h0pNIoXUF4KTTsuKQg8yCCqBhkajxlvh9G7L3Sf76o4B2itB7ldeqXzAE9H60yqhIKEZPNOHUgRC2SkWkWlH6NIaNWQ2Bi2CjnL9YvUuQmO-dpf08KeCgwfVmT4GBTGfTkXwy3pBitacCqEREen2j2iUH9mhi2LOOFaGLh0TXslcBgkGuht6P7gyH2JN6yFInQyIp33xQsqYg7nqOZG1LCrQSqoviTfI72-AC6b7tju8YEn1P0nXGbSzlCztSXl2pa95tr4L5pyX8fNydKYMTLeHEnmNtXlRB6wQYP1ljf4Tzgus7O0etyJs75znsXHZ42znxlEKGhTo3ucFe3CI-vsHF1FDDj2DVeWl21zVOTehTbBaemoD1ekD5F8OHS7SrK9Bw7PTa-lpyls1OxvE_Wsco4_eGbax_DoPm6DbCwj8hWzb5wLEs6TClZKoUJeV1MSVB3OgGBZ3AGzhwfeG0sGi5DnUpAeKqgP6IN8kziNRDmW3YE0qIY2mLs7nI438RTu__6bg1E6SH1QHMNucNbmoDR6VDIUmlYc0xEpygH6PBVqiPD64MnD73_D9IinVNzqW7KQzAvuFFQW_LGDfjuh1D-oTs1gi1wWDylibjxdJabveoJ10NHgeb6SaYHg.kf5iTnjNKsKqhz0iE5K_Yw',
          },
          {
            name: 'redirect-idp',
            type: 'LINKEDIN',
            idp: { id: 'linkedin-123', name: undefined },
            href: 'http://localhost:3000/sso/idps/linkedin-123?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..4z7WWUdd0LzIJLxz.GmOyeMJ5XtS7kZipFanQxaMd2rblpEeaWv8U5IfaJv5F2V1otwft4q1tVo3yqbedhBjN-nO5qk6qR-0Op34lmecwwmHeRyzYbhrFiLZaR88nhCFMblP8Bo5d3Opl5gkX02e0FQL-Osorxvml0XYbuO7GdTH5EkIv0Q7h0Dq7L__h_uFLies8AkJZWIDQh25RlqcEjToHCvVW31A_NJJ1Vf5c8GFuyb9LsJ9kUpZikpK6C72GPrU_LGrIW8VBT4l24dDEre4J8XvTNO7fdVDiq-H7BEeIjaY06q1zqlVLWwqOHoKpGNQ0NMhBIXB0ZZC57Me9pFI5GLIUwRDUIm1vw3t_mHJDVIcCJe9kmt29tTccZ8Zo0N3q5bSiwMoNHPLxZSOrbx-bf4fniorNH5ypJnke7pc2Q3DFmqfPrB7CE1REjAyCKBHYDAfVexYCkMfCl0E8oMFJinnLbynb7Bqvbp_DqL8h0pNIoXUF4KTTsuKQg8yCCqBhkajxlvh9G7L3Sf76o4B2itB7ldeqXzAE9H60yqhIKEZPNOHUgRC2SkWkWlH6NIaNWQ2Bi2CjnL9YvUuQmO-dpf08KeCgwfVmT4GBTGfTkXwy3pBitacCqEREen2j2iUH9mhi2LOOFaGLh0TXslcBgkGuht6P7gyH2JN6yFInQyIp33xQsqYg7nqOZG1LCrQSqoviTfI72-AC6b7tju8YEn1P0nXGbSzlCztSXl2pa95tr4L5pyX8fNydKYMTLeHEnmNtXlRB6wQYP1ljf4Tzgus7O0etyJs75znsXHZ42znxlEKGhTo3ucFe3CI-vsHF1FDDj2DVeWl21zVOTehTbBaemoD1ekD5F8OHS7SrK9Bw7PTa-lpyls1OxvE_Wsco4_eGbax_DoPm6DbCwj8hWzb5wLEs6TClZKoUJeV1MSVB3OgGBZ3AGzhwfeG0sGi5DnUpAeKqgP6IN8kziNRDmW3YE0qIY2mLs7nI438RTu__6bg1E6SH1QHMNucNbmoDR6VDIUmlYc0xEpygH6PBVqiPD64MnD73_D9IinVNzqW7KQzAvuFFQW_LGDfjuh1D-oTs1gi1wWDylibjxdJabveoJ10NHgeb6SaYHg.kf5iTnjNKsKqhz0iE5K_Yw',
          },
          {
            name: 'redirect-idp',
            type: 'MICROSOFT',
            idp: { id: 'microsoft-123', name: undefined },
            href: 'http://localhost:3000/sso/idps/microsoft-123?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..4z7WWUdd0LzIJLxz.GmOyeMJ5XtS7kZipFanQxaMd2rblpEeaWv8U5IfaJv5F2V1otwft4q1tVo3yqbedhBjN-nO5qk6qR-0Op34lmecwwmHeRyzYbhrFiLZaR88nhCFMblP8Bo5d3Opl5gkX02e0FQL-Osorxvml0XYbuO7GdTH5EkIv0Q7h0Dq7L__h_uFLies8AkJZWIDQh25RlqcEjToHCvVW31A_NJJ1Vf5c8GFuyb9LsJ9kUpZikpK6C72GPrU_LGrIW8VBT4l24dDEre4J8XvTNO7fdVDiq-H7BEeIjaY06q1zqlVLWwqOHoKpGNQ0NMhBIXB0ZZC57Me9pFI5GLIUwRDUIm1vw3t_mHJDVIcCJe9kmt29tTccZ8Zo0N3q5bSiwMoNHPLxZSOrbx-bf4fniorNH5ypJnke7pc2Q3DFmqfPrB7CE1REjAyCKBHYDAfVexYCkMfCl0E8oMFJinnLbynb7Bqvbp_DqL8h0pNIoXUF4KTTsuKQg8yCCqBhkajxlvh9G7L3Sf76o4B2itB7ldeqXzAE9H60yqhIKEZPNOHUgRC2SkWkWlH6NIaNWQ2Bi2CjnL9YvUuQmO-dpf08KeCgwfVmT4GBTGfTkXwy3pBitacCqEREen2j2iUH9mhi2LOOFaGLh0TXslcBgkGuht6P7gyH2JN6yFInQyIp33xQsqYg7nqOZG1LCrQSqoviTfI72-AC6b7tju8YEn1P0nXGbSzlCztSXl2pa95tr4L5pyX8fNydKYMTLeHEnmNtXlRB6wQYP1ljf4Tzgus7O0etyJs75znsXHZ42znxlEKGhTo3ucFe3CI-vsHF1FDDj2DVeWl21zVOTehTbBaemoD1ekD5F8OHS7SrK9Bw7PTa-lpyls1OxvE_Wsco4_eGbax_DoPm6DbCwj8hWzb5wLEs6TClZKoUJeV1MSVB3OgGBZ3AGzhwfeG0sGi5DnUpAeKqgP6IN8kziNRDmW3YE0qIY2mLs7nI438RTu__6bg1E6SH1QHMNucNbmoDR6VDIUmlYc0xEpygH6PBVqiPD64MnD73_D9IinVNzqW7KQzAvuFFQW_LGDfjuh1D-oTs1gi1wWDylibjxdJabveoJ10NHgeb6SaYHg.kf5iTnjNKsKqhz0iE5K_Yw',
          },
          {
            name: 'redirect-idp',
            type: 'GOOGLE',
            idp: { id: 'google-123', name: undefined },
            href: 'http://localhost:3000/sso/idps/google-123?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..4z7WWUdd0LzIJLxz.GmOyeMJ5XtS7kZipFanQxaMd2rblpEeaWv8U5IfaJv5F2V1otwft4q1tVo3yqbedhBjN-nO5qk6qR-0Op34lmecwwmHeRyzYbhrFiLZaR88nhCFMblP8Bo5d3Opl5gkX02e0FQL-Osorxvml0XYbuO7GdTH5EkIv0Q7h0Dq7L__h_uFLies8AkJZWIDQh25RlqcEjToHCvVW31A_NJJ1Vf5c8GFuyb9LsJ9kUpZikpK6C72GPrU_LGrIW8VBT4l24dDEre4J8XvTNO7fdVDiq-H7BEeIjaY06q1zqlVLWwqOHoKpGNQ0NMhBIXB0ZZC57Me9pFI5GLIUwRDUIm1vw3t_mHJDVIcCJe9kmt29tTccZ8Zo0N3q5bSiwMoNHPLxZSOrbx-bf4fniorNH5ypJnke7pc2Q3DFmqfPrB7CE1REjAyCKBHYDAfVexYCkMfCl0E8oMFJinnLbynb7Bqvbp_DqL8h0pNIoXUF4KTTsuKQg8yCCqBhkajxlvh9G7L3Sf76o4B2itB7ldeqXzAE9H60yqhIKEZPNOHUgRC2SkWkWlH6NIaNWQ2Bi2CjnL9YvUuQmO-dpf08KeCgwfVmT4GBTGfTkXwy3pBitacCqEREen2j2iUH9mhi2LOOFaGLh0TXslcBgkGuht6P7gyH2JN6yFInQyIp33xQsqYg7nqOZG1LCrQSqoviTfI72-AC6b7tju8YEn1P0nXGbSzlCztSXl2pa95tr4L5pyX8fNydKYMTLeHEnmNtXlRB6wQYP1ljf4Tzgus7O0etyJs75znsXHZ42znxlEKGhTo3ucFe3CI-vsHF1FDDj2DVeWl21zVOTehTbBaemoD1ekD5F8OHS7SrK9Bw7PTa-lpyls1OxvE_Wsco4_eGbax_DoPm6DbCwj8hWzb5wLEs6TClZKoUJeV1MSVB3OgGBZ3AGzhwfeG0sGi5DnUpAeKqgP6IN8kziNRDmW3YE0qIY2mLs7nI438RTu__6bg1E6SH1QHMNucNbmoDR6VDIUmlYc0xEpygH6PBVqiPD64MnD73_D9IinVNzqW7KQzAvuFFQW_LGDfjuh1D-oTs1gi1wWDylibjxdJabveoJ10NHgeb6SaYHg.kf5iTnjNKsKqhz0iE5K_Yw',
          },
          {
            name: 'redirect-idp',
            type: 'APPLE',
            idp: { id: 'apple-123', name: undefined },
            href: 'http://localhost:3000/sso/idps/apple-123?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..4z7WWUdd0LzIJLxz.GmOyeMJ5XtS7kZipFanQxaMd2rblpEeaWv8U5IfaJv5F2V1otwft4q1tVo3yqbedhBjN-nO5qk6qR-0Op34lmecwwmHeRyzYbhrFiLZaR88nhCFMblP8Bo5d3Opl5gkX02e0FQL-Osorxvml0XYbuO7GdTH5EkIv0Q7h0Dq7L__h_uFLies8AkJZWIDQh25RlqcEjToHCvVW31A_NJJ1Vf5c8GFuyb9LsJ9kUpZikpK6C72GPrU_LGrIW8VBT4l24dDEre4J8XvTNO7fdVDiq-H7BEeIjaY06q1zqlVLWwqOHoKpGNQ0NMhBIXB0ZZC57Me9pFI5GLIUwRDUIm1vw3t_mHJDVIcCJe9kmt29tTccZ8Zo0N3q5bSiwMoNHPLxZSOrbx-bf4fniorNH5ypJnke7pc2Q3DFmqfPrB7CE1REjAyCKBHYDAfVexYCkMfCl0E8oMFJinnLbynb7Bqvbp_DqL8h0pNIoXUF4KTTsuKQg8yCCqBhkajxlvh9G7L3Sf76o4B2itB7ldeqXzAE9H60yqhIKEZPNOHUgRC2SkWkWlH6NIaNWQ2Bi2CjnL9YvUuQmO-dpf08KeCgwfVmT4GBTGfTkXwy3pBitacCqEREen2j2iUH9mhi2LOOFaGLh0TXslcBgkGuht6P7gyH2JN6yFInQyIp33xQsqYg7nqOZG1LCrQSqoviTfI72-AC6b7tju8YEn1P0nXGbSzlCztSXl2pa95tr4L5pyX8fNydKYMTLeHEnmNtXlRB6wQYP1ljf4Tzgus7O0etyJs75znsXHZ42znxlEKGhTo3ucFe3CI-vsHF1FDDj2DVeWl21zVOTehTbBaemoD1ekD5F8OHS7SrK9Bw7PTa-lpyls1OxvE_Wsco4_eGbax_DoPm6DbCwj8hWzb5wLEs6TClZKoUJeV1MSVB3OgGBZ3AGzhwfeG0sGi5DnUpAeKqgP6IN8kziNRDmW3YE0qIY2mLs7nI438RTu__6bg1E6SH1QHMNucNbmoDR6VDIUmlYc0xEpygH6PBVqiPD64MnD73_D9IinVNzqW7KQzAvuFFQW_LGDfjuh1D-oTs1gi1wWDylibjxdJabveoJ10NHgeb6SaYHg.kf5iTnjNKsKqhz0iE5K_Yw',
          },
          {
            name: 'redirect-idp',
            type: undefined,
            idp: {
              id: 'generic-oidc-123',
              name: 'Login with Joe',
              className: 'with-joe',
            },
            href: 'http://localhost:3000/sso/idps/generic-oidc-123?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..4z7WWUdd0LzIJLxz.GmOyeMJ5XtS7kZipFanQxaMd2rblpEeaWv8U5IfaJv5F2V1otwft4q1tVo3yqbedhBjN-nO5qk6qR-0Op34lmecwwmHeRyzYbhrFiLZaR88nhCFMblP8Bo5d3Opl5gkX02e0FQL-Osorxvml0XYbuO7GdTH5EkIv0Q7h0Dq7L__h_uFLies8AkJZWIDQh25RlqcEjToHCvVW31A_NJJ1Vf5c8GFuyb9LsJ9kUpZikpK6C72GPrU_LGrIW8VBT4l24dDEre4J8XvTNO7fdVDiq-H7BEeIjaY06q1zqlVLWwqOHoKpGNQ0NMhBIXB0ZZC57Me9pFI5GLIUwRDUIm1vw3t_mHJDVIcCJe9kmt29tTccZ8Zo0N3q5bSiwMoNHPLxZSOrbx-bf4fniorNH5ypJnke7pc2Q3DFmqfPrB7CE1REjAyCKBHYDAfVexYCkMfCl0E8oMFJinnLbynb7Bqvbp_DqL8h0pNIoXUF4KTTsuKQg8yCCqBhkajxlvh9G7L3Sf76o4B2itB7ldeqXzAE9H60yqhIKEZPNOHUgRC2SkWkWlH6NIaNWQ2Bi2CjnL9YvUuQmO-dpf08KeCgwfVmT4GBTGfTkXwy3pBitacCqEREen2j2iUH9mhi2LOOFaGLh0TXslcBgkGuht6P7gyH2JN6yFInQyIp33xQsqYg7nqOZG1LCrQSqoviTfI72-AC6b7tju8YEn1P0nXGbSzlCztSXl2pa95tr4L5pyX8fNydKYMTLeHEnmNtXlRB6wQYP1ljf4Tzgus7O0etyJs75znsXHZ42znxlEKGhTo3ucFe3CI-vsHF1FDDj2DVeWl21zVOTehTbBaemoD1ekD5F8OHS7SrK9Bw7PTa-lpyls1OxvE_Wsco4_eGbax_DoPm6DbCwj8hWzb5wLEs6TClZKoUJeV1MSVB3OgGBZ3AGzhwfeG0sGi5DnUpAeKqgP6IN8kziNRDmW3YE0qIY2mLs7nI438RTu__6bg1E6SH1QHMNucNbmoDR6VDIUmlYc0xEpygH6PBVqiPD64MnD73_D9IinVNzqW7KQzAvuFFQW_LGDfjuh1D-oTs1gi1wWDylibjxdJabveoJ10NHgeb6SaYHg.kf5iTnjNKsKqhz0iE5K_Yw',
          },
        ],
        idx: idxResp,
      });
    });
  });

  it('converts identify with third party ion response without redundancy', done => {
    testContext.settings.set('idps', idps);
    MockUtil.mockIntrospect(done, XHRIdentifyWithThirdPartyIdps, idxResp => {
      const result = transformResponse(testContext.settings, idxResp);
      expect(result).toEqual({
        remediations: [
          {
            value: [
              {
                label: 'Username',
                name: 'identifier',
              },
              {
                mutable: false,
                visible: false,
                value: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..aDi6JnIZwCRzk7RN.xQ1R9jj43bV5S17F1juzgTZGd9Gq7VvuE4Hc1V_tMVcTWiVQ1Ntim1tQPZtmnpfOifu-N_quGGDSdgiidb_2xU1m9SbDMJhV-Yp6E07tABwjaRd_ekuRzDFw7Jxknz33LtSwQOTQ-WiH2o6JikLiEz2BQbgoizIc2izbtdod7HJg0HVnMZ9ZlBqyBG1-EISI_xPypq8uzP8n79hP_Zz41RI7VJA35yfTuNLOX_k6B-mfeVKf4HyFsKm62XWQgcPIxhjxBMqmyZow2toNclV3sIqgw7I5tKCLQSmSnKbFxxuT4-G31BdaVOALAe9Z89zlluTYaKAPOr86RMsqaGKnQFaplc_0PiPbreKhVgvSeeJgqX2RwnLgckLLiRo7TRDs2kLhGY2ope0AeA9TSsTVdJzsScftZWKgh9iHpXjS-kGcbRx0etu4iTtbHOu3rDIfIcvvt55mfvA66wzy1CCxHt4WYNnBKHX0fIOW_fa_-RYGYug9YRV5G6nQ6V-CfHoxmEsMhsoFJu0hei34_SJv15w2l3vxxBytrWSWi5qUfm5zGjNlx8e9n1Sf_eAqXCfLhBLK4_14jwtjNbWOZCdg5dwzxQiQWDItBjijEjdQrK0i6tw2Rp-IMJD1-4_ZfFZDmAXgZZtBYc3kdmumgYpKeYUJJgw0ZJWoG-Xr0bbzGGMx46yHzMpDbSTpiWhKGytQPbNja8sf_eeOKx_AAosamDUub9yuZJb0-Nj0xvXZ89J0m_09wa2Z3G-zY01sv9ONkXMFzRVwAb2bHmGle082bq33-7Klk7_ZzzkBROJhgDHQcw5QibGWaqYqscgKv2NQV8ebGJO_BHU46p1T3MQzStxRZ2EZua9qQwsmL8P5yboNDt2YmYnUvaOcGfeAqwgovqNDQ0H4u-D5psFmiU1STLOlN5pSAauKe4VxlLxphiirrmiNOOOW0XTwaQ1vtPz8gFlXsmGB-0zcsySG6A6HJ49eOeEI0J2REy2dlFRxzdKthANM2xFc_AIgas9mcNhSWtmVEtMxv7N0xqGAJbxaJC6U4kDDXdImZVaovz4lgRFkIh3aUXgUMX558u9MBeF6Q7z3piIpT6A4I1ww_eDNM02Vew.inRUXNhsc6Evt7GAb8DPAA',
                required: true,
                name: 'stateHandle',
              },
            ],
            action: expect.any(Function),
            accepts: 'application/vnd.okta.v1+json',
            method: 'POST',
            href: 'http://localhost:3000/idp/idx/identify',
            name: 'identify',
            rel: ['create-form'],
          },
          {
            method: 'GET',
            href: 'http://localhost:3000/sso/idps/google-123?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..aDi6JnIZwCRzk7RN.xQ1R9jj43bV5S17F1juzgTZGd9Gq7VvuE4Hc1V_tMVcTWiVQ1Ntim1tQPZtmnpfOifu-N_quGGDSdgiidb_2xU1m9SbDMJhV-Yp6E07tABwjaRd_ekuRzDFw7Jxknz33LtSwQOTQ-WiH2o6JikLiEz2BQbgoizIc2izbtdod7HJg0HVnMZ9ZlBqyBG1-EISI_xPypq8uzP8n79hP_Zz41RI7VJA35yfTuNLOX_k6B-mfeVKf4HyFsKm62XWQgcPIxhjxBMqmyZow2toNclV3sIqgw7I5tKCLQSmSnKbFxxuT4-G31BdaVOALAe9Z89zlluTYaKAPOr86RMsqaGKnQFaplc_0PiPbreKhVgvSeeJgqX2RwnLgckLLiRo7TRDs2kLhGY2ope0AeA9TSsTVdJzsScftZWKgh9iHpXjS-kGcbRx0etu4iTtbHOu3rDIfIcvvt55mfvA66wzy1CCxHt4WYNnBKHX0fIOW_fa_-RYGYug9YRV5G6nQ6V-CfHoxmEsMhsoFJu0hei34_SJv15w2l3vxxBytrWSWi5qUfm5zGjNlx8e9n1Sf_eAqXCfLhBLK4_14jwtjNbWOZCdg5dwzxQiQWDItBjijEjdQrK0i6tw2Rp-IMJD1-4_ZfFZDmAXgZZtBYc3kdmumgYpKeYUJJgw0ZJWoG-Xr0bbzGGMx46yHzMpDbSTpiWhKGytQPbNja8sf_eeOKx_AAosamDUub9yuZJb0-Nj0xvXZ89J0m_09wa2Z3G-zY01sv9ONkXMFzRVwAb2bHmGle082bq33-7Klk7_ZzzkBROJhgDHQcw5QibGWaqYqscgKv2NQV8ebGJO_BHU46p1T3MQzStxRZ2EZua9qQwsmL8P5yboNDt2YmYnUvaOcGfeAqwgovqNDQ0H4u-D5psFmiU1STLOlN5pSAauKe4VxlLxphiirrmiNOOOW0XTwaQ1vtPz8gFlXsmGB-0zcsySG6A6HJ49eOeEI0J2REy2dlFRxzdKthANM2xFc_AIgas9mcNhSWtmVEtMxv7N0xqGAJbxaJC6U4kDDXdImZVaovz4lgRFkIh3aUXgUMX558u9MBeF6Q7z3piIpT6A4I1ww_eDNM02Vew.inRUXNhsc6Evt7GAb8DPAA',
            idp: {
              name: 'Google IDP',
              id: 'google-123',
            },
            type: 'GOOGLE',
            name: 'redirect-idp',
          },
          {
            method: 'GET',
            href: 'http://localhost:3000/sso/idps/facebook-123?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..aDi6JnIZwCRzk7RN.xQ1R9jj43bV5S17F1juzgTZGd9Gq7VvuE4Hc1V_tMVcTWiVQ1Ntim1tQPZtmnpfOifu-N_quGGDSdgiidb_2xU1m9SbDMJhV-Yp6E07tABwjaRd_ekuRzDFw7Jxknz33LtSwQOTQ-WiH2o6JikLiEz2BQbgoizIc2izbtdod7HJg0HVnMZ9ZlBqyBG1-EISI_xPypq8uzP8n79hP_Zz41RI7VJA35yfTuNLOX_k6B-mfeVKf4HyFsKm62XWQgcPIxhjxBMqmyZow2toNclV3sIqgw7I5tKCLQSmSnKbFxxuT4-G31BdaVOALAe9Z89zlluTYaKAPOr86RMsqaGKnQFaplc_0PiPbreKhVgvSeeJgqX2RwnLgckLLiRo7TRDs2kLhGY2ope0AeA9TSsTVdJzsScftZWKgh9iHpXjS-kGcbRx0etu4iTtbHOu3rDIfIcvvt55mfvA66wzy1CCxHt4WYNnBKHX0fIOW_fa_-RYGYug9YRV5G6nQ6V-CfHoxmEsMhsoFJu0hei34_SJv15w2l3vxxBytrWSWi5qUfm5zGjNlx8e9n1Sf_eAqXCfLhBLK4_14jwtjNbWOZCdg5dwzxQiQWDItBjijEjdQrK0i6tw2Rp-IMJD1-4_ZfFZDmAXgZZtBYc3kdmumgYpKeYUJJgw0ZJWoG-Xr0bbzGGMx46yHzMpDbSTpiWhKGytQPbNja8sf_eeOKx_AAosamDUub9yuZJb0-Nj0xvXZ89J0m_09wa2Z3G-zY01sv9ONkXMFzRVwAb2bHmGle082bq33-7Klk7_ZzzkBROJhgDHQcw5QibGWaqYqscgKv2NQV8ebGJO_BHU46p1T3MQzStxRZ2EZua9qQwsmL8P5yboNDt2YmYnUvaOcGfeAqwgovqNDQ0H4u-D5psFmiU1STLOlN5pSAauKe4VxlLxphiirrmiNOOOW0XTwaQ1vtPz8gFlXsmGB-0zcsySG6A6HJ49eOeEI0J2REy2dlFRxzdKthANM2xFc_AIgas9mcNhSWtmVEtMxv7N0xqGAJbxaJC6U4kDDXdImZVaovz4lgRFkIh3aUXgUMX558u9MBeF6Q7z3piIpT6A4I1ww_eDNM02Vew.inRUXNhsc6Evt7GAb8DPAA',
            idp: {
              name: 'Facebook IDP',
              id: 'facebook-123',
            },
            type: 'FACEBOOK',
            name: 'redirect-idp',
          },
          {
            method: 'GET',
            href: 'http://localhost:3000/sso/idps/linkedin-123?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..aDi6JnIZwCRzk7RN.xQ1R9jj43bV5S17F1juzgTZGd9Gq7VvuE4Hc1V_tMVcTWiVQ1Ntim1tQPZtmnpfOifu-N_quGGDSdgiidb_2xU1m9SbDMJhV-Yp6E07tABwjaRd_ekuRzDFw7Jxknz33LtSwQOTQ-WiH2o6JikLiEz2BQbgoizIc2izbtdod7HJg0HVnMZ9ZlBqyBG1-EISI_xPypq8uzP8n79hP_Zz41RI7VJA35yfTuNLOX_k6B-mfeVKf4HyFsKm62XWQgcPIxhjxBMqmyZow2toNclV3sIqgw7I5tKCLQSmSnKbFxxuT4-G31BdaVOALAe9Z89zlluTYaKAPOr86RMsqaGKnQFaplc_0PiPbreKhVgvSeeJgqX2RwnLgckLLiRo7TRDs2kLhGY2ope0AeA9TSsTVdJzsScftZWKgh9iHpXjS-kGcbRx0etu4iTtbHOu3rDIfIcvvt55mfvA66wzy1CCxHt4WYNnBKHX0fIOW_fa_-RYGYug9YRV5G6nQ6V-CfHoxmEsMhsoFJu0hei34_SJv15w2l3vxxBytrWSWi5qUfm5zGjNlx8e9n1Sf_eAqXCfLhBLK4_14jwtjNbWOZCdg5dwzxQiQWDItBjijEjdQrK0i6tw2Rp-IMJD1-4_ZfFZDmAXgZZtBYc3kdmumgYpKeYUJJgw0ZJWoG-Xr0bbzGGMx46yHzMpDbSTpiWhKGytQPbNja8sf_eeOKx_AAosamDUub9yuZJb0-Nj0xvXZ89J0m_09wa2Z3G-zY01sv9ONkXMFzRVwAb2bHmGle082bq33-7Klk7_ZzzkBROJhgDHQcw5QibGWaqYqscgKv2NQV8ebGJO_BHU46p1T3MQzStxRZ2EZua9qQwsmL8P5yboNDt2YmYnUvaOcGfeAqwgovqNDQ0H4u-D5psFmiU1STLOlN5pSAauKe4VxlLxphiirrmiNOOOW0XTwaQ1vtPz8gFlXsmGB-0zcsySG6A6HJ49eOeEI0J2REy2dlFRxzdKthANM2xFc_AIgas9mcNhSWtmVEtMxv7N0xqGAJbxaJC6U4kDDXdImZVaovz4lgRFkIh3aUXgUMX558u9MBeF6Q7z3piIpT6A4I1ww_eDNM02Vew.inRUXNhsc6Evt7GAb8DPAA',
            idp: {
              name: 'Linkedin IDP',
              id: 'linkedin-123',
            },
            type: 'LINKEDIN',
            name: 'redirect-idp',
          },
          {
            method: 'GET',
            href: 'http://localhost:3000/sso/idps/microsoft-123?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..aDi6JnIZwCRzk7RN.xQ1R9jj43bV5S17F1juzgTZGd9Gq7VvuE4Hc1V_tMVcTWiVQ1Ntim1tQPZtmnpfOifu-N_quGGDSdgiidb_2xU1m9SbDMJhV-Yp6E07tABwjaRd_ekuRzDFw7Jxknz33LtSwQOTQ-WiH2o6JikLiEz2BQbgoizIc2izbtdod7HJg0HVnMZ9ZlBqyBG1-EISI_xPypq8uzP8n79hP_Zz41RI7VJA35yfTuNLOX_k6B-mfeVKf4HyFsKm62XWQgcPIxhjxBMqmyZow2toNclV3sIqgw7I5tKCLQSmSnKbFxxuT4-G31BdaVOALAe9Z89zlluTYaKAPOr86RMsqaGKnQFaplc_0PiPbreKhVgvSeeJgqX2RwnLgckLLiRo7TRDs2kLhGY2ope0AeA9TSsTVdJzsScftZWKgh9iHpXjS-kGcbRx0etu4iTtbHOu3rDIfIcvvt55mfvA66wzy1CCxHt4WYNnBKHX0fIOW_fa_-RYGYug9YRV5G6nQ6V-CfHoxmEsMhsoFJu0hei34_SJv15w2l3vxxBytrWSWi5qUfm5zGjNlx8e9n1Sf_eAqXCfLhBLK4_14jwtjNbWOZCdg5dwzxQiQWDItBjijEjdQrK0i6tw2Rp-IMJD1-4_ZfFZDmAXgZZtBYc3kdmumgYpKeYUJJgw0ZJWoG-Xr0bbzGGMx46yHzMpDbSTpiWhKGytQPbNja8sf_eeOKx_AAosamDUub9yuZJb0-Nj0xvXZ89J0m_09wa2Z3G-zY01sv9ONkXMFzRVwAb2bHmGle082bq33-7Klk7_ZzzkBROJhgDHQcw5QibGWaqYqscgKv2NQV8ebGJO_BHU46p1T3MQzStxRZ2EZua9qQwsmL8P5yboNDt2YmYnUvaOcGfeAqwgovqNDQ0H4u-D5psFmiU1STLOlN5pSAauKe4VxlLxphiirrmiNOOOW0XTwaQ1vtPz8gFlXsmGB-0zcsySG6A6HJ49eOeEI0J2REy2dlFRxzdKthANM2xFc_AIgas9mcNhSWtmVEtMxv7N0xqGAJbxaJC6U4kDDXdImZVaovz4lgRFkIh3aUXgUMX558u9MBeF6Q7z3piIpT6A4I1ww_eDNM02Vew.inRUXNhsc6Evt7GAb8DPAA',
            idp: {
              name: 'Microsoft IDP',
              id: 'microsoft-123',
            },
            type: 'MICROSOFT',
            name: 'redirect-idp',
          },
          {
            method: 'GET',
            href: 'http://localhost:3000/sso/idps/apple-123?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..aDi6JnIZwCRzk7RN.xQ1R9jj43bV5S17F1juzgTZGd9Gq7VvuE4Hc1V_tMVcTWiVQ1Ntim1tQPZtmnpfOifu-N_quGGDSdgiidb_2xU1m9SbDMJhV-Yp6E07tABwjaRd_ekuRzDFw7Jxknz33LtSwQOTQ-WiH2o6JikLiEz2BQbgoizIc2izbtdod7HJg0HVnMZ9ZlBqyBG1-EISI_xPypq8uzP8n79hP_Zz41RI7VJA35yfTuNLOX_k6B-mfeVKf4HyFsKm62XWQgcPIxhjxBMqmyZow2toNclV3sIqgw7I5tKCLQSmSnKbFxxuT4-G31BdaVOALAe9Z89zlluTYaKAPOr86RMsqaGKnQFaplc_0PiPbreKhVgvSeeJgqX2RwnLgckLLiRo7TRDs2kLhGY2ope0AeA9TSsTVdJzsScftZWKgh9iHpXjS-kGcbRx0etu4iTtbHOu3rDIfIcvvt55mfvA66wzy1CCxHt4WYNnBKHX0fIOW_fa_-RYGYug9YRV5G6nQ6V-CfHoxmEsMhsoFJu0hei34_SJv15w2l3vxxBytrWSWi5qUfm5zGjNlx8e9n1Sf_eAqXCfLhBLK4_14jwtjNbWOZCdg5dwzxQiQWDItBjijEjdQrK0i6tw2Rp-IMJD1-4_ZfFZDmAXgZZtBYc3kdmumgYpKeYUJJgw0ZJWoG-Xr0bbzGGMx46yHzMpDbSTpiWhKGytQPbNja8sf_eeOKx_AAosamDUub9yuZJb0-Nj0xvXZ89J0m_09wa2Z3G-zY01sv9ONkXMFzRVwAb2bHmGle082bq33-7Klk7_ZzzkBROJhgDHQcw5QibGWaqYqscgKv2NQV8ebGJO_BHU46p1T3MQzStxRZ2EZua9qQwsmL8P5yboNDt2YmYnUvaOcGfeAqwgovqNDQ0H4u-D5psFmiU1STLOlN5pSAauKe4VxlLxphiirrmiNOOOW0XTwaQ1vtPz8gFlXsmGB-0zcsySG6A6HJ49eOeEI0J2REy2dlFRxzdKthANM2xFc_AIgas9mcNhSWtmVEtMxv7N0xqGAJbxaJC6U4kDDXdImZVaovz4lgRFkIh3aUXgUMX558u9MBeF6Q7z3piIpT6A4I1ww_eDNM02Vew.inRUXNhsc6Evt7GAb8DPAA',
            idp: {
              name: 'Apple IDP',
              id: 'apple-123',
            },
            type: 'APPLE',
            name: 'redirect-idp',
          },
          {
            method: 'GET',
            href: 'https://okta.mtls.okta.com/sso/idps/mtlsidp?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25',
            idp: {
              id: 'x509-123',
              name: 'X509 Authentication',
            },
            name: 'piv-idp',
            type: 'X509',
          },
          {
            value: [
              {
                mutable: false,
                visible: false,
                value: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..aDi6JnIZwCRzk7RN.xQ1R9jj43bV5S17F1juzgTZGd9Gq7VvuE4Hc1V_tMVcTWiVQ1Ntim1tQPZtmnpfOifu-N_quGGDSdgiidb_2xU1m9SbDMJhV-Yp6E07tABwjaRd_ekuRzDFw7Jxknz33LtSwQOTQ-WiH2o6JikLiEz2BQbgoizIc2izbtdod7HJg0HVnMZ9ZlBqyBG1-EISI_xPypq8uzP8n79hP_Zz41RI7VJA35yfTuNLOX_k6B-mfeVKf4HyFsKm62XWQgcPIxhjxBMqmyZow2toNclV3sIqgw7I5tKCLQSmSnKbFxxuT4-G31BdaVOALAe9Z89zlluTYaKAPOr86RMsqaGKnQFaplc_0PiPbreKhVgvSeeJgqX2RwnLgckLLiRo7TRDs2kLhGY2ope0AeA9TSsTVdJzsScftZWKgh9iHpXjS-kGcbRx0etu4iTtbHOu3rDIfIcvvt55mfvA66wzy1CCxHt4WYNnBKHX0fIOW_fa_-RYGYug9YRV5G6nQ6V-CfHoxmEsMhsoFJu0hei34_SJv15w2l3vxxBytrWSWi5qUfm5zGjNlx8e9n1Sf_eAqXCfLhBLK4_14jwtjNbWOZCdg5dwzxQiQWDItBjijEjdQrK0i6tw2Rp-IMJD1-4_ZfFZDmAXgZZtBYc3kdmumgYpKeYUJJgw0ZJWoG-Xr0bbzGGMx46yHzMpDbSTpiWhKGytQPbNja8sf_eeOKx_AAosamDUub9yuZJb0-Nj0xvXZ89J0m_09wa2Z3G-zY01sv9ONkXMFzRVwAb2bHmGle082bq33-7Klk7_ZzzkBROJhgDHQcw5QibGWaqYqscgKv2NQV8ebGJO_BHU46p1T3MQzStxRZ2EZua9qQwsmL8P5yboNDt2YmYnUvaOcGfeAqwgovqNDQ0H4u-D5psFmiU1STLOlN5pSAauKe4VxlLxphiirrmiNOOOW0XTwaQ1vtPz8gFlXsmGB-0zcsySG6A6HJ49eOeEI0J2REy2dlFRxzdKthANM2xFc_AIgas9mcNhSWtmVEtMxv7N0xqGAJbxaJC6U4kDDXdImZVaovz4lgRFkIh3aUXgUMX558u9MBeF6Q7z3piIpT6A4I1ww_eDNM02Vew.inRUXNhsc6Evt7GAb8DPAA',
                required: true,
                name: 'stateHandle',
              },
            ],
            action: expect.any(Function),
            accepts: 'application/vnd.okta.v1+json',
            method: 'POST',
            href: 'http://localhost:3000/idp/idx/enroll',
            name: 'select-enroll-profile',
            rel: ['create-form'],
          },
          {
            type: undefined,
            href: 'http://localhost:3000/sso/idps/generic-oidc-123?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..aDi6JnIZwCRzk7RN.xQ1R9jj43bV5S17F1juzgTZGd9Gq7VvuE4Hc1V_tMVcTWiVQ1Ntim1tQPZtmnpfOifu-N_quGGDSdgiidb_2xU1m9SbDMJhV-Yp6E07tABwjaRd_ekuRzDFw7Jxknz33LtSwQOTQ-WiH2o6JikLiEz2BQbgoizIc2izbtdod7HJg0HVnMZ9ZlBqyBG1-EISI_xPypq8uzP8n79hP_Zz41RI7VJA35yfTuNLOX_k6B-mfeVKf4HyFsKm62XWQgcPIxhjxBMqmyZow2toNclV3sIqgw7I5tKCLQSmSnKbFxxuT4-G31BdaVOALAe9Z89zlluTYaKAPOr86RMsqaGKnQFaplc_0PiPbreKhVgvSeeJgqX2RwnLgckLLiRo7TRDs2kLhGY2ope0AeA9TSsTVdJzsScftZWKgh9iHpXjS-kGcbRx0etu4iTtbHOu3rDIfIcvvt55mfvA66wzy1CCxHt4WYNnBKHX0fIOW_fa_-RYGYug9YRV5G6nQ6V-CfHoxmEsMhsoFJu0hei34_SJv15w2l3vxxBytrWSWi5qUfm5zGjNlx8e9n1Sf_eAqXCfLhBLK4_14jwtjNbWOZCdg5dwzxQiQWDItBjijEjdQrK0i6tw2Rp-IMJD1-4_ZfFZDmAXgZZtBYc3kdmumgYpKeYUJJgw0ZJWoG-Xr0bbzGGMx46yHzMpDbSTpiWhKGytQPbNja8sf_eeOKx_AAosamDUub9yuZJb0-Nj0xvXZ89J0m_09wa2Z3G-zY01sv9ONkXMFzRVwAb2bHmGle082bq33-7Klk7_ZzzkBROJhgDHQcw5QibGWaqYqscgKv2NQV8ebGJO_BHU46p1T3MQzStxRZ2EZua9qQwsmL8P5yboNDt2YmYnUvaOcGfeAqwgovqNDQ0H4u-D5psFmiU1STLOlN5pSAauKe4VxlLxphiirrmiNOOOW0XTwaQ1vtPz8gFlXsmGB-0zcsySG6A6HJ49eOeEI0J2REy2dlFRxzdKthANM2xFc_AIgas9mcNhSWtmVEtMxv7N0xqGAJbxaJC6U4kDDXdImZVaovz4lgRFkIh3aUXgUMX558u9MBeF6Q7z3piIpT6A4I1ww_eDNM02Vew.inRUXNhsc6Evt7GAb8DPAA',
            idp: {
              className: 'with-joe',
              name: 'Login with Joe',
              id: 'generic-oidc-123',
            },
            name: 'redirect-idp',
          },
        ],
        idx: idxResp,
      });
    });
  });
});
