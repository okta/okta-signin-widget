import { isOldWebBrowserControl } from './isOldWebBrowserControl';

describe('isOldWebBrowserControl', () => {
  it('returns false if not find "MSIE 7.0" in userAgent', () => {
    jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
    expect(isOldWebBrowserControl()).toBe(false);
  });

  describe('MSIE 7.0', () => {
    beforeEach(() => {
      jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('MSIE 7.0');
    });

    it('returns true when document.all is not available and window.atob is not available', () => {
      Object.defineProperty(global.document, 'all', { value: () => { } });
      Object.defineProperty(global, 'atob', { value: undefined });
      expect(isOldWebBrowserControl()).toBe(true);
    });
  });
});
