import Settings from 'models/Settings';

describe('models/Settings', () => {

  describe('languageCode', () => {
    const setup = (mock=[], options) => {
      const spy = jest.spyOn(navigator, 'languages', 'get').mockImplementation(() => mock);
      const config = {baseUrl: 'http://foo', ...options};
      const settings = new Settings(config);
      return { spy, settings };
    };

    it('defaults to `en` when navigator returns empty array', () => {
      const { spy, settings } = setup([]);
      expect(settings.get('languageCode')).toEqual('en');
      expect(spy).toHaveBeenCalled();
    });

    it('returns `fr` when navigator returns `fr-FR`', () => {
      const { spy, settings } = setup(['fr-FR']);
      expect(settings.get('languageCode')).toEqual('fr');
      expect(spy).toHaveBeenCalled();
    });

    it('returns `fr` when navigator returns `fr`', () => {
      const { spy, settings } = setup(['fr']);
      expect(settings.get('languageCode')).toEqual('fr');
      expect(spy).toHaveBeenCalled();
    });

    it('returns `fr` when navigator returns `FR`', () => {
      const { spy, settings } = setup(['FR']);
      expect(settings.get('languageCode')).toEqual('fr');
      expect(spy).toHaveBeenCalled();
    });

    it('returns `fr` when navigator returns `FR-FR`', () => {
      const { spy, settings } = setup(['FR-FR']);
      expect(settings.get('languageCode')).toEqual('fr');
      expect(spy).toHaveBeenCalled();
    });

    it('returns configured language (via string)', () => {
      const { spy, settings } = setup(['en-US'], {language: 'fr'});
      expect(settings.get('languageCode')).toEqual('fr');
      expect(spy).toHaveBeenCalled();
    });

    it('returns configured language (via function)', () => {
      const { spy, settings } = setup(['en-US'], {language: () => 'fr'});
      expect(settings.get('languageCode')).toEqual('fr');
      expect(spy).toHaveBeenCalled();
    });

    it('returns unlisted configured language (via string)', () => {
      const { spy, settings } = setup(['en-US'], {language: 'fr-FR'});
      expect(settings.get('languageCode')).toEqual('fr-FR');
      expect(spy).toHaveBeenCalled();
    });

    // TODO: OKTA-491150 - special case, explicitly test Dutch (nl)
    it('special case: returns `nl-NL` when navigator returns `nl`', () => {
      const { spy, settings } = setup(['nl']);
      expect(settings.get('languageCode')).toEqual('nl-NL');
      expect(spy).toHaveBeenCalled();
    });

    // TODO: OKTA-491150 - special case, explicitly test Portuguese (pt)
    it('special case: returns `pt-BR` when navigator returns `pt`', () => {
      const { spy, settings } = setup(['pt']);
      expect(settings.get('languageCode')).toEqual('pt-BR');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('backToSignInUri', () => {
    it('can be set using `signOutLink`', () => {
      const settings = new Settings({ baseUrl: 'http://base', signOutLink: 'http://foo' });
      expect(settings.get('backToSignInUri')).toBe('http://foo');
    });
    it('can be set using `backToSignInLink`', () => {
      const settings = new Settings({ baseUrl: 'http://base', backToSignInLink: 'http://foo' });
      expect(settings.get('backToSignInUri')).toBe('http://foo');
    });
    it('`backToSignInLink` takes precedence over `signOutLink`', () => {
      const settings = new Settings({ baseUrl: 'http://base', backToSignInLink: 'http://foo', signOutLink: 'http://bar' });
      expect(settings.get('backToSignInUri')).toBe('http://foo');
    });
  });
});