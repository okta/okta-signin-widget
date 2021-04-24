import { $ } from 'okta';
import PrimaryAuthForm from 'helpers/dom/PrimaryAuthForm';
import Expect from 'helpers/util/Expect';
import errorResponse from 'helpers/xhr/ERROR_invalid_token';
import introspectResponse from 'helpers/xhr/UNAUTHENTICATED';
import 'jasmine-ajax';
import Q from 'q';
import $sandbox from 'sandbox';
import Logger from 'util/Logger';
import Widget from 'widget/OktaSignIn';

const url = 'https://foo.com';

describe('OktaSignIn v1 pipeline bootstrap ', function() {
  let signIn;
  const form = new PrimaryAuthForm($sandbox);

  beforeEach(function() {
    jest.spyOn(Logger, 'warn').mockImplementation(() => { });
    signIn = new Widget({
      baseUrl: url,
      stateToken: '00stateToken',
      features: {
        router: true,
      },
    });
  });

  afterEach(function() {
    signIn.remove();
  });

  function setupIntrospect(responseData) {
    jest.spyOn(window.history, 'pushState').mockImplementation(() => { });
    jest.spyOn(signIn.authClient.tx, 'introspect').mockImplementation(function() {
      if (responseData.status !== 200) {
        return Q.reject(responseData.response);
      } else {
        return Q({
          data: responseData.response,
        });
      }
    });
    signIn.renderEl({ el: $sandbox });
    return Expect.wait(() => {
      return $('.primary-auth').length === 1;
    });
  }

  describe('Introspects token and loads primary auth view for old pipeline', function() {
    it('calls introspect API on page load using authjs as client', function() {
      return setupIntrospect(introspectResponse).then(function() {
        expect(window.history.pushState.mock.calls[0][2]).toBe('/signin/refresh-auth-state/00stateToken');
        expect(signIn.authClient.tx.introspect).toHaveBeenCalledWith({ stateToken: '00stateToken' });
        expect(form.isPrimaryAuth()).toBe(true);
        const password = form.passwordField();

        expect(password.length).toBe(1);
        expect(password.attr('type')).toEqual('password');
        expect(password.attr('id')).toEqual('okta-signin-password');
        const username = form.usernameField();

        expect(username.length).toBe(1);
        expect(username.attr('type')).toEqual('text');
        expect(username.attr('id')).toEqual('okta-signin-username');
        const signInButton = form.signInButton();

        expect(signInButton.length).toBe(1);
        expect(signInButton.attr('type')).toEqual('submit');
        expect(signInButton.attr('id')).toEqual('okta-signin-submit');
      });
    });

    it('calls introspect API on page load and handles error using authjs as client', function() {
      return setupIntrospect(errorResponse).then(function() {
        expect(window.history.pushState.mock.calls[0][2]).toBe('/signin/refresh-auth-state/00stateToken');
        expect(signIn.authClient.tx.introspect).toHaveBeenCalledWith({ stateToken: '00stateToken' });
        expect(form.isPrimaryAuth()).toBe(true);
        const password = form.passwordField();

        expect(password.length).toBe(1);
        expect(password.attr('type')).toEqual('password');
        expect(password.attr('id')).toEqual('okta-signin-password');
        const username = form.usernameField();

        expect(username.length).toBe(1);
        expect(username.attr('type')).toEqual('text');
        expect(username.attr('id')).toEqual('okta-signin-username');
        const signInButton = form.signInButton();

        expect(signInButton.length).toBe(1);
        expect(signInButton.attr('type')).toEqual('submit');
        expect(signInButton.attr('id')).toEqual('okta-signin-submit');
        Q.resetUnhandledRejections();
      });
    });
  });
});
