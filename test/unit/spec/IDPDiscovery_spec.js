/* eslint max-params:[2, 28], max-statements:[2, 41], camelcase:0, max-len:[2, 180] */
define([
  'okta/underscore',
  'okta/jquery',
  'vendor/lib/q',
  '@okta/okta-auth-js/jquery',
  'util/Util',
  'okta',
  'helpers/mocks/Util',
  'helpers/dom/AuthContainer',
  'helpers/dom/IDPDiscoveryForm',
  'helpers/dom/Beacon',
  'models/IDPDiscovery',
  'LoginRouter',
  'util/BrowserFeatures',
  'util/DeviceFingerprint',
  'util/Errors',
  'shared/util/Util',
  'helpers/util/Expect',
  'helpers/xhr/security_image',
  'helpers/xhr/security_image_fail',
  'helpers/xhr/IDPDiscoverySuccess_IWA',
  'helpers/xhr/IDPDiscoverySuccess_SAML',
  'helpers/xhr/IDPDiscoverySuccess_OktaIDP',
  'helpers/xhr/ERROR_webfinger',
  'helpers/xhr/PASSWORDLESS_UNAUTHENTICATED',
  'sandbox'
],
function (_, $, Q, OktaAuth, LoginUtil, Okta, Util, AuthContainer, IDPDiscoveryForm, Beacon, IDPDiscovery,
          Router, BrowserFeatures, DeviceFingerprint, Errors, SharedUtil, Expect, resSecurityImage,
          resSecurityImageFail, resSuccessIWA, resSuccessSAML, resSuccessOktaIDP, resError, resPasswordlessUnauthenticated, $sandbox) {

  var itp = Expect.itp;
  var tick = Expect.tick;

  var BEACON_LOADING_CLS = 'beacon-loading';

  function setup(settings, requests) {
    settings || (settings = {});
    settings['features.idpDiscovery'] = true;

    // To speed up the test suite, calls to debounce are
    // modified to wait 0 ms.
    var debounce = _.debounce;
    spyOn(_, 'debounce').and.callFake(function (fn) {
      return debounce(fn, 0);
    });

    var setNextResponse = Util.mockAjax(requests);
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR, headers: {}});
    var successSpy = jasmine.createSpy('success');

    var setNextWebfingerResponse = function(res, reject) {
      spyOn(authClient, 'webfinger').and.callFake(function () {
        var deferred = Q.defer();
        if(reject) {
          deferred.reject(res);
        }
        else {
          deferred.resolve(res);
        }
        return tick(deferred.promise);
      });
    };

    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      globalSuccessFn: successSpy
    }, settings));
    Util.registerRouter(router);
    var authContainer = new AuthContainer($sandbox);
    var form = new IDPDiscoveryForm($sandbox);
    var beacon = new Beacon($sandbox);
    router.idpDiscovery();
    Util.mockJqueryCss();
    return Expect.waitForIDPDiscovery({
      router: router,
      authContainer: authContainer,
      form: form,
      beacon: beacon,
      ac: authClient,
      setNextResponse: setNextResponse,
      setNextWebfingerResponse: setNextWebfingerResponse,
      successSpy: successSpy
    });
  }

  function setupPasswordlessAuth(requests) {
    return setup({ 'features.passwordlessAuth': true }, requests)
    .then(function(test){
      Util.mockRouterNavigate(test.router);
      test.setNextWebfingerResponse(resSuccessOktaIDP);
      test.setNextResponse(resPasswordlessUnauthenticated);
      return tick(test);
    });
  }

  function setupRegistrationButton(featuresRegistration, registrationObj) {
    var settings = {
      registration: registrationObj
    };
    if (_.isBoolean(featuresRegistration)) {
      settings['features.registration'] = featuresRegistration;
    }
    return setup(settings);
  }

  function waitForBeaconChange(test) {
    return tick() //wait to read value of user input
    .then(tick)   //wait to receive ajax response
    .then(tick)   //wait for animation (TODO: verify if needed)
    .then(function () { return test; });
  }

  function waitForWebfingerCall(test) {
    return tick() // wait for the webfinger call cycle finish (promise -> then -> final)
    .then(function () {
      return Expect.waitForSpyCall(test.ac.webfinger, test);
    });
  }

  function transformUsername(name) {
    var nameArr = name.split('@');
    return nameArr[0] + '@example.com';
  }

  function transformUsernameOnUnlock(name, operation) {
    if (operation === 'UNLOCK_ACCOUNT') {
      transformUsername(name);
    }
    return name;
  }

  var setupWithTransformUsername = _.partial(setup, {username: 'foobar', transformUsername: transformUsername});
  var setupWithTransformUsernameOnUnlock = _.partial(setup, {transformUsername: transformUsernameOnUnlock});

  Expect.describe('IDPDiscovery', function () {

    Expect.describe('IDPDiscoveryModel', function () {
      it('returns validation error when email is blank', function () {
        var model = new IDPDiscovery({username: ''});
        expect(model.validate().username).toEqual('The field cannot be left blank');
      });
    });

    Expect.describe('settings', function () {
      itp('uses default title', function () {
        return setup().then(function (test) {
          expect(test.form.titleText()).toEqual('Sign In');
        });
      });
      itp('uses default for username placeholder', function () {
        return setup().then(function (test) {
          var $username = test.form.usernameField();
          expect($username.attr('placeholder')).toEqual('Username');
        });
      });
      itp('prevents autocomplete on username', function () {
        return setup().then(function (test) {
          expect(test.form.getUsernameFieldAutocomplete()).toBe('off');
        });
      });
      itp('overrides rememberMe from settings and uses default text', function () {
        return setup({ 'features.rememberMe': true }).then(function (test) {
          var label = test.form.rememberMeLabelText();
          expect(label).toEqual('Remember me');
        });
      });
      itp('uses default for unlock account', function () {
        return setup({'features.selfServiceUnlock': true}).then(function (test) {
          var label = test.form.unlockLabel();
          expect(label.trim()).toBe('Unlock account?');
        });
      });
      itp('focuses on username field in browsers other than IE', function () {
        spyOn(BrowserFeatures, 'isIE').and.returnValue(false);
        return setup().then(function (test) {
          var $username = test.form.usernameField();
          // Focused element would be username DOM element
          expect($username[0]).toBe(document.activeElement);
        });
      });
      itp('does not focus on username field in IE', function () {
        spyOn(BrowserFeatures, 'isIE').and.returnValue(true);
        return setup().then(function (test) {
          var $username = test.form.usernameField();
          // Focused element would be body element
          expect($username[0]).not.toBe(document.activeElement);
        });
      });
    });

    Expect.describe('elements', function () {
      itp('has a security beacon if features.securityImage is true', function () {
        return setup({ features: { securityImage: true }}, [resSecurityImage]).then(function (test) {
          expect(test.beacon.isSecurityBeacon()).toBe(true);
        });
      });
      itp('beacon could be minimized if it is a security beacon', function () {
        return setup({ features: { securityImage: true }}, [resSecurityImage]).then(function (test) {
          expect(test.authContainer.canBeMinimized()).toBe(true);
        });
      });
      itp('does not show a beacon if features.securityImage is false', function () {
        return setup().then(function (test) {
          expect(test.beacon.beacon().length).toBe(0);
        });
      });
      itp('has a username field', function () {
        return setup().then(function (test) {
          var username = test.form.usernameField();
          expect(username.length).toBe(1);
          expect(username.attr('type')).toEqual('text');
          expect(username.attr('id')).toEqual('idp-discovery-username');
        });
      });
      itp('has a next button', function () {
        return setup().then(function (test) {
          var nextButton = test.form.nextButton();
          expect(nextButton.length).toBe(1);
          expect(nextButton.attr('value')).toBe('Next');
          expect(nextButton.attr('type')).toEqual('submit');
          expect(nextButton.attr('id')).toEqual('idp-discovery-submit');
        });
      });
      itp('has a rememberMe checkbox if features.rememberMe is true', function () {
        return setup().then(function (test) {
          var cb = test.form.rememberMeCheckbox();
          expect(cb.length).toBe(1);
        });
      });
      itp('does not have a rememberMe checkbox if features.rememberMe is false', function () {
        return setup({ 'features.rememberMe': false }).then(function (test) {
          var cb = test.form.rememberMeCheckbox();
          expect(cb.length).toBe(0);
        });
      });
      itp('has "Need help?" link', function () {
        return setup().then(function (test) {
          expect(test.form.helpFooterLabel().trim()).toBe('Need help signing in?');
        });
      });
      itp('has a help link', function () {
        return setup().then(function (test) {
          expect(test.form.helpLinkLabel().trim()).toBe('Help');
        });
      });
      itp('has the correct help link url', function () {
        return setup().then(function (test) {
          spyOn(SharedUtil, 'redirect');
          expect(test.form.helpLinkHref()).toBe('https://foo.com/help/login');
        });
      });
      itp('has a custom help link url when available', function () {
        return setup({ 'helpLinks.help': 'https://bar.com' }).then(function (test) {
          spyOn(SharedUtil, 'redirect');
          expect(test.form.helpLinkHref()).toBe('https://bar.com');
        });
      });
      itp('has a forgot password link', function () {
        return setup().then(function (test) {
          expect(test.form.forgotPasswordLabel().trim()).toBe('Forgot password?');
        });
      });
      itp('forgot password link is not visible on load', function () {
        return setup().then(function (test) {
          expect(test.form.forgotPasswordLinkVisible()).toBe(false);
        });
      });
      itp('shows forgot password link when clicking help', function () {
        return setup().then(function (test) {
          test.form.helpFooter().click();
          expect(test.form.forgotPasswordLinkVisible()).toBe(true);
        });
      });
      itp('does not show forgot password link when disabled and clicked', function () {
        return setup().then(function (test) {
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        }).then(function(test) {
          test.form.helpFooter().click();
          expect(test.form.forgotPasswordLinkVisible()).not.toBe(true);
        });
      });
      itp('navigates to forgot password page when click forgot password link', function () {
        return setup().then(function (test) {
          spyOn(test.router, 'navigate');
          test.form.helpFooter().click();
          test.form.forgotPasswordLink().click();
          expect(test.router.navigate).toHaveBeenCalledWith('signin/forgot-password', {trigger: true});
        });
      });
      itp('does not navigate to forgot password page when link disabled and clicked', function () {
        return setup().then(function (test) {
          spyOn(test.router, 'navigate');
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        }).then(function(test) {
          test.form.helpFooter().click();
          test.form.forgotPasswordLink().click();
          expect(test.router.navigate).not.toHaveBeenCalledWith('signin/forgot-password', {trigger: true});
        });
      });
      itp('navigates to custom forgot password page when available', function () {
        return setup({ 'helpLinks.forgotPassword': 'https://foo.com' }).then(function (test) {
          spyOn(SharedUtil, 'redirect');
          test.form.helpFooter().click();
          test.form.forgotPasswordLink().click();
          expect(SharedUtil.redirect).toHaveBeenCalledWith('https://foo.com');
        });
      });
      itp('does not navigate to custom forgot password page when link disabled and clicked', function () {
        return setup({ 'helpLinks.forgotPassword': 'https://foo.com' }).then(function (test) {
          spyOn(SharedUtil, 'redirect');
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        }).then(function(test) {
          test.form.helpFooter().click();
          test.form.forgotPasswordLink().click();
          expect(SharedUtil.redirect).not.toHaveBeenCalledWith('https://foo.com');
        });
      });
      itp('unlock link is hidden on load', function () {
        return setup({'features.selfServiceUnlock': true}).then(function (test) {
          expect(test.form.unlockLinkVisible()).toBe(false);
        });
      });
      itp('shows unlock link when clicking help', function () {
        return setup({'features.selfServiceUnlock': true}).then(function (test) {
          test.form.helpFooter().click();
          expect(test.form.unlockLinkVisible()).toBe(true);
        });
      });
      itp('navigates to unlock page when click unlock link', function () {
        return setup({'features.selfServiceUnlock': true}).then(function (test) {
          spyOn(test.router, 'navigate');
          test.form.helpFooter().click();
          test.form.unlockLink().click();
          expect(test.router.navigate).toHaveBeenCalledWith('signin/unlock', {trigger: true});
        });
      });
      itp('does not navigate to unlock page when link disabled and clicked', function () {
        return setup().then(function (test) {
          spyOn(test.router, 'navigate');
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        }).then(function(test) {
          test.form.helpFooter().click();
          test.form.unlockLink().click();
          expect(test.router.navigate).not.toHaveBeenCalledWith('signin/unlock', {trigger: true});
        });
      });
      itp('navigates to custom unlock page when available', function () {
        return setup({
          'helpLinks.unlock': 'https://foo.com',
          'features.selfServiceUnlock': true
        }).then(function (test) {
          spyOn(SharedUtil, 'redirect');
          test.form.helpFooter().click();
          test.form.unlockLink().click();
          expect(SharedUtil.redirect).toHaveBeenCalledWith('https://foo.com');
        });
      });
      itp('does not navigate to custom unlock page when link disabled and clicked', function () {
        return setup({
          'helpLinks.unlock': 'https://foo.com',
          'features.selfServiceUnlock': true
        }).then(function (test) {
          spyOn(SharedUtil, 'redirect');
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        }).then(function(test) {
          test.form.helpFooter().click();
          test.form.unlockLink().click();
          expect(SharedUtil.redirect).not.toHaveBeenCalledWith('https://foo.com');
        });
      });
      itp('does not show unlock link if feature is off', function () {
        return setup().then(function (test) {
          expect(test.form.unlockLink().length).toBe(0);
        });
      });
      itp('does not show custom links if they do not exist', function () {
        return setup().then(function (test) {
          expect(test.form.customLinks().length).toBe(0);
        });
      });
      itp('shows custom links if they exist', function () {
        var customLinks = [
          { text: 'github', href: 'https://github.com' },
          { text: 'google', href: 'https://google.com' }
        ];
        return setup({ 'helpLinks.custom': customLinks }).then(function (test) {
          var links = test.form.customLinks();
          expect(links).toEqual(customLinks);
        });
      });
      itp('shows custom links with target attribute', function () {
        var customLinks = [
          { text: 'github', href: 'https://github.com', target: '_blank' },
          { text: 'google', href: 'https://google.com' },
          { text: 'okta', href: 'https://okta.com', target: '_custom' }
        ];
        return setup({ 'helpLinks.custom': customLinks }).then(function (test) {
          var links = test.form.customLinks();
          expect(links).toEqual(customLinks);
        });
      });
      itp('toggles "focused-input" css class on focus in and focus out', function () {
        return setup()
        .then(function (test) {
          test.form.usernameField().focus();
          return tick(test);
        })
        .then(function (test) {
          expect(test.form.usernameField()[0].parentElement).toHaveClass('focused-input');
          test.form.rememberMeCheckbox().focus();
          return tick(test);
        })
        .then(function (test) {
          expect(test.form.usernameField()[0].parentElement).not.toHaveClass('focused-input');
        });
      });
    });

    Expect.describe('transform username', function () {
      itp('calls the transformUsername function with the right parameters', function () {
        return setupWithTransformUsername().then(function (test) {
          spyOn(test.router.settings, 'transformUsername');
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        }).then(function(test) {
          expect(test.router.settings.transformUsername.calls.count()).toBe(1);
          expect(test.router.settings.transformUsername.calls.argsFor(0)).toEqual(['testuser@clouditude.net', 'IDP_DISCOVERY']);
        });
      });
      itp('does not call transformUsername while loading security image', function () {
        return setup({ features: { securityImage: true }, transformUsername: transformUsername })
        .then(function (test) {
          spyOn(test.router.settings, 'transformUsername');
          test.setNextResponse(resSecurityImage);
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function (test) {
          expect(test.router.settings.transformUsername.calls.count()).toBe(0);
          expect($.ajax.calls.count()).toBe(1);
          expect($.ajax.calls.argsFor(0)[0]).toEqual({
            url: 'https://foo.com/login/getimage?username=testuser@clouditude.net',
            dataType: 'json'
          });
        });
      });
      itp('changs the suffix of the username', function () {
        return setupWithTransformUsername().then(function (test) {
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        }).then(function (test) {
          expect(test.ac.webfinger).toHaveBeenCalledWith({
            resource: 'okta:acct:testuser@example.com',
            requestContext: undefined
          });
        });
      });
      itp('does not change the suffix of the username if "IDP_DISCOVERY" operation is not handled', function () {
        return setupWithTransformUsernameOnUnlock().then(function (test) {
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        })
        .then(function (test) {
          expect(test.ac.webfinger).toHaveBeenCalledWith({
            resource: 'okta:acct:testuser@clouditude.net',
            requestContext: undefined
          });
        });
      });
    });

    Expect.describe('Device Fingerprint', function () {
      itp('contains fingerprint header in get security image request if feature is enabled', function () {
        spyOn(DeviceFingerprint, 'generateDeviceFingerprint').and.callFake(function () {
          var deferred = Q.defer();
          deferred.resolve('thisIsTheDeviceFingerprint');
          return deferred.promise;
        });
        return setup({ features: { securityImage: true, deviceFingerprinting: true }})
        .then(function (test) {
          test.setNextResponse(resSecurityImage);
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          expect(DeviceFingerprint.generateDeviceFingerprint).toHaveBeenCalled();
          var ajaxArgs = $.ajax.calls.argsFor(0);
          expect(ajaxArgs[0].headers['X-Device-Fingerprint']).toBe('thisIsTheDeviceFingerprint');
        });
      });
      itp('does not contain fingerprint header in get security image request if feature is disabled', function () {
        spyOn(DeviceFingerprint, 'generateDeviceFingerprint');
        return setup({ features: { securityImage: true }})
        .then(function (test) {
          test.setNextResponse(resSecurityImage);
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          expect(DeviceFingerprint.generateDeviceFingerprint).not.toHaveBeenCalled();
          var ajaxArgs = $.ajax.calls.argsFor(0);
          expect(ajaxArgs[0].headers).toBeUndefined();
        });
      });
    });

    Expect.describe('events', function () {

      Expect.describe('beacon loading', function () {
        itp('shows beacon-loading animation when authClient webfinger is called', function () {
          return setup({ features: { securityImage: true }})
          .then(function (test) {
            test.securityBeacon = test.router.header.currentBeacon.$el;
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser@clouditude.net');
            return waitForBeaconChange(test);
          })
          .then(function (test) {
            spyOn(test.securityBeacon, 'toggleClass');
            test.setNextWebfingerResponse(resSuccessSAML);
            test.form.submit();
            return waitForWebfingerCall(test);
          })
          .then(function (test) {
            var spyCalls = test.securityBeacon.toggleClass.calls;
            expect(spyCalls.count()).toBe(2);
            expect(spyCalls.argsFor(0)).toEqual([BEACON_LOADING_CLS, true]);
            expect(spyCalls.mostRecent().args).toEqual([BEACON_LOADING_CLS, false]);
          });
        });
        itp('does not show beacon-loading animation when authClient webfinger fails', function () {
          return setup({ features: { securityImage: true }})
          .then(function (test) {
            test.securityBeacon = test.router.header.currentBeacon.$el;
            test.setNextResponse(resSecurityImage);
            test.form.setUsername('testuser@clouditude.net');
            return waitForBeaconChange(test);
          })
          .then(function (test) {
            Q.stopUnhandledRejectionTracking();
            spyOn(test.securityBeacon, 'toggleClass');
            test.setNextWebfingerResponse(resError, true);
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            var spyCalls = test.securityBeacon.toggleClass.calls;
            expect(spyCalls.argsFor(0)).toEqual([BEACON_LOADING_CLS, true]);
            expect(spyCalls.mostRecent().args).toEqual([BEACON_LOADING_CLS, false]);
          });
        });
        itp('shows beacon-loading animation when webfinger is submitted (no security image)', function () {
          return setup().then(function (test) {
            test.setNextWebfingerResponse(resSuccessSAML);
            test.form.setUsername('testuser@clouditude.net');
            test.form.submit();
            return waitForWebfingerCall(test);
          })
          .then(function(test) {
            expect(test.beacon.isLoadingBeacon()).toBe(true);
          });
        });
        itp('does not show beacon-loading animation when webfinger fails (no security image)', function () {
          return setup().then(function (test) {
            Q.stopUnhandledRejectionTracking();
            test.setNextWebfingerResponse(resError, true);
            test.form.setUsername('testuser@clouditude.net');
            test.form.submit();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect(test.beacon.isLoadingBeacon()).toBe(false);
            expect(test.beacon.beacon().length).toBe(0);
          });
        });
      });
      itp('does not make securityImage requests if features.securityImage is false', function () {
        return setup()
        .then(function (test) {
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(0);
        });
      });
      itp('has default security image on page load and no rememberMe', function () {
        return setup({ features: { securityImage: true }})
        .then(waitForBeaconChange)
        .then(function (test) {
          expect(test.form.securityBeacon()[0].className).toMatch('undefined-user');
          expect(test.form.securityBeacon()[0].className).not.toMatch('new-device');
          expect(test.form.securityBeacon().css('background-image')).toBe('none');
        });
      });
      itp('updates security beacon when user enters correct username', function () {
        return setup({ features: { securityImage: true }})
        .then(function (test) {
          test.setNextResponse(resSecurityImage);
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function (test) {
          expect($.ajax.calls.count()).toBe(1);
          expect($.ajax.calls.argsFor(0)[0]).toEqual({
            url: 'https://foo.com/login/getimage?username=testuser@clouditude.net',
            dataType: 'json'
          });
          expect($.fn.css).toHaveBeenCalledWith('background-image', 'url(../../../test/unit/assets/1x1.gif)');
          expect(test.form.accessibilityText()).toBe('a single pixel');
        });
      });
      itp('waits for username field to lose focus before fetching the security image', function () {
        return setup({ features: { securityImage: true }})
        .then(function (test) {
          test.setNextResponse(resSecurityImage);
          test.form.editingUsername('te');
          test.form.editingUsername('testu');
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
        });
      });
      itp('updates security beacon to show the new user image when user enters unfamiliar username', function () {
        return setup({ features: { securityImage: true }})
        .then(function (test) {
          test.setNextResponse(resSecurityImageFail);
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function (test) {
          expect(test.form.securityBeacon()[0].className).toMatch('new-user');
          expect(test.form.securityBeacon()[0].className).not.toMatch('undefined-user');
          expect(test.form.securityBeacon().css('background-image')).toBe('none');
        });
      });
      itp('shows an unknown user message when user enters unfamiliar username', function () {
        return setup({ features: { securityImage: true }})
        .then(function (test) {
          test.setNextResponse(resSecurityImageFail);
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function (test) {
          expect(test.form.securityImageTooltipText()).toEqual('This is the first time you are connecting to foo.com from this browser×');
        });
      });
      itp('does not show anti-phishing message if security image is hidden', function () {
        return setup({ features: { securityImage: true }})
        .then(function (test) {
          test.setNextResponse(resSecurityImageFail);
          test.form.securityBeaconContainer().hide();
          spyOn($.qtip.prototype, 'toggle').and.callThrough();
          test.form.setUsername('testuser@clouditude.net');
          $(window).trigger('resize');
          return waitForBeaconChange(test);
        })
        .then(function (test) {
          expect($.qtip.prototype.toggle.calls.argsFor(0)).toEqual(jasmine.objectContaining({0: false}));
          test.form.securityBeaconContainer().show();
          $(window).trigger('resize');
          return tick(test);
        })
        .then(function () {
          expect($.qtip.prototype.toggle.calls.argsFor(1)).toEqual(jasmine.objectContaining({0: true}));
        });
      });
      itp('show anti-phishing message if security image become visible', function () {
        return setup({ features: { securityImage: true }})
        .then(function (test) {
          spyOn($.qtip.prototype, 'toggle').and.callThrough();
          test.setNextResponse(resSecurityImageFail);
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function (test) {
          expect($.qtip.prototype.toggle.calls.argsFor(0)).toEqual(jasmine.objectContaining({0: true}));
          test.form.securityBeaconContainer().hide();
          $(window).trigger('resize');
          return waitForBeaconChange(test);
        })
        .then(function (test) {
          expect($.qtip.prototype.toggle.calls.argsFor(1)).toEqual(jasmine.objectContaining({0: false}));
          test.form.securityBeaconContainer().show();
          $(window).trigger('resize');
          return waitForBeaconChange(test);
        })
        .then(function () {
          expect($.qtip.prototype.toggle.calls.argsFor(2)).toEqual(jasmine.objectContaining({0: true}));
        });
      });
      itp('guards against XSS when showing the anti-phishing message', function () {
        return setup({
          baseUrl: 'http://foo<i>xss</i>bar.com?bar=<i>xss</i>',
          features: { securityImage: true }
        })
        .then(function (test) {
          test.setNextResponse(resSecurityImageFail);
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function (test) {
          expect(test.form.securityImageTooltipText()).toEqual('This is the first time you are connecting to foo<i>xss< from this browser×');
        });
      });
      itp('removes anti-phishing message if help link is clicked', function () {
        return setup({
          baseUrl: 'http://foo<i>xss</i>bar.com?bar=<i>xss</i>',
          features: { securityImage: true, selfServiceUnlock: true }
        })
        .then(function (test) {
          test.setNextResponse(resSecurityImageFail);
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function (test) {
          // Tooltip exists
          expect(test.form.isSecurityImageTooltipDestroyed()).toBe(false);
          spyOn(test.router, 'navigate');
          test.form.helpFooter().click();
          test.form.unlockLink().click();
          expect(test.router.navigate).toHaveBeenCalledWith('signin/unlock', {trigger: true});
          // Verify tooltip is gone
          expect(test.form.isSecurityImageTooltipDestroyed()).toBe(true);
        });
      });
      itp('updates security beacon immediately if rememberMe is available', function () {
        Util.mockGetCookie('ln', 'testuser@clouditude.net');
        var options = {
          features: {
            rememberMe: true,
            securityImage: true
          }
        };
        return setup(options, [resSecurityImage])
        .then(waitForBeaconChange)
        .then(function (test) {
          expect($.fn.css).toHaveBeenCalledWith('background-image', 'url(../../../test/unit/assets/1x1.gif)');
          expect(test.form.accessibilityText()).toBe('a single pixel');
        });
      });
      itp('calls globalErrorFn if cors is not enabled and security image request is made', function () {
        spyOn(BrowserFeatures, 'corsIsNotEnabled').and.returnValue(true);
        return setup({
          features: { securityImage: true }
        })
        .then(function (test) {
          test.setNextResponse({
            responseType: 'json',
            response: '',
            status: 0
          });
          spyOn(test.router.settings, 'callGlobalError');
          test.form.setUsername('testuser@clouditude.net');
          return waitForBeaconChange(test);
        })
        .then(function (test) {
          var err = test.router.settings.callGlobalError.calls.mostRecent().args[0];
          expect(err instanceof Errors.UnsupportedBrowserError).toBe(true);
          expect(err.name).toBe('UNSUPPORTED_BROWSER_ERROR');
          expect(err.message).toEqual('There was an error sending the request - have you enabled CORS?');
        });
      });
      itp('has username in field if rememberMe is available', function () {
        Util.mockGetCookie('ln', 'testuser@clouditude.net');
        var options = {
          'features.rememberMe': true
        };
        return setup(options).then(function (test) {
          expect(test.form.usernameField().val()).toBe('testuser@clouditude.net');
        });
      });
      itp('has rememberMe checked if rememberMe is available', function () {
        Util.mockGetCookie('ln', 'testuser@clouditude.net');
        var options = {
          'features.rememberMe': true
        };
        return setup(options).then(function (test) {
          expect(test.form.rememberMeCheckboxStatus()).toBe('checked');
        });
      });
      itp('unchecks rememberMe if username is changed', function () {
        Util.mockGetCookie('ln', 'testuser@clouditude.net');
        var options = {
          'features.rememberMe': true
        };
        return setup(options).then(function (test) {
          expect(test.form.rememberMeCheckboxStatus()).toBe('checked');
          test.form.setUsername('new-user@clouditude.net');
          expect(test.form.rememberMeCheckboxStatus()).toBe('unchecked');
        });
      });
      itp('does not re-render rememberMe checkbox on changes', function () {
        Util.mockGetCookie('ln', 'testuser@clouditude.net');
        var options = {
          'features.rememberMe': true
        };
        return setup(options).then(function (test) {
          var orig = test.form.rememberMeCheckbox().get(0);
          test.form.setUsername('new-user@clouditude.net');
          expect(test.form.rememberMeCheckbox().get(0)).toBe(orig);
        });
      });
      itp('populates username if username is available', function () {
        var options = {
          'username': 'testuser@ABC.com'
        };
        return setup(options).then(function (test) {
          expect(test.form.usernameField().val()).toBe('testuser@ABC.com');
        });
      });
      itp('populates username if username is available and when features.rememberMe is false', function () {
        var options = {
          'features.rememberMe': false,
          'username': 'testuser@ABC.com'
        };
        return setup(options).then(function (test) {
          var cb = test.form.rememberMeCheckbox();
          expect(cb.length).toBe(0);
          expect(test.form.usernameField().val()).toBe('testuser@ABC.com');
        });
      });
      itp('ignores lastUsername and hides rememberMe if features.rememberMe is false and cookie is set', function () {
        Util.mockGetCookie('ln', 'testuser@ABC.com');
        var options = {
          'features.rememberMe': false
        };
        return setup(options).then(function (test) {
          var cb = test.form.rememberMeCheckbox();
          expect(cb.length).toBe(0);
          expect(test.form.usernameField().val().length).toBe(0);
        });
      });
      itp('unchecks rememberMe if username is populated and lastUsername is different from username', function () {
        Util.mockGetCookie('ln', 'testuser@clouditude.net');
        var options = {
          'features.rememberMe': true,
          'username': 'testuser@ABC.com'
        };
        return setup(options).then(function (test) {
          expect(test.form.rememberMeCheckboxStatus()).toBe('unchecked');
          expect(test.form.usernameField().val()).toBe('testuser@ABC.com');
        });
      });
      itp('checks rememberMe if username is populated and lastUsername is same as username', function () {
        Util.mockGetCookie('ln', 'testuser@ABC.com');
        var options = {
          'features.rememberMe': true,
          'username': 'testuser@ABC.com'
        };
        return setup(options).then(function (test) {
          expect(test.form.rememberMeCheckboxStatus()).toBe('checked');
          expect(test.form.usernameField().val()).toBe('testuser@ABC.com');
        });
      });
      itp('shows an error if username is empty and submitted', function () {
        return setup().then(function (test) {
          test.setNextWebfingerResponse({});
          test.form.submit();
          expect(test.form.usernameErrorField().length).toBe(1);
          var button = test.form.submitButton();
          var buttonClass = button.attr('class');
          expect(buttonClass).not.toContain('link-button-disabled');
          expect(test.form.isDisabled()).toBe(false);
          expect(test.ac.webfinger).not.toHaveBeenCalled();
        });
      });
      itp('calls authClient webfinger with correct values when submitted', function () {
        return setup({'idpDiscovery.requestContext': 'http://rain.okta1.com:1802/app/UserHome'})
        .then(function (test) {
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        })
        .then(function (test) {
          expect(test.form.isDisabled()).toBe(true);
          expect(test.ac.webfinger).toHaveBeenCalledWith({
            resource: 'okta:acct:testuser@clouditude.net',
            requestContext: 'http://rain.okta1.com:1802/app/UserHome'
          });
        });
      });
      itp('does not call processCreds function before saving a model', function () {
        var processCredsSpy = jasmine.createSpy('processCreds');
        return setup({
          processCreds: processCredsSpy
        })
        .then(function (test) {
          test.form.setUsername('testuser@clouditude.net');
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        })
        .then(function(test) {
          expect(processCredsSpy.calls.count()).toBe(0);
          expect(test.ac.webfinger).toHaveBeenCalled();
        });
      });
      itp('sets rememberMe cookie if rememberMe is enabled and checked on submit', function () {
        var cookieSpy = Util.mockSetCookie();
        return setup({ 'features.rememberMe': true })
        .then(function (test) {
          test.form.setUsername('testuser@clouditude.net');
          test.form.setRememberMe(true);
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        })
        .then(function () {
          expect(cookieSpy).toHaveBeenCalledWith('ln', 'testuser@clouditude.net', {
            expires: 365,
            path: '/'
          });
        });
      });
      itp('removes rememberMe cookie if called with existing username and unchecked', function () {
        Util.mockGetCookie('ln', 'testuser@clouditude.net');
        var removeCookieSpy = Util.mockRemoveCookie();
        return setup({ 'features.rememberMe': true }).then(function (test) {
          test.form.setUsername('testuser@clouditude.net');
          test.form.setRememberMe(false);
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.submit();
          return waitForWebfingerCall(test);
        })
        .then(function () {
          expect(removeCookieSpy).toHaveBeenCalledWith('ln', { path: '/' });
        });
      });
      itp('removes rememberMe cookie if webfinger failed (400)', function () {
        var removeCookieSpy = Util.mockRemoveCookie();
        return setup()
        .then(function (test) {
          test.form.setUsername('testuser@clouditude.net');
          test.form.setRememberMe(true);
          test.setNextWebfingerResponse(resError, true);
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function () {
          expect(removeCookieSpy).toHaveBeenCalledWith('ln', { path: '/' });
        });
      });
      itp('shows an error if authClient returns with an error', function () {
        return setup()
        .then(function (test) {
          test.setNextWebfingerResponse(resError, true);
          test.form.setUsername('testuser@clouditude.net');
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage())
            .toBe('We found some errors. Please review the form and make corrections.');
        });
      });
    });

    Expect.describe('IDP Discovery', function () {
      itp('renders primary auth when idp is okta', function () {
        return setup()
        .then(function (test) {
          Util.mockRouterNavigate(test.router);
          test.setNextWebfingerResponse(resSuccessOktaIDP);
          test.form.setUsername('testuser@clouditude.net');
          test.form.submit();
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function (test) {
          expect(test.router.appState.get('disableUsername')).toBe(true);
          expect(test.router.navigate).toHaveBeenCalledWith('signin', {trigger: true});
        });
      });
      itp('renders primary auth when idp is okta with shortname', function () {
        return setup()
        .then(function (test) {
          Util.mockRouterNavigate(test.router);
          test.setNextWebfingerResponse(resSuccessOktaIDP);
          test.form.setUsername('testuser');
          test.form.submit();
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function (test) {
          expect(test.router.appState.get('disableUsername')).toBe(true);
          expect(test.router.navigate).toHaveBeenCalledWith('signin', {trigger: true});
        });
      });
      itp('redirects to idp for SAML idps', function () {
        spyOn(IDPDiscovery.prototype, 'trigger').and.callThrough();
        spyOn(LoginUtil, 'postToUrl');

        return setup()
        .then(function (test) {
          test.setNextWebfingerResponse(resSuccessSAML);
          test.form.setUsername('testuser@clouditude.net');
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function (test) {
          var redirectToIdp = test.successSpy.calls.mostRecent().args[0].idpDiscovery.redirectToIdp;
          expect(redirectToIdp).toEqual(jasmine.any(Function));
          redirectToIdp('https://foo.com');
          expect(IDPDiscovery.prototype.trigger).toHaveBeenCalledWith(
            'goToOtherIdpAuth',
            'http://demo.okta1.com:1802/sso/saml2/0oa2hhcwIc78OGP1W0g4?fromURI=https%3A%2F%2Ffoo.com&login_hint=testuser%40clouditude.net'
          );
          expect(LoginUtil.postToUrl).toHaveBeenCalledWith(
            'http://demo.okta1.com:1802/sso/saml2/0oa2hhcwIc78OGP1W0g4?fromURI=https%3A%2F%2Ffoo.com&login_hint=testuser%40clouditude.net',
            test.router.controller.$el
          );
        });
      });
      itp('redirects to idp for idps other than okta/saml', function () {
        spyOn(IDPDiscovery.prototype, 'trigger').and.callThrough();
        spyOn(LoginUtil, 'postToUrl');
        return setup()
        .then(function (test) {
          test.setNextWebfingerResponse(resSuccessIWA);
          test.form.setUsername('testuser@clouditude.net');
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function (test) {
          var redirectToIdp = test.successSpy.calls.mostRecent().args[0].idpDiscovery.redirectToIdp;
          expect(redirectToIdp).toEqual(jasmine.any(Function));
          redirectToIdp('https://foo.com');
          expect(IDPDiscovery.prototype.trigger).toHaveBeenCalledWith(
            'goToOtherIdpAuth',
            'http://demo.okta1.com:1802/login/sso_iwa?fromURI=https%3A%2F%2Ffoo.com'
          );
          expect(LoginUtil.postToUrl).toHaveBeenCalledWith(
            'http://demo.okta1.com:1802/login/sso_iwa?fromURI=https%3A%2F%2Ffoo.com',
            test.router.controller.$el
          );
        });
      });
    });

    Expect.describe('Passwordless Auth', function() {
      itp('automatically calls authClient.signIn when idp is Okta', function () {
        return setupPasswordlessAuth().then(function (test) {
          $.ajax.calls.reset();
          test.form.setUsername('testuser@test.com');
          test.form.submit();
          return Expect.waitForMfaVerify(test);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn',
            data: {
              username: 'testuser@test.com',
              options: {
                warnBeforePasswordExpired: true,
                multiOptionalFactorEnroll: false
              }
            }
          });
        });
      });
      itp('shows MfaVerify view after authClient.signIn returns with UNAUTHENTICATED', function () {
        return setupPasswordlessAuth().then(function (test) {
          test.form.setUsername('testuser@test.com');
          test.form.submit();
          return Expect.waitForMfaVerify(test);
        })
        .then(function (test) {
          expect(test.form.el('factor-question').length).toEqual(1);
        });
      });
    });

    Expect.describe('Registration Flow', function () {
      itp('does not show the registration button if features.registration is not set', function () {
        return setup().then(function (test) {
          expect(test.form.registrationContainer().length).toBe(0);
        });
      });
      itp('does not show the registration button if features.registration is undefined', function () {
        var registration = {};
        return setupRegistrationButton(undefined, registration).then(function (test) {
          expect(test.form.registrationContainer().length).toBe(0);
        });
      });
      itp('does not show the registration button if features.registration is false', function () {
        var registration = {};
        return setupRegistrationButton(false, registration).then(function (test) {
          expect(test.form.registrationContainer().length).toBe(0);
        });
      });
      itp('show the registration button if registration.enable is true', function () {
        var registration = {};
        return setupRegistrationButton(true, registration).then(function (test) {
          expect(test.form.registrationContainer().length).toBe(1);
          expect(test.form.registrationLabel().length).toBe(1);
          expect(test.form.registrationLabel().text()).toBe('Don\'t have an account?');
          expect(test.form.registrationLink().length).toBe(1);
          expect(test.form.registrationLink().text()).toBe('Sign up');
          expect(typeof(registration.click)).toEqual('undefined');
        });
      });
      itp('calls settings.registration.click if its a function and when the link is clicked', function () {
        var registration =  {
          click: jasmine.createSpy('registrationSpy')
        };
        return setupRegistrationButton(true, registration).then(function (test) {
          expect(test.form.registrationContainer().length).toBe(1);
          expect(test.form.registrationLabel().length).toBe(1);
          expect(test.form.registrationLabel().text()).toBe('Don\'t have an account?');
          expect(test.form.registrationLink().length).toBe(1);
          expect(test.form.registrationLink().text()).toBe('Sign up');
          test.form.registrationLink().click();
          expect(registration.click).toHaveBeenCalled();
        });
      });
    });

  });
});
