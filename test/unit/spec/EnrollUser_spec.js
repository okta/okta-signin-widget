/* eslint max-params: [2, 13], max-len: [2, 160] */
define([
  'okta',
  '@okta/okta-auth-js/jquery',
  'util/Util',
  'helpers/mocks/Util',
  'helpers/dom/EnrollUserForm',
  'helpers/util/Expect',
  'LoginRouter',
  'sandbox',
  'helpers/xhr/PROFILE_REQUIRED_UPDATE',
  'helpers/xhr/PROFILE_REQUIRED_NEW',
  'helpers/xhr/SUCCESS',
  'helpers/xhr/UNAUTHENTICATED_IDX'
],
function (Okta, OktaAuth, LoginUtil, Util, EnrollUserForm, Expect, Router,
  $sandbox, resProfileRequiredUpdate, resProfileRequiredNew, resSuccess, resUnauthenticatedIdx) {

  var { _, $ } = Okta;
  var itp = Expect.itp;

  function setup (isUnauthenticated) {
    var settings = {};
    var successSpy = jasmine.createSpy('successSpy');
    var setNextResponse = Util.mockAjax();
    var nextResponse = isUnauthenticated ? resUnauthenticatedIdx : resProfileRequiredUpdate;
    setNextResponse(nextResponse);
    var baseUrl = 'https://example.okta.com';
    var logoUrl = 'https://logo.com';
    var authClient = new OktaAuth({ url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR });
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      features: { consent: true },
      logo: logoUrl,
      authClient: authClient,
      globalSuccessFn: successSpy
    }, settings));
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);
    Util.mockJqueryCss();
    return Util.mockIntrospectResponse(router, nextResponse).then(function () {
      router.refreshAuthState('dummy-token');
      return settings = {
        router: router,
        successSpy: successSpy,
        form: new EnrollUserForm($sandbox),
        ac: authClient,
        setNextResponse: setNextResponse
      };
    });
  }

  function setupEnroll () {
    return Expect.waitForEnrollUser(setup(false));
  }

  function setupUnAuthenticated () {
    return Expect.waitForPrimaryAuth(setup(true));
  }

  Expect.describe('Enroll User Form', function () {
    itp('has the correct title on the enroll form', function () {
      return setupEnroll().then(function (test) {
        expect(test.form.formTitle().text()).toContain('Create Account');
      });
    });
    itp('has the correct title on the register button', function () {
      return setupEnroll().then(function (test) {
        expect(test.form.formButton()[0].value).toEqual('Register');
      });
    });
    itp('does not allow empty form submit', function () {
      return setupEnroll().then(function (test) {
        test.form.formButton().click();
        expect(test.form.errorMessage()).toEqual('We found some errors. Please review the form and make corrections.');
      });
    });
    itp('renders the right fields based on API response', function () {
      return setupEnroll().then(function (test) {
        expect(test.form.formInputs('streetAddress').length).toEqual(1);
        expect(test.form.formInputs('streetAddress').find('input').attr('placeholder')).toEqual('enter streetAddress *'); 
        expect(test.form.formInputs('streetAddress').hasClass('okta-form-input-field input-fix')).toBe(true);

        expect(test.form.formInputs('employeeId').length).toEqual(1);
        expect(test.form.formInputs('employeeId').find('input').attr('placeholder')).toEqual('enter employeeId *'); 
        expect(test.form.formInputs('employeeId').hasClass('okta-form-input-field input-fix')).toBe(true);
      });
    });
    itp('makes call to enroll if isEnrollWithLoginIntent is true and then renders the right fields based on API response', function () {
      return setupUnAuthenticated().then(function (test) {
        
        test.setNextResponse(resProfileRequiredNew);
        test.form.$('.registration-link').click();
        return Expect.waitForEnrollUser(test);
      }).then(function (test) {
        $.ajax.calls.reset();
        test.setNextResponse(resSuccess);
        expect(test.form.formInputs('streetAddress').length).toEqual(1);
        expect(test.form.formInputs('streetAddress').hasClass('okta-form-input-field input-fix')).toBe(true);
        expect(test.form.formInputs('employeeId').length).toEqual(1);
        expect(test.form.formInputs('employeeId').hasClass('okta-form-input-field input-fix')).toBe(true);
        var model = test.router.controller.model;
        model.set('streetAddress', 'street address');
        model.set('employeeId', '1234');
        model.set('createNewAccount', true);
        model.save();
        return Expect.waitForEnrollUser(test);
      }).then(function () {
        expect($.ajax.calls.count()).toBe(1);
        Expect.isJsonPost($.ajax.calls.argsFor(0), {
          url: 'https://foo.okta.com/api/v1/authn/enroll',
          data: {
            'registration': {
              'createNewAccount': true,
              'profile': {
                'streetAddress': 'street address',
                'employeeId': '1234'
              }
            },
            'stateToken': '01nDL4wRHu-dLvUHUj1QCA9r5P1n5dw6WJ_voGPFWB'
          }
        });
      });
    });
    itp('enroll user form submit makes the correct post call', function () {
      return setupEnroll().then(function (test) {
        $.ajax.calls.reset();
        test.setNextResponse(resSuccess);
        var model = test.router.controller.model;
        model.set('streetAddress', 'street address');
        model.set('employeeId', '1234');
        model.set('createNewAccount', false);
        model.save();
        return Expect.waitForEnrollUser(test);
      }).then(function () {
        expect($.ajax.calls.count()).toBe(1);
        Expect.isJsonPost($.ajax.calls.argsFor(0), {
          url: 'https://foo.okta.com/api/v1/authn/enroll',
          data: {
            'registration': {
              'profile': {
                'streetAddress': 'street address',
                'employeeId': '1234'
              }
            },
            'stateToken': '01nDL4wRHu-dLvUHUj1QCA9r5P1n5dw6WJ_voGPFWB'
          }
        });
      });
    });
  });
});
