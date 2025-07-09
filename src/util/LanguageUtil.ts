import Bundles from 'util/Bundles';
import config from 'config/config.json';
import BrowserFeatures from './BrowserFeatures';

import { LanguageCallback, LanguageCode } from 'types';
import Util from './Util';

/**
 * Utility that gets a list of language tag preferences based on the widget properties
 * and browser settings.
 * 
 * NOTE: The language tag and language are related but not necessarilty the same.
 * The language tag specifies the language and region, and may be used for formatting dates
 * and currency, while the language is just the language code used for translations.
 * 
 * @see https://en.wikipedia.org/wiki/IETF_language_tag
 * 
 * @param {string | LanguageCallback | undefined} language 
 * @param {string[]} supportedLanguages
 * @returns {string[]}
 */
export const getLanguageTags = (language: string | LanguageCallback | undefined, supportedLanguages: string[]): string[] => {
  // Get the user's preferred languages from the browser API
  const userLanguages = BrowserFeatures.getUserLanguages().map((userLanguage: string) => {
    // Map "simple" language codes to their full locale equivalents to match the
    // expected format for these specific languages.
    if (userLanguage === 'nl') {
      return 'nl-nl';
    }
    if (userLanguage === 'pt') {
      return 'pt-br';
    }
    return userLanguage.toLowerCase();
  });

  const languagesMap = new Map<string, Set<string>>();

  const addLanguageTag = (languageTag?: string): void => {
    if (!languageTag) {
      return;
    }
    // only get the simple language code, i.e. 'en', 'ja', 'zh'
    const [lang] = languageTag.split('-');

    if (languagesMap.has(lang)) {
      const values = languagesMap.get(lang) ?? new Set<string>();
      values.add(languageTag)
      languagesMap.set(lang, values);
    } else {
      languagesMap.set(lang, new Set<string>([languageTag]));
    }
  };

  const supportedUserLanguages = userLanguages.filter((userLanguage: string) => {
    // remove any user languages tags that do not match a supported language
    return supportedLanguages.some((supportedLang: string) => userLanguage.startsWith(supportedLang.toLowerCase()));
  });

  supportedUserLanguages.forEach(addLanguageTag);

  Util.expandLanguages(supportedUserLanguages).forEach(addLanguageTag);

  // Any developer defined "language" takes highest priority:
  // As a string, i.e. 'en', 'ja', 'zh-CN'
  let languageFromProps: string | undefined;
  if (typeof language !== 'undefined') {
    if (typeof language === 'string') {
      languageFromProps = language.toLowerCase();
    } else if (typeof language === 'function') {
      // As a callback function, which is passed the list of supported
      // languages and detected user languages. This function must return
      // a languageCode, i.e. 'en', 'ja', 'zh-CN'
      languageFromProps = language(supportedLanguages as LanguageCode[], userLanguages)?.toLowerCase();
    }
    // Add the language from widget properties to the languages map
    Util.expandLanguages([languageFromProps]).forEach(addLanguageTag);
  }

  // Add default language, and expand to include any language
  // codes that do not include region, dialect, etc.
  Util.expandLanguages([config.defaultLanguage.toLowerCase()]).forEach(addLanguageTag);

  const languageTags: string[] = [];

  // Put languages related to the language from widget properties first if it was specified
  if (languageFromProps) {
    // Get the simple language code since that's how the languagesMap is keyed
    const [lang] = languageFromProps.split('-');
    // Pull the language tags for the specified language from the map first
    languageTags.push(...languagesMap.get(lang) ?? [])
    // Then remove the language from the map so it doesn't get added again
    languagesMap.delete(lang);
  }

  // Add any remaining language tags from the map to the returned array
  languagesMap.forEach((values: Set<string>) => {
    languageTags.push(...values);
  });

  return languageTags;
};


export const loadLanguage = (appState, settings) => {
  const languageCode = appState.get('languageCode') || settings.get('languageCode') || config.defaultLanguage;
  const i18n = settings.get('i18n');
  const assetBaseUrl = settings.get('assets.baseUrl');
  const assetRewrite = settings.get('assets.rewrite');
  const supportedLanguages = settings.get('supportedLanguages');

  const timeout = setTimeout(function() {
    // Trigger a spinner if we're waiting on a request for a new language.
    appState.trigger('loading', true);
  }, 200);

  return Bundles.loadLanguage(languageCode, i18n, {
    baseUrl: assetBaseUrl,
    rewrite: assetRewrite,
  }, supportedLanguages).then(function() {
    clearTimeout(timeout);
    appState.trigger('loading', false);
    appState.trigger('removeLoading');
  });
  // TODO: what if load language error?
}
