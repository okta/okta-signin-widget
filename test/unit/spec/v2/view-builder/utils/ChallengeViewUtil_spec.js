import {doChallenge} from '../../../../../../src/v2/view-builder/utils/ChallengeViewUtil';
import { loc, View, createButton } from 'okta';
import hbs from 'handlebars-inline-precompile';
import Enums from '../../../../../../src/util/Enums';
import Util from '../../../../../../src/util/Util';

describe('v2/utils/ChallengeViewUtil', function() {
  class TestView {
    getDeviceChallengePayload() {}
    add() {}
    doLoopback() {}
    doCustomURI() {}
  }

  const testView = new TestView();

  it('LOOPBACK_CHALLENGE test case', function() {
    const deviceChallenge = {
      'challengeMethod': Enums.LOOPBACK_CHALLENGE,
      'domain': 'test_domain',
      'ports': [12345, 22222],
      'challengerequest': 'abcdfg12345',
      'probeTimeoutMillis': 100
    };
    spyOn(testView, 'getDeviceChallengePayload').and.callFake(() => deviceChallenge);
    let expectedAddArg = {};
    spyOn(testView, 'add').and.callFake((arg) => {expectedAddArg = arg;});
    spyOn(testView, 'doLoopback');
    spyOn(View, 'extend').and.callFake((extendArg) => {
      return extendArg;
    });

    doChallenge(testView);

    expect(testView.getDeviceChallengePayload).toHaveBeenCalled();
    expect(testView.title).toBe(loc('deviceTrust.sso.redirectText', 'login'));
    expect(expectedAddArg.className).toBe('loopback-content');
    expect(expectedAddArg.template.call()).toBe(hbs`<div class="spinner"></div>`.call());
    expect(testView.doLoopback).toHaveBeenCalledWith(deviceChallenge);
  });


  it('CUSTOM_URI_CHALLENGE test case', function() {
    const deviceChallenge = {
      'challengeMethod': Enums.CUSTOM_URI_CHALLENGE,
      'href': 'testHref',
      'downloadHref': 'testDownloadHref'
    };
    spyOn(testView, 'getDeviceChallengePayload').and.callFake(() => deviceChallenge);
    spyOn(testView, 'doCustomURI');
    let expectedAddArgs = [];
    spyOn(testView, 'add').and.callFake((addArg) => {expectedAddArgs.push(addArg);});
    spyOn(View, 'extend').and.callFake((extendArg) => {
      return extendArg;
    });

    doChallenge(testView);

    expect(testView.getDeviceChallengePayload).toHaveBeenCalled();
    expect(testView.title).toBe(loc('customUri.title', 'login'));
    expect(testView.add).toHaveBeenCalledTimes(3);

    expect(expectedAddArgs[0].className).toBe('skinny-content');
    expect(expectedAddArgs[0].template.call()).toBe(hbs`
            <p>
              {{i18n code="customUri.required.content.prompt" bundle="login"}}
            </p>
          `.call());

    let expectedCreateButton = createButton({
      className: 'ul-button button button-wide button-primary',
      title: loc('customUri.required.content.button', 'login'),
      id: 'launch-ov',
      click: () => {
        testView.doCustomURI();
      }
    });
    expect(expectedAddArgs[1].className).toBe(expectedCreateButton.className);
    expect(expectedAddArgs[1].title).toBe(expectedCreateButton.title);
    expect(expectedAddArgs[1].id).toBe(expectedCreateButton.id);
    expectedAddArgs[1].prototype.click();
    expect(testView.doCustomURI).toHaveBeenCalledTimes(2);
    expect(expectedAddArgs[2].className).toBe('skinny-content');
    expect(expectedAddArgs[2].template.call()).toBe(hbs`
          <p>
            {{i18n code="customUri.required.content.download.title" bundle="login"}}
          </p>
          <p>
            <a href="{{downloadOVLink}}" target="_blank" id="download-ov" class="link">
              {{i18n code="customUri.required.content.download.linkText" bundle="login"}}
            </a>
          </p>
          `.call());
    expect(expectedAddArgs[2].getTemplateData().downloadOVLink).toBe(deviceChallenge.downloadHref);

    expect(testView.customURI).toBe(deviceChallenge.href);
  });

  it('UNIVERSAL_LINK_CHALLENGE test case', function() {
    const deviceChallenge = {
      'challengeMethod': Enums.UNIVERSAL_LINK_CHALLENGE,
      'href': 'testHref'
    };
    spyOn(testView, 'getDeviceChallengePayload').and.callFake(() => deviceChallenge);
    let expectedAddArgs = [];
    spyOn(testView, 'add').and.callFake((addArg) => {expectedAddArgs.push(addArg);});
    spyOn(View, 'extend').and.callFake((extendArg) => {
      return extendArg;
    });
    spyOn(Util, 'redirect');

    doChallenge(testView);

    expect(testView.getDeviceChallengePayload).toHaveBeenCalled();
    expect(testView.title).toBe(loc('universalLink.title', 'login'));

    expect(testView.add).toHaveBeenCalledTimes(2);
    expect(expectedAddArgs[0].className).toBe('universal-link-content');
    expect(expectedAddArgs[0].template.call()).toBe(hbs`
            <div class="spinner"></div>
            {{{i18n code="universalLink.content" bundle="login"}}}
          `.call());
    let expectedCreateButton = createButton({
      className: 'ul-button button button-wide button-primary',
      title: loc('oktaVerify.reopen.button', 'login'),
      click: () => {
        // only window.location.href can open universal link in iOS/MacOS
        // other methods won't do, ex, AJAX get or form get (Util.redirectWithFormGet)
        Util.redirect(deviceChallenge.href);
      }
    });

    expect(expectedAddArgs[1].className).toBe(expectedCreateButton.className);
    expect(expectedAddArgs[1].title).toBe(expectedCreateButton.title);
    expectedAddArgs[1].prototype.click();
    expect(Util.redirect).toHaveBeenCalledWith(deviceChallenge.href);
  });

  it('APP_LINK_CHALLENGE test case', function() {
    const deviceChallenge = {
      'challengeMethod': Enums.APP_LINK_CHALLENGE,
      'href': 'testHref'
    };
    spyOn(testView, 'getDeviceChallengePayload').and.callFake(() => deviceChallenge);
    let expectedAddArgs = [];
    spyOn(testView, 'add').and.callFake((addArg) => {expectedAddArgs.push(addArg);});
    spyOn(View, 'extend').and.callFake((extendArg) => {
      return extendArg;
    });

    doChallenge(testView);

    expect(testView.getDeviceChallengePayload).toHaveBeenCalled();
    expect(testView.title).toBe(loc('appLink.title', 'login'));

    expect(testView.add).toHaveBeenCalledTimes(2);
    expect(expectedAddArgs[0].className).toBe('app-link-content');
    expect(expectedAddArgs[0].template.call()).toBe(hbs`
      <div class="spinner"></div>
      <div class="appLinkContent ">If Okta Verify did not open automatically, tap the button below to reopen Okta Verify.</div>
    `.call());
    let expectedCreateButton = createButton({
      className: 'hide al-button button button-wide button-primary',
      title: loc('oktaVerify.reopen.button', 'login'),
      click: () => {
        // only window.location.href can open universal link in iOS/MacOS
        // other methods won't do, ex, AJAX get or form get (Util.redirectWithFormGet)
        window.location.href = deviceChallenge.href;
      }
    });

    Object.defineProperty(window, 'location', {
      value: {
        href: 'href',
      }
    });

    expect(expectedAddArgs[1].className).toBe(expectedCreateButton.className);
    expect(expectedAddArgs[1].title).toBe(expectedCreateButton.title);
    expectedAddArgs[1].prototype.click();
    expect(window.location.href).toEqual(deviceChallenge.href);
  });

});
