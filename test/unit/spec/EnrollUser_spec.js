/* eslint max-params: [2, 13], max-len: [2, 160] */
import { _ } from 'okta';
import getAuthClient from 'widget/getAuthClient';
import Router from 'LoginRouter';
import EnrollUserForm from 'helpers/dom/EnrollUserForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resProfileRequiredNew from 'helpers/xhr/PROFILE_REQUIRED_NEW';
import resProfileRequiredUpdate from 'helpers/xhr/PROFILE_REQUIRED_UPDATE';
import resSuccess from 'helpers/xhr/SUCCESS';
import resUnauthenticatedIdx from 'helpers/xhr/UNAUTHENTICATED_IDX';
import $sandbox from 'sandbox';
import LoginUtil from 'util/Util';
const itp = Expect.itp;

function setup(isUnauthenticated) {
  let settings = {};
  const successSpy = jasmine.createSpy('successSpy');
  const setNextResponse = Util.mockAjax();
  const nextResponse = isUnauthenticated ? resUnauthenticatedIdx : resProfileRequiredUpdate;

  setNextResponse(nextResponse);
  const baseUrl = 'https://example.okta.com';
  const logoUrl = 'https://logo.com';
  const authClient = getAuthClient({
    authParams: { issuer: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR }
  });
  const router = new Router(
    _.extend(
      {
        el: $sandbox,
        baseUrl: baseUrl,
        logo: logoUrl,
        authClient: authClient,
        globalSuccessFn: successSpy,
      },
      settings
    )
  );

  Util.registerRouter(router);
  Util.mockRouterNavigate(router);
  Util.mockJqueryCss();
  router.refreshAuthState('dummy-token');
  return (settings = {
    router: router,
    successSpy: successSpy,
    form: new EnrollUserForm($sandbox),
    ac: authClient,
    setNextResponse: setNextResponse,
  });
}

function setupEnroll() {
  return Expect.waitForEnrollUser(setup(false));
}

function setupUnAuthenticated() {
  return Expect.waitForPrimaryAuth(setup(true));
}

Expect.describe('Enroll User Form', function() {
  itp('has the correct title on the enroll form', function() {
    return setupEnroll().then(function(test) {
      expect(test.form.formTitle().text()).toContain('Create Account');
    });
  });
  itp('has the correct title on the register button', function() {
    return setupEnroll().then(function(test) {
      expect(test.form.formButton()[0].value).toEqual('Register');
    });
  });
  itp('does not allow empty form submit', function() {
    return setupEnroll().then(function(test) {
      test.form.formButton().click();
      expect(test.form.errorMessage()).toEqual('We found some errors. Please review the form and make corrections.');
    });
  });
  itp('renders the right fields based on API response', function() {
    return setupEnroll().then(function(test) {
      expect(test.form.formInputs('streetAddress').length).toEqual(1);
      expect(test.form.formInputs('streetAddress').find('input').attr('placeholder')).toEqual('enter streetAddress *');
      expect(test.form.formInputs('streetAddress').hasClass('okta-form-input-field input-fix')).toBe(true);

      expect(test.form.formInputs('employeeId').length).toEqual(1);
      expect(test.form.formInputs('employeeId').find('input').attr('placeholder')).toEqual('enter employeeId *');
      expect(test.form.formInputs('employeeId').hasClass('okta-form-input-field input-fix')).toBe(true);
    });
  });
  itp(
    'makes call to enroll if isEnrollWithLoginIntent is true and then renders the right fields based on API response',
    function() {
      return setupUnAuthenticated()
        .then(function(test) {
          test.setNextResponse(resProfileRequiredNew);
          test.form.$('.registration-link').click();
          return Expect.waitForEnrollUser(test);
        })
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resSuccess);
          expect(test.form.formInputs('streetAddress').length).toEqual(1);
          expect(test.form.formInputs('streetAddress').hasClass('okta-form-input-field input-fix')).toBe(true);
          expect(test.form.formInputs('employeeId').length).toEqual(1);
          expect(test.form.formInputs('employeeId').hasClass('okta-form-input-field input-fix')).toBe(true);
          const model = test.router.controller.model;

          model.set('streetAddress', 'street address');
          model.set('employeeId', '1234');
          model.set('createNewAccount', true);
          model.save();
          return Expect.waitForEnrollUser(test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.okta.com/api/v1/authn/enroll',
            data: {
              registration: {
                createNewAccount: true,
                profile: {
                  streetAddress: 'street address',
                  employeeId: '1234',
                },
              },
              stateToken: '01nDL4wRHu-dLvUHUj1QCA9r5P1n5dw6WJ_voGPFWB',
            },
          });
        });
    }
  );
  itp('enroll user form submit makes the correct post call', function() {
    return setupEnroll()
      .then(function(test) {
        Util.resetAjaxRequests();
        test.setNextResponse(resSuccess);
        const model = test.router.controller.model;

        model.set('streetAddress', 'street address');
        model.set('employeeId', '1234');
        model.set('createNewAccount', false);
        model.save();
        return Expect.waitForEnrollUser(test);
      })
      .then(function() {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.okta.com/api/v1/authn/enroll',
          data: {
            registration: {
              profile: {
                streetAddress: 'street address',
                employeeId: '1234',
              },
            },
            stateToken: '01nDL4wRHu-dLvUHUj1QCA9r5P1n5dw6WJ_voGPFWB',
          },
        });
      });
  });
});
