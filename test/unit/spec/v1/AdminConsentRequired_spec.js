import { _ } from 'okta';
import getAuthClient from 'helpers/getAuthClient';
import LoginRouter from 'v1/LoginRouter';
import AdminConsentRequiredForm from 'helpers/dom/AdminConsentRequiredForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resAdminConsentRequired from 'helpers/xhr/ADMIN_CONSENT_REQUIRED';
import resCancel from 'helpers/xhr/CANCEL';
import resSuccess from 'helpers/xhr/SUCCESS';
import $sandbox from 'sandbox';
import LoginUtil from 'util/Util';

const itp = Expect.itp;

function deepClone(res) {
  return JSON.parse(JSON.stringify(res));
}

function setup(settings, res = resAdminConsentRequired) {
  settings || (settings = {});
  const successSpy = jasmine.createSpy('successSpy');
  const setNextResponse = Util.mockAjax();
  const baseUrl = window.location.origin;
  const authClient = getAuthClient({
    authParams: {
      issuer: baseUrl,
      transformErrorXHR: LoginUtil.transformErrorXHR,
    }
  });
  const router = new LoginRouter(
    _.extend(
      {
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: successSpy,
      },
      settings
    )
  );
  Util.registerRouter(router);
  Util.mockRouterNavigate(router);
  setNextResponse(res);
  router.refreshAuthState('dummy-token');
  settings = {
    router: router,
    successSpy: successSpy,
    form: new AdminConsentRequiredForm($sandbox),
    setNextResponse: setNextResponse,
  };
  return Expect.waitForAdminConsentRequired(settings);
}

function setupClientLogo() {
  const resConsentRequiredClientLogo = deepClone(resAdminConsentRequired);
  const customLogo = {
    href: '/base/test/unit/assets/logo.svg',
    type: 'image/png',
  };
  resConsentRequiredClientLogo.response._embedded.target._links.logo = customLogo;
  return setup(undefined, resConsentRequiredClientLogo);
}

function setupClientUri() {
  const resConsentRequiredClientUri = deepClone(resAdminConsentRequired);
  resConsentRequiredClientUri.response._embedded.target._links['client-uri'] = {
    href: `${window.location.origin}/client-uri.html`,
    type: 'text/html',
  };
  return setup(undefined, resConsentRequiredClientUri);
}

function setupLessScopes() {
  const resp = deepClone(resAdminConsentRequired);
  resp.response._embedded.scopes = resp.response._embedded.scopes.slice(0, 2);
  return setup(undefined, resp);
}

