import BaseFooter from 'v2/view-builder/internals/BaseFooter';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import Link from 'v2/view-builder/components/Link';
import { FORMS_WITHOUT_SIGNOUT, FORMS_FOR_VERIFICATION } from 'v2/ion/RemediationConstants';

describe('v2/view-builder/internals/BaseFooter', function () {

  let testContext;

  const renderFooter = (links, currentFormName) => {
    const FooFooter = BaseFooter.extend({
      links,
    });
    spyOn(AppState.prototype, 'get').and.callFake(name => {
      if(name === 'idx') {
        return { actions: { cancel: () => {} }};
      }
      if (name === 'currentFormName') {
        return currentFormName;
      }
    });

    spyOn(FooFooter.prototype, 'add');
    const fooFooter = new FooFooter({
      appState: testContext.appState,
      settings: testContext.settings,
    });
    fooFooter.render();
    return fooFooter;
  };

  beforeEach(() => {
    testContext = {
      appState: new AppState(),
      settings: new Settings({
        baseUrl: 'http://localhost:3000',
      }),
    };
  });

  it('adds nothing when links function return undefined', function () {
    const fooFooter = renderFooter(() => {}, FORMS_WITHOUT_SIGNOUT[0]);

    expect(fooFooter.add).not.toHaveBeenCalled();
  });
  it('adds nothing when links function return empty array', function () {
    const fooFooter = renderFooter(() => {return [];}, FORMS_WITHOUT_SIGNOUT[0]);

    expect(fooFooter.add).not.toHaveBeenCalled();
  });
  it('adds nothing when empty links array', function () {
    const fooFooter = renderFooter([], FORMS_WITHOUT_SIGNOUT[0]);

    expect(fooFooter.add).not.toHaveBeenCalled();
  });

  it('adds links from `links` array', () => {
    const fooFooter = renderFooter(() => [
      {
        actionPath: 'bar',
        label: 'Bar',
        name: 'bar',
        type: 'link',
      },
      undefined,
    ], FORMS_WITHOUT_SIGNOUT[0]);

    expect(fooFooter.add.calls.count()).toEqual(1);
    expect(fooFooter.add.calls.argsFor(0)).toEqual([
      Link,
      {
        options: {
          actionPath: 'bar',
          label: 'Bar',
          name: 'bar',
          type: 'link',
        }
      }
    ]);
  });

  it('adds signout link when `showSignoutLinkInCurrentForm` returns true', () => {
    const fooFooter = renderFooter([], FORMS_FOR_VERIFICATION[0]);

    expect(fooFooter.add.calls.count()).toEqual(1);
    expect(fooFooter.add.calls.argsFor(0)).toEqual([
      Link,
      {
        options: {
          'actionPath': 'cancel',
          'label': 'Sign Out',
          'name': 'cancel',
          'type': 'link'
        }
      }
    ]);
  });

  it('adds other links and signout link when `showSignoutLinkInCurrentForm` returns true', () => {
    const fooFooter = renderFooter([
      {
        actionPath: 'foo',
        label: 'Foo',
        name: 'foo',
        type: 'link',
      }
    ], FORMS_FOR_VERIFICATION[0]);

    expect(fooFooter.add.calls.count()).toEqual(2);
    expect(fooFooter.add.calls.argsFor(0)).toEqual([
      Link,
      {
        options: {
          actionPath: 'foo',
          label: 'Foo',
          name: 'foo',
          type: 'link',
        }
      }
    ]);
    expect(fooFooter.add.calls.argsFor(1)).toEqual([
      Link,
      {
        options: {
          'actionPath': 'cancel',
          'label': 'Sign Out',
          'name': 'cancel',
          'type': 'link'
        }
      }
    ]);
  });

  it('does not add signout link when features.hideSignOutLinkInMFA is true, even if `showSignoutLinkInCurrentForm` returns true', () => {
    spyOn(Settings.prototype, 'get').and.callFake(name => {
      return name === 'features.hideSignOutLinkInMFA';
    });

    const fooFooter = renderFooter([], FORMS_FOR_VERIFICATION[0]);

    expect(fooFooter.add).not.toHaveBeenCalled();
  });
});
