import BrowserFeatures from '../../../src/util/BrowserFeatures';
import { getLanguageTags } from '../../../src/util/LanguageUtil';

jest.mock('../../../src/util/BrowserFeatures', () => ({
  getUserLanguages: jest.fn(),
}));

const getUserLanguages = BrowserFeatures.getUserLanguages as jest.Mock;
const supportedLanguages = ['en', 'ok-PL', 'es', 'ko', 'ja', 'nl', 'pt', 'zh'];

describe('getLanguageTags', () => {
  it('should return all expanded language codes in the right order when subtag is set as language but browser preferences do not match any part of subtag language', () => {
    getUserLanguages.mockReturnValue(['en-US', 'en']);

    expect(getLanguageTags(
      'zh-CN',
      supportedLanguages,
    )).toEqual(['zh-cn', 'zh', 'en-us', 'en']);
  });

  it('should return set language and subtags of that language first (with subtags first) when browser preference order contains that language', () => {
    // if the browser language is set to en-gb but the widget is set to en, we should still return en-gb first
    // in general, if the browser lanaguage is set to {language}-{region} but we only support {language},
    // we should still return {language}-{region} first
    getUserLanguages.mockReturnValue(['en-GB', 'en-US', 'en']);

    expect(getLanguageTags(
      'en',
      supportedLanguages,
    )).toEqual(['en-gb', 'en-us', 'en']);

    // even if another language is in between related languages, we should sort the language tags related to
    // the set language first
    getUserLanguages.mockReturnValue(['en', 'es', 'es-MX', 'en-GB']);

    expect(getLanguageTags(
      'en',
      supportedLanguages,
    )).toEqual(['en', 'en-gb', 'es', 'es-mx']);
  });

  it('should not return languages that are not in supportedLanguages even when browser preferences contain it', () => {
    getUserLanguages.mockReturnValue(['hr', 'en']);

    expect(getLanguageTags(
      'en',
      supportedLanguages,
    )).toEqual(['en']);
  });

  it('should handle when no language is set', () => {
    getUserLanguages.mockReturnValue(['en-US', 'en']);

    expect(getLanguageTags(
      undefined,
      supportedLanguages,
    )).toEqual(['en-us', 'en']);
  });

  it('should handle when no browser preferences exist', () => {
    getUserLanguages.mockReturnValue([]);

    expect(getLanguageTags(
      'en',
      supportedLanguages,
    )).toEqual(['en']);
  });

  it('should handle when no language is set and no browser preferences exist', () => {
    getUserLanguages.mockReturnValue([]);

    expect(getLanguageTags(
      undefined,
      supportedLanguages,
    )).toEqual(['en']);
  });
});
