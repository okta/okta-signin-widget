import Bundles from '@okta/okta-i18n-bundles';
import { doesTranslationExist, loc } from '../../../src/util/loc';

describe('util/loc (String interpolation)', () => {
  beforeEach(() => {
    Bundles.login['test.simple'] = 'Simple text without parameters';
    Bundles.login['test.single.param'] = 'Hello {0}!';
    Bundles.login['test.multiple.params'] = 'User {0} has {1} new notifications in {2}.';
    Bundles.login['test.repeated.param'] = '{0} plus {0} equals {1}';
    Bundles.login['test.omitted.param'] = 'Sign in using Windows Hello.';
    Bundles.login['test.partial.omitted.params'] = 'Hello {1}, welcome!';
    Bundles.login['test.multidigit.param'] = 'Item {0} and Item {10}';
  });

  afterEach(() => {
    delete Bundles.login['test.simple'];
    delete Bundles.login['test.single.param'];
    delete Bundles.login['test.multiple.params'];
    delete Bundles.login['test.repeated.param'];
    delete Bundles.login['test.omitted.param'];
    delete Bundles.login['test.partial.omitted.params'];
    delete Bundles.login['test.multidigit.param'];
  });

  it('checks if translation exists', () => {
    expect(doesTranslationExist('test.simple', 'login')).toBe(true);
    expect(doesTranslationExist('non.existent.key', 'login')).toBe(false);
  });

  it('returns text without parameters', () => {
    expect(loc('test.simple', 'login')).toBe('Simple text without parameters');
  });

  it('interpolates single parameter correctly', () => {
    expect(loc('test.single.param', 'login', ['Alice'])).toBe('Hello Alice!');
  });

  it('interpolates multiple parameters correctly', () => {
    expect(
      loc('test.multiple.params', 'login', ['Bob', 5, 'Dashboard'])
    ).toBe('User Bob has 5 new notifications in Dashboard.');
  });

  it('replaces repeated parameters globally', () => {
    expect(loc('test.repeated.param', 'login', [2, 4])).toBe('2 plus 2 equals 4');
  });

  it('safely handles special replacement characters like $ in params', () => {
    expect(loc('test.single.param', 'login', ['$100 and $&'])).toBe('Hello $100 and $&!');
  });

  it('throws error and returns L10N_ERROR if required template parameter is missing', () => {
    // Template expects {0}, {1}, {2}, but only 2 params provided -> missing {2}
    expect(loc('test.multiple.params', 'login', ['Bob', 5])).toBe('L10N_ERROR[test.multiple.params]');
  });

  it('throws error and returns L10N_ERROR if required template parameter is undefined or null', () => {
    expect(loc('test.single.param', 'login', [undefined])).toBe('L10N_ERROR[test.single.param]');
    expect(loc('test.single.param', 'login', [null])).toBe('L10N_ERROR[test.single.param]');
  });

  // Issue #3725: Customizing/overriding a string to omit {0} should NOT throw error
  it('does not throw error when template omits parameter (Issue #3725)', () => {
    // Developer provides ['Acme Corp'] as param, but customized string omitted {0}
    const result = loc('test.omitted.param', 'login', ['Acme Corp']);
    expect(result).toBe('Sign in using Windows Hello.');
  });

  it('does not throw error when template omits first parameter but uses second (Issue #3725)', () => {
    // Template uses {1} but omits {0}
    const result = loc('test.partial.omitted.params', 'login', ['Ignored', 'Alice']);
    expect(result).toBe('Hello Alice, welcome!');
  });

  it('handles extra unused parameters gracefully', () => {
    // Template only expects {0}, but caller provided 3 params
    expect(loc('test.single.param', 'login', ['Alice', 'extra1', 'extra2'])).toBe('Hello Alice!');
  });

  it('preserves acceptance of unused parameters when template has no placeholders', () => {
    // Template has no placeholders, but caller provided params
    expect(loc('test.simple', 'login', ['unusedParam1', 'unusedParam2'])).toBe('Simple text without parameters');
  });

  it('triggers L10N_ERROR fallback when multi-digit placeholder like {10} is unbound', () => {
    // Template has {0} and {10}, but only 1 parameter is supplied -> {10} is unbound
    expect(loc('test.multidigit.param', 'login', ['First'])).toBe('L10N_ERROR[test.multidigit.param]');
  });

  it('correctly interpolates multi-digit placeholder when all parameters are supplied', () => {
    const params = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'];
    expect(loc('test.multidigit.param', 'login', params)).toBe('Item P0 and Item P10');
  });

  it('does not re-scan inserted parameter values containing placeholder syntax', () => {
    // Template has {0}, parameter value itself contains '{10}' (e.g. team name or user input)
    expect(loc('test.single.param', 'login', ['Team {10}'])).toBe('Hello Team {10}!');
  });
});
