import BaseFooter from 'v2/view-builder/internals/BaseFooter';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import Link from 'v2/view-builder/components/Link';
import { FORMS_FOR_IDENTITY_VERIFICATION } from 'v2/ion/RemediationConstants';

describe('v2/view-builder/internals/BaseFooter', function () {

  let testContext;

  const renderFooter = (links) => {
    const FooFooter = BaseFooter.extend({
      links,
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
    const fooFooter = renderFooter(() => {});

    expect(fooFooter.add).not.toHaveBeenCalled();
  });
  it('adds nothing when links function return empty array', function () {
    const fooFooter = renderFooter(() => {return [];});

    expect(fooFooter.add).not.toHaveBeenCalled();
  });
  it('adds nothing when empty links array', function () {
    const fooFooter = renderFooter([]);

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
    ]);

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

  it('adds signout link when `showSignoutLink` is true', () => {
    spyOn(AppState.prototype, 'get').and.callFake(name => {
      return name === 'showSignoutLink';
    });

    const fooFooter = renderFooter([]);

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

  it('adds other links and signout link when `showSignoutLink` is true', () => {
    spyOn(AppState.prototype, 'get').and.callFake(name => {
      return name === 'showSignoutLink';
    });

    const fooFooter = renderFooter([
      {
        actionPath: 'foo',
        label: 'Foo',
        name: 'foo',
        type: 'link',
      }
    ]);

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

  it('does not add signout link when features.hideSignOutLinkInMFA is true, even if `showSignoutLink` is true', () => {
    spyOn(AppState.prototype, 'get').and.callFake(name => {
      if (name === 'showSignoutLink') {
        return true;
      }
      if (name === 'currentFormName') {
        return FORMS_FOR_IDENTITY_VERIFICATION[0];
      }
      return undefined;
    });

    const fooFooter = renderFooter([]);

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
});
