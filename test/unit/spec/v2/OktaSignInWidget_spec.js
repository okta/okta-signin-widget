/* eslint max-params:[0, 2] */
import { $ } from 'okta';
import Expect from 'helpers/util/Expect';
import 'jasmine-ajax';
import Q from 'q';
import $sandbox from 'sandbox';
import Logger from 'util/Logger';
import Widget from 'widget/OktaSignIn';
const url = 'https://foo.com';


Expect.describe('OktaSignIn initialization', function () {
  let signIn;

  beforeEach(function () {
    jasmine.Ajax.install();
    jasmine.Ajax.stubRequest(/https:\/\/foo.com.*/).andReturn({
      status: 200,
      responseText: ''
    });
    spyOn(Logger, 'warn');
    signIn = new Widget({
      baseUrl: url
    });
  });
  afterEach(function () {
    jasmine.Ajax.uninstall();
  });

  function setupIntrospect (options) {
    signIn = new Widget({
      baseUrl: url,
      stateToken: '01stateToken',
      features: {
        router: true
      }
    });
    spyOn(signIn.authClient.tx, 'evaluate').and.callFake(function () {
      return options.response;
    });
    spyOn($, 'ajax');
    signIn.renderEl({ el: $sandbox });
    return Q({});
  }
  Expect.describe('Introspects token on load', function () {
    it('calls introspect API on page load', function () {
      return setupIntrospect({
        response: {
          version: '1.0.0'
        }
      }).then(function () {
        expect(signIn.authClient.tx.evaluate).toHaveBeenCalledWith({ stateToken: '01stateToken', introspect: true });
      });
    });
  });
});