import { BaseFooter } from 'v2/view-builder/internals';
import AppState from 'v2/models/AppState';
import Settings from 'models/Settings';
import Link from 'v2/view-builder/components/Link';

describe('v2/view-builder/internals/BaseFooter', function() {
  let testContext;

  const renderFooter = (links, shouldShowSignOutLink) => {
    const FooFooter = BaseFooter.extend({
      links,
    });
    spyOn(FooFooter.prototype, 'add');
    spyOn(Settings.prototype, 'get').and.returnValue(false); // doesn't really matter for this test
    spyOn(AppState.prototype, 'shouldShowSignOutLinkInCurrentForm').and.returnValue(shouldShowSignOutLink);
    const fooFooter = new FooFooter({
      appState: testContext.appState,
      settings: testContext.settings,
    });
    fooFooter.render();
    expect(testContext.settings.get).toHaveBeenCalledWith('features.hideSignOutLinkInMFA');
    expect(testContext.settings.get).toHaveBeenCalledWith('features.mfaOnlyFlow');
    return fooFooter;
  };

  beforeEach(() => {
    testContext = {
      appState: new AppState(),
      settings: new Settings({ baseUrl: 'http://localhost:3000' }),
    };
  });

  it('adds nothing when links function return undefined', function() {
    const fooFooter = renderFooter(() => {}, false);

    expect(fooFooter.add).not.toHaveBeenCalled();
  });
  it('adds nothing when links function return empty array', function() {
    const fooFooter = renderFooter(() => {
      return [];
    }, false);

    expect(fooFooter.add).not.toHaveBeenCalled();
  });
  it('adds nothing when empty links array', function() {
    const fooFooter = renderFooter([], false);

    expect(fooFooter.add).not.toHaveBeenCalled();
  });

  it('adds links from `links` array', () => {
    const fooFooter = renderFooter(
      () => [
        {
          actionPath: 'bar',
          label: 'Bar',
          name: 'bar',
          type: 'link',
        },
        undefined,
      ],
      false
    );

    expect(fooFooter.add.calls.count()).toEqual(1);
    expect(fooFooter.add.calls.argsFor(0)).toEqual([
      Link,
      {
        options: {
          actionPath: 'bar',
          label: 'Bar',
          name: 'bar',
          type: 'link',
        },
      },
    ]);
  });

  it('adds signout link when `shouldShowSignOutLinkInCurrentForm` returns true', () => {
    const fooFooter = renderFooter([], true);

    expect(fooFooter.add.calls.count()).toEqual(1);
    expect(fooFooter.add.calls.argsFor(0)).toEqual([
      Link,
      {
        options: {
          actionPath: 'cancel',
          label: 'Back to sign in',
          name: 'cancel',
          type: 'link',
        },
      },
    ]);
  });

  it('adds other links and signout link when `shouldShowSignOutLinkInCurrentForm` returns true', () => {
    const fooFooter = renderFooter(
      [
        {
          actionPath: 'foo',
          label: 'Foo',
          name: 'foo',
          type: 'link',
        },
      ],
      true
    );

    expect(fooFooter.add.calls.count()).toEqual(2);
    expect(fooFooter.add.calls.argsFor(0)).toEqual([
      Link,
      {
        options: {
          actionPath: 'foo',
          label: 'Foo',
          name: 'foo',
          type: 'link',
        },
      },
    ]);
    expect(fooFooter.add.calls.argsFor(1)).toEqual([
      Link,
      {
        options: {
          actionPath: 'cancel',
          label: 'Back to sign in',
          name: 'cancel',
          type: 'link',
        },
      },
    ]);
  });
});
