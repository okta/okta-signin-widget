/* eslint max-params: [2, 13], max-len: [2, 160] */
import { _ } from '@okta/courage';
import getAuthClient from 'helpers/getAuthClient';
import Router from 'v1/LoginRouter';
import $sandbox from 'sandbox';
import Expect from 'helpers/util/Expect';
import Util from 'helpers/mocks/Util';
import PrimaryAuthForm from 'helpers/dom/PrimaryAuthForm';
import Animations from 'util/Animations';
const itp = Expect.itp;


function setup(settings) {
  settings || (settings = {});
  const baseUrl = 'https://foo.com';
  const authClient = getAuthClient({
    authParams: { issuer: baseUrl }
  });
  const router = new Router(
    _.extend(
      {
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        'features.router': true,
      },
      settings
    )
  );
  Util.registerRouter(router);
  Util.mockRouterNavigate(router, true);

  const test = {
    router: router,
    form: new PrimaryAuthForm($sandbox),
    ac: authClient,
  };

  return Expect.waitForPrimaryAuth(test);
}

function mockAnimations() {
  const ret = {
    afterAnimation: null,
    waitForAnimationComplete: function(cb) {
      return Expect.wait(() => !!ret.afterAnimation, cb);
    }
  };
  const originalSwapPages = Animations.swapPages;
  spyOn(Animations, 'swapPages').and.callFake(function(opts) {
    const origSuccess = opts.success;
    spyOn(opts, 'success').and.callFake(function() {
      ret.afterAnimation = () => origSuccess.apply(this, arguments);
    });
    return originalSwapPages.apply(this, arguments);
  });
  return ret;
};


Expect.describe('Animations.swapPages', function() {
  itp('should remove styles from new form on animation complete', function() {
    const mock = mockAnimations();
    // Open PrimaryAuth page
    return setup().then(function(test) {
      // Trigger transition to ForgotPassword page
      test.form.helpFooter().click();
      test.form.forgotPasswordLink().click();
      expect(test.router.navigate).toHaveBeenCalledWith('signin/forgot-password', { trigger: true });
      // Wait for animation is completed, but success callback is not called
      return mock.waitForAnimationComplete(test).then(function(test) {
        // Check that styles were cleared for old and new pages
        const oldForm = test.form.$('.primary-auth').get(0);
        const newForm = test.form.$('.forgot-password').get(0);
        expect(getComputedStyle(oldForm).position).not.toBe('absolute');
        expect(getComputedStyle(oldForm).opacity).toBe('0');
        expect(getComputedStyle(newForm).position).not.toBe('absolute');
        expect(getComputedStyle(newForm).opacity).toBe('1');
        expect(getComputedStyle(newForm).left).toBe('auto');
        expect(getComputedStyle(newForm).top).toBe('auto');

        // Run a success callback manually
        mock.afterAnimation();
        return Expect.waitForForgotPassword(test).then(function(test) {
          // Old page should be removed from DOM
          const $oldForm = test.form.$('.primary-auth');
          expect($oldForm.length).toBe(0);
        });
      });
    });
  });
});