Expect.describe('AdminConsentRequired', function() {
  itp('has the correct number of scopes - all groups and scopes', function() {
    return setup().then(function({ form }) {
      expect(form.scopeGroupList().length).toBe(4);

      expect(form.scopeGroupName(0)).toBe('User and groups');
      expect(form.scopeNames(0)).toEqual(['okta.groups.read', 'okta.users.manage']);

      expect(form.scopeGroupName(1)).toBe('Resource and policies');
      expect(form.scopeNames(1)).toEqual(['okta.clients.read', 'okta.idps.read']);

      expect(form.scopeGroupName(2)).toBe('Hooks');
      expect(form.scopeNames(2)).toEqual(['okta.eventHooks.read', 'okta.inlineHooks.read']);

      expect(form.scopeGroupName(3)).toBe('System');
      expect(form.scopeNames(3)).toEqual(['okta.foo.read', 'okta.logs.read']);
    });
  });

  itp('has the correct number of scopes - one group and scopes', function() {
    return setupLessScopes().then(function({ form }) {
      expect(form.scopeGroupList().length).toBe(1);

      expect(form.scopeGroupName(0)).toBe('User and groups');
      expect(form.scopeNames(0)).toEqual(['okta.groups.read', 'okta.users.manage']);
    });
  });

  itp('toggle scope list', function() {
    return setup().then(function({ form }) {
      expect(form.scopeGroupList().length).toBe(4);

      form.scopeGroupList().each(function() {
        expect(this.getAttribute('class')).toBe('scope-group');
      });

      form.scopeGroupListRow(0).click();
      expect(form.scopeGroupListRow(0).attr('class')).toBe('scope-group scope-group--is-expanded');
      expect(form.scopeGroupListRow(1).attr('class')).toBe('scope-group');
      expect(form.scopeGroupListRow(2).attr('class')).toBe('scope-group');
      expect(form.scopeGroupListRow(3).attr('class')).toBe('scope-group');

      form.scopeGroupListRow(0).click();
      form.scopeGroupList().each(function() {
        expect(this.getAttribute('class')).toBe('scope-group');
      });

      form.scopeGroupListRow(2).click();
      expect(form.scopeGroupListRow(0).attr('class')).toBe('scope-group');
      expect(form.scopeGroupListRow(1).attr('class')).toBe('scope-group');
      expect(form.scopeGroupListRow(2).attr('class')).toBe('scope-group scope-group--is-expanded');
      expect(form.scopeGroupListRow(3).attr('class')).toBe('scope-group');
    });
  });

  itp('has the default logo if client logo is not provided', function() {
    return setup().then(function(test) {
      expect(test.form.clientLogoLink().length).toEqual(0);
      expect(test.form.clientLogo().attr('src')).toBe(`${window.location.origin}/img/logos/default.png`);
    });
  });

  itp('has the client uri', function() {
    return setupClientUri().then(function(test) {
      expect(test.form.clientLogoLink().attr('href')).toBe(`${window.location.origin}/client-uri.html`);
      expect(test.form.clientLogo().attr('src')).toBe(`${window.location.origin}/img/logos/default.png`);
    });
  });
  itp('has the correct client logo', function() {
    return setupClientLogo().then(function(test) {
      expect(test.form.clientLogo().attr('src')).toBe('/base/test/unit/assets/logo.svg');
    });
  });
  itp('has the correct app name in the title', function() {
    return setup().then(function(test) {
      expect(test.form.consentTitleText()).toBe('OAuth Service - Foo App 1 would like to access:');
    });
  });

  itp('has the consent button', function() {
    return setup().then(function(test) {
      expect(test.form.consentButton().length).toEqual(1);
      expect(test.form.consentButton().attr('value')).toBe('Allow Access');
      expect(test.form.consentButton().attr('class')).toBe('button button-primary');
    });
  });
  itp('consent button click makes the correct consent post', function() {
    return setup()
      .then(function(test) {
        Util.resetAjaxRequests();
        test.setNextResponse(resSuccess);
        test.form.consentButton().click();
        return Expect.waitForAjaxRequest();
      })
      .then(function() {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.lastAjaxRequest(), {
          url: 'http://localhost:3000/api/v1/authn/consent',
          data: {
            consent: {
              scopes: [
                'okta.users.manage',
                'okta.groups.read',
                'okta.inlineHooks.read',
                'okta.eventHooks.read',
                'okta.idps.read',
                'okta.logs.read',
                'okta.clients.read',
                'okta.foo.read',
              ],
            },
            stateToken: '00eL1hS274lCJnfPCifGwB-jNgwNeKlviamZhdloF1',
          },
        });
      });
  });

  itp('has the cancel button', function() {
    return setup().then(function(test) {
      expect(test.form.cancelButton().length).toEqual(1);
      expect(test.form.cancelButton().attr('value')).toBe('Don\'t Allow');
      expect(test.form.cancelButton().attr('class')).toBe('button button-clear');
    });
  });

  itp('cancel button click cancels the current stateToken and calls the cancel function', function() {
    const cancel = jasmine.createSpy('cancel');
    return setup({ consent: { cancel } })
      .then(function(test) {
        spyOn(test.router.controller.options.appState, 'clearLastAuthResponse').and.callThrough();
        Util.resetAjaxRequests();
        test.setNextResponse(resCancel);
        test.form.cancelButton().click();
        return Expect.waitForAjaxRequest(test);
      })
      .then(function(test) {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.lastAjaxRequest(), {
          url: 'http://localhost:3000/api/v1/authn/cancel',
          data: {
            stateToken: '00eL1hS274lCJnfPCifGwB-jNgwNeKlviamZhdloF1',
          },
        });
        return Expect.wait(function() {
          return test.router.controller.options.appState.clearLastAuthResponse.calls.count() > 0;
        }, test);
      })
      .then(function(test) {
        expect(test.router.controller.options.appState.clearLastAuthResponse).toHaveBeenCalled();
        expect(cancel).toHaveBeenCalled();
      });
  });
});
