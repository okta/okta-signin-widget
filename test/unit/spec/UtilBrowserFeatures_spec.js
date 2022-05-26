import BrowserFeatures from 'util/BrowserFeatures';

describe('util/BrowserFeatures', () => {
  describe('getUserLanguages', () => {
    it('returns a non-read-only array on Chrome/Firefox', () => {
      jest.spyOn(navigator, 'languages', 'get').mockImplementation(() => Object.freeze(['en_US', 'en']));
      let errorThrown = false;
      let result = null;
      try {
        result = BrowserFeatures.getUserLanguages();
        result[0] = 'foo';
      }
      catch (err) {
        errorThrown = true;
      }
      expect(errorThrown).toBe(false);
      expect(result[0]).toBe('foo');
    });
  });
});